const bcryptjs = require('bcryptjs');

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

module.exports = {
    saveRefreshToken: async (refreshToken, dbUsers, user, userId, provider) => {
        try {
            const getInput = {
                TableName: dbUsers,
                Key: {
                    user: user,
                    userId: userId,
                }
            };

            const getCommand = new GetCommand(getInput);
            const currentUser = await docClient.send(getCommand);

            let authProviders = {};

            // If auth_3rd_party already exists, use it; otherwise start with empty object
            if (currentUser.Item && currentUser.Item.auth_3rd_party) {
                authProviders = currentUser.Item.auth_3rd_party;
            }

            // Add or update the token for the specific provider
            authProviders[provider] = refreshToken;

            // Update the user record with the new auth_3rd_party object
            const inputUpdateRefreshToken = {
                TableName: dbUsers,
                Key: {
                    user: user,
                    userId: userId,
                },
                UpdateExpression: "SET auth_3rd_party = :authProviders",
                ExpressionAttributeValues: {
                    ":authProviders": authProviders
                }
            };

            const commandUpdateRefreshToken = new UpdateCommand(inputUpdateRefreshToken);
            await docClient.send(commandUpdateRefreshToken);
        } catch (error) {
            console.error('Failed to save refresh token:', error);
            throw new Error('Failed to save refresh token');
        }
    },
    getRefreshToken: async (dbUsers, user, userId, provider) => {
        try {
            const getInput = {
                TableName: dbUsers,
                Key: {
                    user: user,
                    userId: userId,
                }
            };

            const getCommand = new GetCommand(getInput);
            const currentUser = await docClient.send(getCommand);

            if (currentUser.Item && currentUser.Item.auth_3rd_party && currentUser.Item.auth_3rd_party[provider]) {
                return currentUser.Item.auth_3rd_party[provider];
            }

            return null;
        } catch (error) {
            console.error('Failed to get refresh token:', error);
            return null;
        }
    },
    hashPassword: async (password) => {
        const saltRounds = 10;
        const salt = await bcryptjs.genSalt(saltRounds);
        const hashedPassword = await bcryptjs.hash(password, salt);
        return hashedPassword;
    },
    checkPassword: async (hashedPassword, userPassword) => {
        const match = await bcryptjs.compare(userPassword, hashedPassword);
        return match;
    },
}