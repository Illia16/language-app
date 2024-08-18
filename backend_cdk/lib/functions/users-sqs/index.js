
// DynamoDB
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const clientDynamoDB = new DynamoDBClient({});
// SES
const { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const clientEmail = new SESClient({});
const jwt = require('jsonwebtoken');
// Helpers
const { findUserByEmail, getSecret } = require('../helpers');

module.exports.handler = async (event, context) => {
    console.log('-----------------------------');
    console.log('Handle queue SQS handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    const { eventName, dbUsers, userEmail, user, userId, password } = JSON.parse(event.Records[0].body);
    console.log('SQS data:', eventName, dbUsers, userEmail, user, userId, password);
    if (eventName === 'forgot-password') {
        const secretJwt = await getSecret(`${process.env.PROJECT_NAME}--secret-auth--${process.env.STAGE}`);
        const resUserByEmail = await findUserByEmail(dbUsers, userEmail);

        if (resUserByEmail && resUserByEmail.userEmail) {
            const token = jwt.sign({user: resUserByEmail.user, ...(resUserByEmail.role === 'admin' && {role: resUserByEmail.role})}, secretJwt, { expiresIn: '5m' });

            const input = {
                Source: process.env.SENDER_EMAIL,
                Destination: {
                    ToAddresses: [resUserByEmail.userEmail],
                },
                Message: {
                    Subject: {
                        Data: "Language App - Forgot Password?",
                        Charset: "UTF-8",
                    },
                    Body: {
                        Html: {
                            Data: `You recently requested that you forgot your password. 
                            Click <a href=${process.env.CLOUDFRONT_URL}/change-password?token=${token}&userId=${resUserByEmail.userId}&userMotherTongue=${resUserByEmail.userMotherTongue}>here</a> to set a new password. ${resUserByEmail}. The link expires in 5 minutes.`,
                            Charset: "UTF-8",
                        },
                    },
                },
            };
    
            const command = new SendEmailCommand(input);
            await clientEmail.send(command);
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
        await clientDynamoDB.send(commandChangePW);
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
