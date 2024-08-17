const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
// const { SESClient, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const clientSQS = new SQSClient({});
// const clientSES = new SESClient({});
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { responseWithError, checkIfUserExists, cleanUpFileName, s3UploadFile, getSecret } = require('../helpers');
const { getIncorrectItems, getAudio } = require('../helpers/openai');
const { checkPassword, hashPassword } = require('../helpers/auth');
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken');

module.exports.handler = async (event, context) => {
    console.log('-----------------------------');
    console.log('Auth handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const secretJwt = await getSecret(`${PROJECT_NAME}--secret-auth--${STAGE}`);
    const SQS_URL = process.env.SQS_URL;

    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.CLOUDFRONT_URL];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const body = JSON.parse(event.body);

    // AWS Resource names
    const dbUsers = `${PROJECT_NAME}--db-users--${STAGE}`;
    const dbData = `${PROJECT_NAME}--db-data--${STAGE}`;
    const s3Files = `${PROJECT_NAME}--s3-files--${STAGE}`;

    // Response obj
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": headerOrigin,
        },
        body: null,
    };

    if (event.path === '/users/login') {
        const username = body.user;
        const password = body.password;

        const params = {
            TableName: dbUsers,
            KeyConditionExpression: "#userName = :usr",
            ExpressionAttributeValues: {
              ":usr": username,
            },
            ExpressionAttributeNames: { "#userName": "user" },
            ConsistentRead: true,
        };

        const command = new QueryCommand(params);
        const res = await docClient.send(command);
        console.log('res /users/login GET QUERY:', res);

        const isPwCorrect = await checkPassword(res.Items[0].password, password);
        if (res.Items && res.Items.length && isPwCorrect) {
            const userObj = res.Items[0];
            const token = jwt.sign({user: userObj.user, ...(userObj.role === 'admin' && {role: userObj.role})}, secretJwt, { expiresIn: '25 days' });
            response.body = JSON.stringify({success: true, data: {user: res.Items[0].user, userId: res.Items[0].userId, userMotherTongue: res.Items[0].userMotherTongue, token: token}});
        } else {
            response = responseWithError('500', 'Either user does not exist or wrong password.', headerOrigin)
        }
    }

    if (event.path === '/users/generate-invitation-code') {
        const authToken = headers.authorization || headers.Authorization;
        console.log('authToken', authToken);
        if (!authToken) {
            response = responseWithError('401', 'Token is invalid.', headerOrigin)
            return
        }
        const token = authToken.split(' ')[1];

        try {
            const decoded = jwt.verify(token, secretJwt);
            console.log('Token is ok.', decoded);
            if (decoded.role !== 'admin') {
                console.log('User is not an admin...');
                response = responseWithError('401', `User ${decoded.user} is not authorized to do this action.`, headerOrigin)
            } else {
                const genInvitationCode = uuidv4();
                console.log('genInvitationCode', genInvitationCode);
                const input = {
                    "Item": {
                        user: genInvitationCode,
                        userId: genInvitationCode,
                        role: 'user',
                    },
                    "ReturnConsumedCapacity": "TOTAL",
                    "TableName": dbUsers
                };
                console.log('genInvitationCode input:', input);
    
                const command = new PutCommand(input);
                const res = await client.send(command);
                console.log('res POST generate-invitation-code:', res);
                response.body = JSON.stringify({success: true});
            }
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                console.log('Err, token is invalid:', error.message);
                response = responseWithError('401', 'Token is invalid.', headerOrigin);
            } else {
                console.error('Internal server error:', error.message);
                response.statusCode = '500';
                response.body = JSON.stringify({
                    success: false,
                    message: error.message,
                });
            }
        }
    }

    if (event.path === '/users/register') {
        const username = body.user;
        const password = body.password;
        const userEmail = body.userEmail;
        const invitationCode = body.invitationCode;
        const userMotherTongue = body.userMotherTongue;

        // Check if username is available
        const resCheckUserName = await checkIfUserExists(dbUsers, username, userEmail);
        console.log('resCheckUserName', resCheckUserName);

        if (resCheckUserName.Items && resCheckUserName.Items.length) {
            response = responseWithError('500', 'Either username already taken or inivation code is wrong.', headerOrigin)
        } else {
            // Check inv code
            const resInvCode = await checkIfUserExists(dbUsers, invitationCode);
            console.log('resInvCode', resInvCode);

            if (resInvCode.Items && resInvCode.Items.length) {
                // if inv code is correct, delete it and create a user
                const inputDeleteInvCode = {
                    TableName: dbUsers,
                    Key: {
                        user: invitationCode,
                        userId: invitationCode,
                    },
                }

                const commandDeleteInvCode = new DeleteCommand(inputDeleteInvCode);
                const resDeleteInvCode = await client.send(commandDeleteInvCode);
                console.log('resDeleteInvCode', resDeleteInvCode);

                const hashedPassword = await hashPassword(password)
                console.log('hashedPassword - register', hashedPassword);

                const inputCreateUser = {
                    Item: {
                        user: username,
                        userId: username+"___"+invitationCode,
                        password: hashedPassword,
                        userMotherTongue: userMotherTongue,
                        role: 'user',
                        userEmail: userEmail,
                        isPremium: false,
                    },
                    ReturnConsumedCapacity: "TOTAL",
                    TableName: dbUsers
                };

                const commandCreateUser = new PutCommand(inputCreateUser);
                const resCreateUser = await client.send(commandCreateUser);
                console.log('resCreateUser', resCreateUser);
                response.body = JSON.stringify({success: true, data: resCreateUser.Attributes});

                // put 1 welcome item for the new user
                const welcomeItem = "I like learning English every day"
                const audioFile = await getAudio(welcomeItem)
                const fileNameCleaned = cleanUpFileName(welcomeItem);
                const audioFilePathAi = `audio/${fileNameCleaned}/${fileNameCleaned}.mp3`;
                await s3UploadFile(s3Files, audioFilePathAi, audioFile);
                const incorrectItems = await getIncorrectItems("I like learning English every day");

                const input = {
                    "Item": {
                        user: username,
                        itemID: fileNameCleaned + "___" + "welcome_item",
                        item: welcomeItem,
                        itemCorrect: "Here goes translation to your mother tongue of the item you want to add.",
                        incorrectItems: JSON.stringify(incorrectItems),
                        itemType: "Tenses",
                        itemTypeCategory: "Present Simple",
                        userMotherTongue: userMotherTongue,
                        languageStudying: 'en',
                        level: '0',
                        getAudioAI: true,
                        filePath: audioFilePathAi,
                    },
                    "TableName": dbData
                };

                const command = new PutCommand(input);
                await client.send(command);
                // 

                // send verification email to the user
                const inputSQS = {
                    QueueUrl: SQS_URL,
                    MessageBody: JSON.stringify({eventName: 'verify-email', userEmail: userEmail}),
                };
                const commandSQS = new SendMessageCommand(inputSQS);
                await clientSQS.send(commandSQS);
            } else {
                response = responseWithError('500', 'Either username already taken or inivation code is wrong.', headerOrigin)
            }
        }
    }
    // if (event.path === '/users/delete-account') {}
    if (event.path === '/users/forgot-password') {
        const inputSQS = {
            QueueUrl: SQS_URL,
            MessageBody: JSON.stringify({eventName: 'forgot-password', dbUsers: dbUsers, userEmail: body.userEmail}),
        };
        const commandSQS = new SendMessageCommand(inputSQS);
        await clientSQS.send(commandSQS);
    }

    if (event.path === '/users/change-password') {
        const authToken = headers.authorization || headers.Authorization;
        console.log('authToken', authToken);
        if (!authToken) {
            response = responseWithError('401', 'Token is invalid.', headerOrigin)
            return
        }
        const token = authToken.split(' ')[1];

        const hashedPassword = await hashPassword(body.password)
        console.log('hashedPassword - change-password', hashedPassword);

        try {
            const decoded = jwt.verify(token, secretJwt);
            console.log('Token is ok.', decoded);
            const inputSQS = {
                QueueUrl: SQS_URL,
                MessageBody: JSON.stringify({
                    eventName: 'change-password', 
                    dbUsers: dbUsers, 
                    user: decoded.user, 
                    userId: body.userId, 
                    password: hashedPassword
                }),
            };
            const commandSQS = new SendMessageCommand(inputSQS);
            await clientSQS.send(commandSQS);
          } catch(err) {
            console.log('Err, token is invalid:', err);
            response = responseWithError('401', 'Token is invalid.', headerOrigin)
            return
          }
    }

    console.log('response', response);
    return response;
};