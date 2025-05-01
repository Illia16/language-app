
// DynamoDB
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const clientDynamoDB = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(clientDynamoDB);
// SES
const { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const clientEmail = new SESClient({});
const jwt = require('jsonwebtoken');
// Helpers
const { findUserByEmail, getSecret, saveBatchItems } = require('../helpers');
const { isAiDataValid } = require('../helpers/openai');

module.exports.handler = async (event, context) => {
    const { eventName, dbUsers, username, userEmail, user, userId, password, toBeDeleted, data } = JSON.parse(event.Records[0].body);
    if (eventName === 'forgot-password') {
        const secretJwt = await getSecret(`${process.env.PROJECT_NAME}--ssm-auth--${process.env.STAGE}`);
        const resUserByEmail = await findUserByEmail(dbUsers, userEmail);

        if (resUserByEmail && resUserByEmail.userEmail) {
            const token = jwt.sign({ user: resUserByEmail.user, ...(resUserByEmail.role === 'admin' && { role: resUserByEmail.role }) }, secretJwt, { expiresIn: '5m' });

            const input = {
                Source: `${process.env.PROJECT_NAME}@devemail.illusha.net`,
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
                            Click <a href=${process.env.CLOUDFRONT_URL}/change-password?token=${token}&userId=${resUserByEmail.userId}&userMotherTongue=${resUserByEmail.userMotherTongue}>here</a> to set a new password. The link expires in 5 minutes.`,
                            Charset: "UTF-8",
                        },
                    },
                },
            };

            const command = new SendEmailCommand(input);
            const res = await clientEmail.send(command);
            return res;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User not found'
            })
        }
    }

    if (eventName === 'delete-account') {
        try {
            const inputSetToDeleteAccount = {
                TableName: dbUsers,
                Key: {
                    user: username,
                    userId: userId,
                },
                UpdateExpression: "SET #attributeName = :newValue",
                ExpressionAttributeNames: {
                    "#attributeName": 'role',
                },
                ExpressionAttributeValues: {
                    ":newValue": toBeDeleted
                },
                ReturnValues: "ALL_NEW"
            };

            const commandToDeleteAccount = new UpdateCommand(inputSetToDeleteAccount);
            const res = await docClient.send(commandToDeleteAccount);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'User deleted',
                    data: res,
                })
            }
        } catch (err) {
            return err;
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
            ReturnValues: "ALL_NEW"
        };

        const commandChangePW = new UpdateCommand(inputChangePW);
        const res = await docClient.send(commandChangePW);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Password changed',
                data: res,
            })
        }
    }

    if (eventName === 'verify-email') {
        const verifyEmailIdentityCommand = new VerifyEmailIdentityCommand({ EmailAddress: userEmail });
        try {
            const res = await clientEmail.send(verifyEmailIdentityCommand);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Email verification sent',
                    data: res,
                })
            }
        } catch (err) {
            return err;
        }
    }

    if (eventName === 'parse-ai-data') {
        // Runs when:
        // 1) AI retuns invalid data (vs what is expected)
        // 2) When redriving manually from DLQ. When redriving, ensure data passes "isAiDataValid" (correct num of items, object shape etc.)
        if (!isAiDataValid(data.aiData, data.userData).isValid) {
            // throw new Error("Failed to validate AI data. Please, redrive manually.");
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Failed to validate AI data. Please, redrive manually.',
                })
            }
        }

        try {
            await saveBatchItems(
                data.aiData.items,
                data.userData.userTierPremium,
                data.userData.user,
                data.userData.userMotherTongue,
                data.userData.languageStudying,
            );

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Items saved to DB',
                })
            }
        } catch (error) {
            throw new Error("Failed to saveBatchItems from SQS");
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Unknown event name',
        })
    }
};
