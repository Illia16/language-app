const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
// const { SESClient, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const clientSQS = new SQSClient({});
// const clientSES = new SESClient({});
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { responseWithError, cleanUpFileName, s3UploadFile, getSecret, findUser, findAll, findAllByPrimaryKey, getEventBridgeRuleInfo, getCronExpressionNextRun } = require('../helpers');
const { getIncorrectItems, getAudio } = require('../helpers/openai');
const { checkPassword, hashPassword } = require('../helpers/auth');
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken');

module.exports.handler = async (event, context) => {
    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const secretJwt = await getSecret(`${PROJECT_NAME}--ssm-auth--${STAGE}`);
    const SQS_URL = process.env.SQS_URL;
    const dbData = process.env.DB_DATA;
    const dbUsers = process.env.DB_USERS;
    const s3Files = process.env.S3_FILES;
    const eventBridgeManageUsers = process.env.EB_MANAGE_USERS_NAME;

    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.CLOUDFRONT_URL];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const body = JSON.parse(event.body);

    // Response obj
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": headerOrigin,
        },
        body: null,
    };

    const getToken = () => (headers.authorization || headers.Authorization || '').split(' ')[1] || false;

    if (event.path === '/users/login') {
        const username = body.user;
        const password = body.password;

        const userInfo = await findUser(dbUsers, username)

        if (!userInfo.length) {
            return responseWithError('500', 'Either user does not exist or wrong password.', headerOrigin)
        }

        const isPwCorrect = await checkPassword(userInfo[0].password, password);
        if (!isPwCorrect) {
            return responseWithError('500', 'Either user does not exist or wrong password.', headerOrigin)
        }

        const userObj = userInfo[0];

        let accountDeleteAt;
        if (userObj.role === 'delete') {
            // Currently it tells that expression only, not the next run date
            const eventBridgeManageUsersData = await getEventBridgeRuleInfo(eventBridgeManageUsers);
            accountDeleteAt = getCronExpressionNextRun(eventBridgeManageUsersData.ScheduleExpression)
        }

        const token = jwt.sign({ user: userObj.user, ...(userObj.role === 'admin' && { role: userObj.role }) }, secretJwt, { expiresIn: '25 days' });
        response.body = JSON.stringify({
            success: true,
            data: {
                user: userObj.user,
                userId: userObj.userId,
                userMotherTongue: userObj.userMotherTongue,
                token: token, role:
                    userObj.role,
                ...(userObj.role === 'delete' && { accountDeletionTime: accountDeleteAt })
            }
        });
    }

    if (event.path === '/users/generate-invitation-code') {
        const token = getToken();
        if (!token) {
            return responseWithError('401', 'Token is missing.', headerOrigin)
        }

        try {
            const decoded = jwt.verify(token, secretJwt);
            if (decoded.role !== 'admin') {
                return responseWithError('401', `User ${decoded.user} is not authorized to do this action.`, headerOrigin)
            } else {
                const genInvitationCode = uuidv4();
                const input = {
                    "Item": {
                        user: genInvitationCode,
                        userId: genInvitationCode,
                        role: 'user',
                    },
                    "ReturnConsumedCapacity": "TOTAL",
                    "TableName": dbUsers
                };

                const command = new PutCommand(input);
                const res = await docClient.send(command);
                response.body = JSON.stringify({ success: true });
            }
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return responseWithError('401', 'Token is invalid.', headerOrigin);
            } else {
                console.log('Internal server error:', error.message);
                return responseWithError('500', error.message, headerOrigin);
            }
        }
    }

    if (event.path === '/users/register') {
        const username = body.user;
        const password = body.password;
        const userEmail = body.userEmail;
        const invitationCode = body.invitationCode;
        const userMotherTongue = body.userMotherTongue;

        // Check if username is available (also check is email is already used for another account)
        const findByUsernameAndEmailRes = await findUser(dbUsers, username, userEmail);

        if (findByUsernameAndEmailRes && findByUsernameAndEmailRes.length) {
            return responseWithError('500', 'Either username already taken or inivation code is wrong.', headerOrigin)
        } else {
            // Check inv code
            const resInvCode = await findUser(dbUsers, invitationCode)

            if (resInvCode && resInvCode.length) {
                // if inv code is correct, delete it and create a user
                const inputDeleteInvCode = {
                    TableName: dbUsers,
                    Key: {
                        user: invitationCode,
                        userId: invitationCode,
                    },
                }

                const commandDeleteInvCode = new DeleteCommand(inputDeleteInvCode);
                const resDeleteInvCode = await docClient.send(commandDeleteInvCode);
                const hashedPassword = await hashPassword(password)

                const inputCreateUser = {
                    Item: {
                        user: username,
                        userId: username + "___" + invitationCode,
                        password: hashedPassword,
                        userMotherTongue: userMotherTongue,
                        role: 'user',
                        userEmail: userEmail,
                        userTier: 'default',
                    },
                    ReturnConsumedCapacity: "TOTAL",
                    TableName: dbUsers
                };

                const commandCreateUser = new PutCommand(inputCreateUser);
                const resCreateUser = await docClient.send(commandCreateUser);
                response.body = JSON.stringify({ success: true, data: resCreateUser.Attributes });

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
                await docClient.send(command);
                //

                // send verification email to the user
                const inputSQS = {
                    QueueUrl: SQS_URL,
                    MessageBody: JSON.stringify({ eventName: 'verify-email', userEmail: userEmail }),
                };
                const commandSQS = new SendMessageCommand(inputSQS);
                await clientSQS.send(commandSQS);
            } else {
                return responseWithError('500', 'Either username already taken or inivation code is wrong.', headerOrigin)
            }
        }
    }
    if (event.path === '/users/delete-account') {
        const token = getToken();
        if (!token) {
            return responseWithError('401', 'Token is missing.', headerOrigin)
        }

        try {
            const decoded = jwt.verify(token, secretJwt);
        } catch (err) {
            return responseWithError('401', 'Token is invalid.', headerOrigin)
        }

        const username = body.user;
        const userId = body.userId;
        const toBeDeleted = body.toBeDeleted ? 'delete' : 'user';

        const inputSQS = {
            QueueUrl: SQS_URL,
            MessageBody: JSON.stringify({ eventName: 'delete-account', dbUsers: dbUsers, username: username, userId: userId, toBeDeleted: toBeDeleted }),
        };
        const commandSQS = new SendMessageCommand(inputSQS);

        try {
            await clientSQS.send(commandSQS);
            response.body = JSON.stringify({ success: true, message: 'processed' });
        } catch (error) {
            return responseWithError('500', "Something went wrong.", headerOrigin)
        }
    }

    if (event.path === '/users/forgot-password') {
        const inputSQS = {
            QueueUrl: SQS_URL,
            MessageBody: JSON.stringify({ eventName: 'forgot-password', dbUsers: dbUsers, userEmail: body.userEmail }),
        };
        const commandSQS = new SendMessageCommand(inputSQS);

        try {
            await clientSQS.send(commandSQS);
            response.body = JSON.stringify({ success: true, message: 'processed' });
        } catch (error) {
            return responseWithError('500', "Something went wrong.", headerOrigin)
        }
    }

    if (event.path === '/users/change-password') {
        const token = getToken();
        if (!token) {
            return responseWithError('401', 'Token is missing.', headerOrigin)
        }

        const hashedPassword = await hashPassword(body.password)

        try {
            const decoded = jwt.verify(token, secretJwt);
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
            response.body = JSON.stringify({ success: true, message: 'processed' });
        } catch (err) {
            return responseWithError('401', 'Token is invalid.', headerOrigin)
        }
    }

    return response;
};
