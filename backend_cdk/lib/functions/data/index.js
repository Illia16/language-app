const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3ListObjects, s3UploadFile, s3DeleteFile, s3GetSignedUrl, cleanUpFileName, getFilePathIfFileIsPresentInBody, responseWithError, getSecret, findUser, findAll, findAllByPrimaryKey, getEventBridgeRuleInfo, getCronExpressionNextRun, findUserByEmail } = require('../helpers');
const { getIncorrectItems, getAudio } = require('../helpers/openai');
const { getRefreshToken } = require('../helpers/auth');
const { getGoogleToken } = require('../helpers/auth.google');
const { getGitHubUserInfo } = require('../helpers/auth.github');
const multipartParser = require('parse-multipart-data');
const jwt = require('jsonwebtoken');

module.exports.handler = async (event, context) => {
    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const secretJwt = await getSecret(`${PROJECT_NAME}--ssm-auth--${STAGE}`);
    const dbData = process.env.DB_DATA;
    const dbUsers = process.env.DB_USERS;
    const s3Files = process.env.S3_FILES;

    // Google envs
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    //

    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.CLOUDFRONT_URL];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const action = event.httpMethod;
    const isBase64Encoded = event.isBase64Encoded;

    // Handle data
    let data;
    let user = '';
    let userRole = '';
    let userTierPremium = false;
    let thirdPartyAuth = '';

    // Regex
    const englishRegex = /[a-zA-Z]/;
    const chineseRegex = /[\u4E00-\u9FFF]/;

    // Response obj
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": headerOrigin,
        },
        body: null,
    };

    // Check if token is valid
    let isTokenValid = false;
    const authToken = headers['authorization'] || headers['Authorization'];
    if (!authToken) {
        return responseWithError('401', 'No token provided.', headerOrigin)
    }
    const token = authToken.split(' ')[1];
    jwt.verify(token, secretJwt, (err, decoded) => {
        if (err) {
            response = responseWithError('401', 'Token is invalid.', headerOrigin)
            return
        } else {
            userRole = decoded.role || 'user';
            user = decoded.user;
            isTokenValid = true;
            thirdPartyAuth = decoded.auth_3rd_party || '';
        }
    })
    if (!isTokenValid) {
        return responseWithError('401', 'Invalid token.', headerOrigin);
    }
    //

    // Check if user account is not "delete"
    const userInfo = await findUser(dbUsers, user)
    if (userInfo[0].role === 'delete') {
        return responseWithError('410', 'User account is to be deleted.', headerOrigin);
    }

    if (thirdPartyAuth === 'google') {
        try {
            const refreshToken = await getRefreshToken(dbUsers, user, userInfo[0].userId, 'google');
            if (!refreshToken) {
                throw new Error('No Google refresh token found for user');
            }

            const tokens = await getGoogleToken({
                refresh_token: refreshToken,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: 'https://' + event.requestContext.domainName + event.requestContext.path,
            });

            console.log('____+tokens', tokens);
        } catch (error) {
            return responseWithError('500', error.message || 'Google authentication failed', headerOrigin);
        }
    }

    if (thirdPartyAuth === 'github') {
        try {
            const github_access_token = await getRefreshToken(dbUsers, user, userInfo[0].userId, 'github');
            if (!github_access_token) {
                throw new Error('No GitHub refresh token found for user');
            }

            // Check if token is valid by getting user info
            await getGitHubUserInfo(github_access_token)
        } catch (error) {
            return responseWithError('500', error.message || 'GitHub authentication failed', headerOrigin);
        }
    }

    if (action === 'POST' || action === 'PUT') {
        if (isBase64Encoded) {
            const contentType = headers['Content-Type'] || headers['content-type'];
            const boundary = contentType.split('boundary=')[1];

            const getRawData = Buffer.from(event.body, 'base64');
            const parsedData = multipartParser.parse(getRawData, boundary);
            data = parsedData.reduce(function (result, currentObject) {
                if (currentObject.name !== 'file') {
                    result[currentObject.name] = currentObject.data.toString('utf8');

                    if (currentObject.name === 'item') {
                        const strItem = currentObject.data.toString('utf8');

                        // Always get audio for Chineese lang, but for other(English only for now) get only is it's a sentence
                        if (chineseRegex.test(strItem)) {
                            result.getAudioAI = true;
                        } else {
                            result.getAudioAI = strItem.split(' ').length > 2 ? true : false;
                        }
                    }
                } else {
                    result.files = [{
                        fieldname: currentObject.name,
                        filename: currentObject.filename,
                        contentType: currentObject.type,
                        content: currentObject.data,
                    }]
                }

                return result;
            }, {});
        }
    } else {
        data = JSON.parse(event.body);
    }

    if (action === 'GET') {
        const userData = await findUser(dbData, user);
        const data = await Promise.all(
            userData
                .map((async (el) => {
                    if (el.filePath) {
                        const url = await s3GetSignedUrl(s3Files, el.filePath);
                        el.fileUrl = url;
                    }

                    if (el.incorrectItems) {
                        el.incorrectItems = JSON.parse(el.incorrectItems);
                    }

                    return el;
                }))
        );

        response.body = JSON.stringify({ success: true, data: data });
    }

    if (action === 'POST') {
        // fetch user premiumStatus
        userTierPremium = userInfo[0].userTier === 'premium';
        //

        try {
            const checkIfnoAttachmentButFileExistsInS3 = await s3ListObjects(s3Files, `audio/${cleanUpFileName(data.item)}`);
            const existingFileNameS3 = checkIfnoAttachmentButFileExistsInS3?.Contents?.[0]?.Key;

            // Save files(if any) to S3, also do not upload it if it's already in S3 (different user added it)
            const filePath = getFilePathIfFileIsPresentInBody(data);
            if (filePath && !existingFileNameS3) {
                // TODO: check if there's already a file. If there's, rename that file (or delete and upload the new one)
                await s3UploadFile(s3Files, filePath, data.files[0].content);
            }
            //

            // get audio of text from AI if user is premium
            let audioFilePathAi;
            let incorrectItems = null;
            if (userTierPremium) {
                if (!filePath && !existingFileNameS3 && data.getAudioAI) {
                    const audioFile = await getAudio(data.item)
                    const fileNameCleaned = cleanUpFileName(data?.item);
                    audioFilePathAi = `audio/${fileNameCleaned}/${fileNameCleaned}.mp3`;
                    await s3UploadFile(s3Files, audioFilePathAi, audioFile);
                }

                // get incorrect answers of the correct item from AI
                incorrectItems = await getIncorrectItems(data.item);
            }

            let resDataMsg = '';
            if (userRole === 'admin') {
                // adding to all users that have the same lang as admin
                const params = {
                    TableName: dbData,
                    ProjectionExpression: '#aliasForUser, #langMother, #langStudying',
                    ExpressionAttributeNames: {
                        '#aliasForUser': 'user',
                        '#langMother': 'userMotherTongue',
                        '#langStudying': 'languageStudying'
                    }
                };

                const command = new ScanCommand(params);
                const res = await docClient.send(command);
                const uniqueUsers = [
                    ...new Set(res.Items.map(item => {
                        return item.userMotherTongue === data.userMotherTongue && item.languageStudying === data.languageStudying ? item.user : null
                    })
                        .filter(el => el))
                ];

                // cover a case where user(admin) doesn't have any data for the languageStudying.
                if (!uniqueUsers.length) {
                    uniqueUsers.push(user)
                }
                const input = {
                    RequestItems: {
                        [dbData]: uniqueUsers.map(username => {
                            return {
                                PutRequest: {
                                    Item: {
                                        user: username,
                                        itemID: data.itemID,
                                        item: data.item,
                                        itemCorrect: data.itemCorrect,
                                        incorrectItems: JSON.stringify(incorrectItems),
                                        itemType: data.itemType,
                                        itemTypeCategory: data.itemTypeCategory,
                                        userMotherTongue: data.userMotherTongue,
                                        languageStudying: data.languageStudying,
                                        level: data.level,
                                        getAudioAI: data.getAudioAI,
                                        ...(data.itemTranscription && { itemTranscription: data.itemTranscription }),
                                        ...((filePath && !existingFileNameS3) && { filePath: filePath }),
                                        ...(existingFileNameS3 && { filePath: existingFileNameS3 }),
                                        ...((!filePath && !existingFileNameS3 && audioFilePathAi) && { filePath: audioFilePathAi }),
                                    }
                                }
                            }
                        })
                    }
                };
                const commandWrite = new BatchWriteCommand(input);
                await docClient.send(commandWrite);
                resDataMsg = `Successfully added ${data.item} by ${user}.`;
            } else {
                const input = {
                    "Item": {
                        user: user,
                        itemID: data.itemID,
                        item: data.item,
                        itemCorrect: data.itemCorrect,
                        incorrectItems: JSON.stringify(incorrectItems),
                        itemType: data.itemType,
                        itemTypeCategory: data.itemTypeCategory,
                        userMotherTongue: data.userMotherTongue,
                        languageStudying: data.languageStudying,
                        level: data.level,
                        getAudioAI: data.getAudioAI,
                        ...(data.itemTranscription && { itemTranscription: data.itemTranscription }),
                        ...((filePath && !existingFileNameS3) && { filePath: filePath }),
                        ...(existingFileNameS3 && { filePath: existingFileNameS3 }),
                        ...((!filePath && !existingFileNameS3 && audioFilePathAi) && { filePath: audioFilePathAi }),
                    },
                    "TableName": dbData
                };

                const command = new PutCommand(input);
                await docClient.send(command);
                resDataMsg = `Successfully added ${data.item} by ${user}.`;
            }

            response.body = JSON.stringify({ success: true, data: resDataMsg });
        } catch (error) {
            return responseWithError('500', "Failed to post data", headerOrigin);
        }
    }

    if (action === 'PUT') {
        try {
            // Save files(if any) to S3
            const filePath = getFilePathIfFileIsPresentInBody(data);
            if (filePath) {
                // TODO: check if there's already a file in S3 while "item" has changed. If there's, rename that file (or delete and upload the new one), rename with the new "item" name
                await s3UploadFile(s3Files, filePath, data.files[0].content);
            }
            //

            const expressionAttributeNames = {};
            const expressionAttributeValues = {};
            const updateExpressions = [];

            for (const key in data) {
                if (!['user', 'itemID'].includes(key)) {
                    const attributeName = key === 'files' ? 'filePath' : key;
                    const attributeValue = (key === 'files' && filePath) ? filePath : data[key];

                    const placeholderName = `#${attributeName}`;
                    const placeholderValue = `:${attributeName}`;

                    expressionAttributeNames[placeholderName] = attributeName;
                    expressionAttributeValues[placeholderValue] = attributeValue;
                    updateExpressions.push(`${placeholderName} = ${placeholderValue}`);
                }
            }

            const input = {
                TableName: dbData,
                Key: {
                    user: user,
                    itemID: data.itemID,
                },
                UpdateExpression: `SET ${updateExpressions.join(", ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: "ALL_NEW"
            };

            const command = new UpdateCommand(input);
            const res = await docClient.send(command);
            response.body = JSON.stringify({ success: true, data: res.Attributes });
        } catch (error) {
            return responseWithError('500', "Failed to PUT data", headerOrigin);
        }
    }

    if (action === 'DELETE') {
        const input = {
            "RequestItems": {
                [dbData]: [{
                    DeleteRequest: {
                        Key: {
                            user: user,
                            itemID: data.itemID,
                        }
                    }
                }]
            }
        };

        const command = new BatchWriteCommand(input);
        const res = await docClient.send(command);

        // (TODO: do not delete for now since other users may wanna use the audio file OR if deleting the file, then delete the item from every's user DB (above^))
        // Delete from S3
        // if (userRole === 'admin' && data.filePath) {
        //     await s3DeleteFile(s3Files, data.filePath)
        // }
        //
        response.body = JSON.stringify({ success: true, message: 'Data deleted successfully' });
    }

    return response;
};