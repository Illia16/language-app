const { DynamoDBClient, BatchWriteItemCommand, PutItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3GetFile, s3ListObjects, s3UploadFile, s3DeleteFile, s3GetSignedUrl, cleanUpFileName, getFilePathIfFileIsPresentInBody, responseWithError } = require('../helpers');
const multipartParser = require('parse-multipart-data');
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken');

module.exports = async (event, context) => {
    console.log('-----------------------------');
    console.log('Auth handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    // let body;
    const env = process.env.env;
    const projectName = process.env.projectName;
    const allowedOrigins = ["http://localhost:3000", process.env.cloudfrontTestUrl, process.env.cloudfrontProdUrl];
    const headers = event.headers;
    const headerOrigin = allowedOrigins.includes(headers?.origin) ? headers?.origin : null
    const body = JSON.parse(event.body);
    const secretJwt = process.env.secret;
    // const action = event.httpMethod;
    // const isBase64Encoded = event.isBase64Encoded;

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
            TableName: `db-users-${projectName}-${env}`,
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
            const token = jwt.sign(res.Items[0], secretJwt, { expiresIn: '5m' });
            response.body = JSON.stringify({success: true, data: {user: res.Items[0].user, token: token}});
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
                            user: { "S": genInvitationCode },
                            userId: { "S": genInvitationCode },
                            role: { "S": 'user' },
                        },
                        "ReturnConsumedCapacity": "TOTAL",
                        "TableName": `db-users-${projectName}-${env}`
                    };
        
                    const command = new PutItemCommand(input);
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

    // if (event.path === '/auth/register') {}
    // if (event.path === '/auth/delete-account') {}
    // if (event.path === '/auth/forgot-password') {}
    // if (event.path === '/auth/change-password') {}

    console.log('response', response);
    return response;
};
