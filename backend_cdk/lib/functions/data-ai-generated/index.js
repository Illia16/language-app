const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3UploadFile, cleanUpFileName, responseWithError, getSecret, findUser } = require('../helpers');
const { getAudio, getAIDataBasedOnUserInput } = require('../helpers/openai')
const jwt = require('jsonwebtoken');

module.exports.handler = async (event) => {
    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const secretJwt = await getSecret(`${PROJECT_NAME}--secret-auth--${STAGE}`);
    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.CLOUDFRONT_URL];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const action = event.httpMethod;

    // AWS Resource names
    const dbData = `${PROJECT_NAME}--db-data--${STAGE}`;
    const dbUsers = `${PROJECT_NAME}--db-users--${STAGE}`;
    const s3Files = `${PROJECT_NAME}--s3-files--${STAGE}`;

    // Handle data
    const payload = JSON.parse(event.body);
    let user = '';
    let userTierPremium = false;

    // Response obj
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": headerOrigin,
        },
        body: null,
    };

    // Check if token is valid
    const authToken = headers['authorization'] || headers['Authorization'];
    if (!authToken) {
        return responseWithError('401', 'No token provided.', headerOrigin)
    }
    const token = authToken.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretJwt);
        user = decoded.user;
    } catch (error) {
        return responseWithError('401', `Failed to validate token. ${error}`, headerOrigin)
    }
    // 

    if (action === 'POST') {
        if (!payload.prompt || payload.prompt.length > 100 || !payload.userMotherTongue || !payload.languageStudying || !payload.numberOfItems || Number(payload.numberOfItems) > 20) {
            return responseWithError('401', `Payload is invalid.`, headerOrigin)
        }

        // fetch user premiumStatus
        try {
            const userInfo = await findUser(dbUsers, user);
            userTierPremium = userInfo[0].userTier === 'premium';
        } catch (error) {
            return responseWithError('401', `Failed to fetch user premiumStatus. ${error}`, headerOrigin)
        }
        //

        let resultsAIdata;
        try {
            resultsAIdata = await getAIDataBasedOnUserInput({
                prompt: payload.prompt,
                userMotherTongue: payload.userMotherTongue,
                languageStudying: payload.languageStudying,
                numberOfItems: payload.numberOfItems,
            })
            console.log('resultsAIdata', resultsAIdata);
        } catch (error) {
            return responseWithError('401', `Failed to get AI data. ${error}`, headerOrigin)
        }

        try {
            const allEls = [];
            const input = {
                RequestItems: {
                  [dbData]: await Promise.all(resultsAIdata.map(async (el) => {
                    let audioFilePathAi = '';

                    // get audio of text from AI if user is premium
                    if (userTierPremium) {
                        const audioFile = await getAudio(el.item)
                        const fileNameCleaned = cleanUpFileName(el.item);
                        audioFilePathAi = `audio/${fileNameCleaned}/${fileNameCleaned}.mp3`;
                        await s3UploadFile(s3Files, audioFilePathAi, audioFile);
                    }
                    return {
                        PutRequest: {
                            Item: {
                                user: user,
                                item: el.item,
                                itemID: new Date().toISOString() + "___" + el.item.slice(0,10).replaceAll(" ", "_"),
                                itemCorrect: el.itemCorrect,
                                incorrectItems: JSON.stringify(el.incorrectItems),
                                itemType: el.itemType,
                                itemTypeCategory: el.itemTypeCategory,
                                userMotherTongue: payload.userMotherTongue,
                                languageStudying: payload.languageStudying,
                                level: 0,
                                itemTranscription: el.itemTranscription,
                                filePath: audioFilePathAi,
                                getAudioAI: true, // existing in DB
                            }
                        }
                    }
                  }))
                }
            };
            const commandWrite = new BatchWriteCommand(input);
            const resWrite = await docClient.send(commandWrite);
            allEls.push(resWrite.ItemCollectionMetrics);
            response.body = JSON.stringify({success: true, data: allEls});
        } catch (error) {
            return responseWithError('500', `Failed to post AI data. ${error}`, headerOrigin);
        }
    }

    return response;
};
