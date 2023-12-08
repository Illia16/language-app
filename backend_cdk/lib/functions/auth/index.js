const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { responseWithError } = require('../helpers');
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken');

module.exports = async (event, context) => {
    console.log('-----------------------------');
    console.log('Auth handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    // Environment variables
    const env = process.env.env;
    const projectName = process.env.projectName;
    const secretJwt = process.env.secret;

    // Event obj and CORS
    const headers = event.headers;
    const allowedOrigins = ["http://localhost:3000", process.env.cloudfrontTestUrl, process.env.cloudfrontProdUrl];
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const body = JSON.parse(event.body);

    // AWS Resource names
    const dbUsers = `${projectName}--db-users--${env}`;

    // Response obj
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": headerOrigin,
        },
        body: null,
    };

    if (event.path === '/auth/login') {
        const username = body.user;
        const password = body.password

        const params = {
            TableName: dbUsers,
            FilterExpression: "password = :filterExp",
            KeyConditionExpression: "#userName = :usr",
            ExpressionAttributeValues: {
              ":usr": username,
              ":filterExp": password,
            },
            ExpressionAttributeNames: { "#userName": "user" },
            ConsistentRead: true,
        };

        const command = new QueryCommand(params);
        const res = await docClient.send(command);
        console.log('res /auth/login GET QUERY:', res);

        if (res.Items && res.Items.length) {
            // const token = jwt.sign(res.Items[0], secretJwt, { expiresIn: '30 days' });
            const userObj = res.Items[0];
            const token = jwt.sign({user: userObj.user, ...(userObj.role === 'admin' && {role: userObj.role})}, secretJwt, { expiresIn: '15m' });
            response.body = JSON.stringify({success: true, data: {user: res.Items[0].user, userMotherTongue: res.Items[0].userMotherTongue, token: token}});
        } else {
            response = responseWithError('500', 'Either user does not exist or wrong password.', headerOrigin)
        }
    }

    if (event.path === '/auth/generate-invitation-code') {
        const authToken = headers.authorization || headers.Authorization;
        console.log('authToken', authToken);
        if (!authToken) {
            response = responseWithError('401', 'Token is invalid.', headerOrigin)
            return
        }
        const token = authToken.split(' ')[1];
        jwt.verify(token, secretJwt, async (err, decoded) => {
            if (err) {
                console.log('Err, token is invalid:', err);
                response = responseWithError('401', 'Token is invalid.', headerOrigin)
                return
            } else {
                console.log('Token is ok.', decoded);

                if (decoded.role !== 'admin') {
                    console.log('User is not an admin...');
                    response = responseWithError('401', `User ${decoded.user} is not authorized to do this action.`, headerOrigin)
                    return
                }

                const genInvitationCode = uuidv4();
                try {
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
                    const res = await client.send(command);
                    console.log('res POST generate-invitation-code:', res);
                    response.body = JSON.stringify({success: true});
                } catch (error) {
                    response.statusCode = '500';
                    response.body = JSON.stringify({
                        success: false,
                        message: error.message,
                    })
                }
            }
        })
    }

    if (event.path === '/auth/register') {
        const username = body.user;
        const password = body.password;
        const invitationCode = body.invitationCode;
        const userMotherTongue = body.userMotherTongue;

        const getParams = (v) => {
            return {
                TableName: dbUsers,
                KeyConditionExpression: "#userName = :usr",
                ExpressionAttributeValues: {
                    ":usr": v,
                },
                ExpressionAttributeNames: {
                    "#userName": "user"
                },
                ConsistentRead: true,
            };
        }
        // Check if username is available
        const commandCheckUserName = new QueryCommand(getParams(username));
        const resCheckUserName = await docClient.send(commandCheckUserName);
        console.log('resCheckUserName', resCheckUserName);
        // 

        if (resCheckUserName.Items && resCheckUserName.Items.length) {
            response = responseWithError('500', 'Either username already taken or inivation code is wrong.', headerOrigin)
        } else {
            // Check inv code
            const commandInvCode = new QueryCommand(getParams(invitationCode));
            const resInvCode = await docClient.send(commandInvCode);
            console.log('resInvCode', resInvCode);
            // 

            if (resInvCode.Items && resInvCode.Items.length) {
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

                const inputCreateUser = {
                    Item: {
                        user: username,
                        userId: username+"___"+invitationCode,
                        password: password,
                        userMotherTongue: userMotherTongue,
                        role: 'user',
                    },
                    ReturnConsumedCapacity: "TOTAL",
                    TableName: dbUsers
                };

                const commandCreateUser = new PutCommand(inputCreateUser);
                const resCreateUser = await client.send(commandCreateUser);
                console.log('resCreateUser', resCreateUser);
                response.body = JSON.stringify({success: true, data: resCreateUser.Attributes});
            } else {
                response = responseWithError('500', 'Either username already taken or inivation code is wrong.', headerOrigin)
            }
        }
    }
    // if (event.path === '/auth/delete-account') {}
    // if (event.path === '/auth/forgot-password') {}
    // if (event.path === '/auth/change-password') {}

    console.log('response', response);
    return response;
};
