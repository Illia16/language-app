
// DynamoDB
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const clientDynamoDB = new DynamoDBClient({});
// SES
const { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const clientEmail = new SESClient({});
// Helpers
const { findUserByEmail } = require('../helpers');
// Cfg
const config = require('../config');

module.exports = async (event, context) => {
    console.log('-----------------------------');
    console.log('Handle queue SQS handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    const { eventName, dbUsers, userEmail, user, userId, password } = JSON.parse(event.Records[0].body);
    console.log('SQS data:', eventName, dbUsers, userEmail, user, userId, password);
    if (eventName === 'forgot-password') {
        const resUserByEmail = await findUserByEmail(dbUsers, userEmail);
    
        // if found, sent to user their creds. TODO: add a url where they can set new creds themselves.
        if (resUserByEmail && resUserByEmail?.userEmail) {
            const input = {
                Source: config.senderEmail,
                Destination: {
                    ToAddresses: [resUserByEmail.userEmail],
                },
                Message: {
                    Subject: {
                        Data: "Language App - Forgot Password?",
                        Charset: "UTF-8",
                    },
                    Body: {
                        Text: {
                            Data: `You recently requested that you forgot your password. For email: ${resUserByEmail.userEmail}; login: ${resUserByEmail.user}, password: ${resUserByEmail.password}. Consider log in now and changing your password.`,
                            Charset: "UTF-8",
                        },
                    },
                },
            };
    
            const command = new SendEmailCommand(input);
            const response = await clientEmail.send(command);
            console.log('response forgot-password:', response);
        }
    }

    if (eventName === 'change-password') {
        const inputChangePW = {
            TableName: dbUsers,
            Key: {
                user: user,
                userId: userId,
            },
            UpdateExpression: "SET #attributeName = :newValue",
            ExpressionAttributeNames: {
                "#attributeName": 'password',
            },
            ExpressionAttributeValues: {
                ":newValue": password
            },
            // UpdateExpression: "set password = :pw",
            // ExpressionAttributeValues: {
            //   ":pw": password,
            // },
            ReturnValues: "ALL_NEW"
        };

        const commandChangePW = new UpdateCommand(inputChangePW);
        const resChangePW = await clientDynamoDB.send(commandChangePW);
        console.log('resChangePW1', resChangePW);
    }

    if (eventName === 'verify-email') {        
        const verifyEmailIdentityCommand = new VerifyEmailIdentityCommand({ EmailAddress: userEmail });
        try {
            const res = await clientEmail.send(verifyEmailIdentityCommand);
            return res;
        } catch (err) {
            console.log("Failed to verify email identity.", err);
            return err;
        }
    }
};
