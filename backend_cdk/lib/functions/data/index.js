const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, ScanCommand, BatchWriteCommand, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3ListObjects, s3UploadFile, s3DeleteFile, s3GetSignedUrl, cleanUpFileName, getFilePathIfFileIsPresentInBody, responseWithError, getSecret, findUser } = require('../helpers');
const { getIncorrectItems, getAudio } = require('../helpers/openai')
const multipartParser = require('parse-multipart-data');
const jwt = require('jsonwebtoken');

module.exports.handler = async (event, context) => {
    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const secretJwt = await getSecret(`${PROJECT_NAME}--secret-auth--${STAGE}`);
    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.CLOUDFRONT_URL];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const action = event.httpMethod;
    const isBase64Encoded = event.isBase64Encoded;

    // AWS Resource names
    const dbData = `${PROJECT_NAME}--db-data--${STAGE}`;
    const dbUsers = `${PROJECT_NAME}--db-users--${STAGE}`;
    const s3Files = `${PROJECT_NAME}--s3-files--${STAGE}`;

    // Handle data
    let data;
    let user = '';
    let userRole = '';
    let userTierPremium = false;

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
        }
    })
    if (!isTokenValid) {
        return responseWithError('401', 'Invalid token.', headerOrigin);
    }
    //

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

        response.body = JSON.stringify({success: true, data: data});
    }

    if (action === 'POST') {
        // fetch user premiumStatus
        const userInfo = await findUser(dbUsers, user);
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

            const allEls = [];
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
                    .filter(el=>el))
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
                                    ...((filePath && !existingFileNameS3) && { filePath: filePath } ),
                                    ...(existingFileNameS3 && { filePath: existingFileNameS3 } ),
                                    ...((!filePath && !existingFileNameS3 && audioFilePathAi) && { filePath: audioFilePathAi } ),
                                }
                            }
                        }
                      })
                    }
                };
                const commandWrite = new BatchWriteCommand(input);
                const resWrite = await docClient.send(commandWrite);
                allEls.push(resWrite.ItemCollectionMetrics);
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
                        ...((filePath && !existingFileNameS3) && { filePath: filePath } ),
                        ...(existingFileNameS3 && { filePath: existingFileNameS3 } ),
                        ...((!filePath && !existingFileNameS3 && audioFilePathAi) && { filePath: audioFilePathAi } ),
                    },
                    "TableName": dbData
                };

                const command = new PutCommand(input);
                const res = await docClient.send(command);
                allEls.push(res.Attributes);
            }

            response.body = JSON.stringify({success: true, data: allEls});
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

            const allEls = [];
            for (const key in data) {
                if (!['user', 'itemID'].includes(key)) {
                    const attributeName = key === 'files' ? 'filePath' : key;
                    const attributeValue = (key === 'files' && filePath) ? filePath : data[key];

                    const input = {
                        TableName: dbData,
                        Key: {
                            user: user,
                            itemID: data.itemID,
                        },
                        UpdateExpression: "SET #attributeName = :newValue",
                        ExpressionAttributeNames: {
                            "#attributeName": attributeName,
                        },
                        ExpressionAttributeValues: {
                            ":newValue": attributeValue
                        },
                        ReturnValues: "ALL_NEW"
                    };

                    const command = new UpdateCommand(input);
                    const res = await docClient.send(command);
                    allEls.push(res.Attributes);
                }
            }

            response.body = JSON.stringify({success: true, data: allEls});
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
                            user: user ,
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
        response.body = JSON.stringify({success: true});
    }

    return response;
};
