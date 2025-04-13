
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const { findAll, findAllByPrimaryKey } = require('../helpers');

module.exports.handler = async (event, context) => {
    // Environment variables
    const STAGE = process.env.STAGE;
    const PROJECT_NAME = process.env.PROJECT_NAME;
    const dbData = process.env.DB_DATA;
    const dbUsers = process.env.DB_USERS;
    const s3Files = process.env.S3_FILES;

    const allUsers = await findAll(dbUsers);

    async function deleteUser(user) {
        const inputDeleteUser = {
            TableName: dbUsers,
            Key: {
                user: user.user,
                userId: user.userId
            },
        };
        const commandInputDeleteUser = new DeleteCommand(inputDeleteUser);
        await docClient.send(commandInputDeleteUser);
        return user.user;
    }

    let deletedItemsCount = 0;
    async function deleteItemsForUser(user) {
        const userItems = await findAllByPrimaryKey(dbData, user.user);
        deletedItemsCount += userItems.length;

        const deleteCommands = userItems.map(async (el) => {
            const inputDeleteItem = {
                TableName: dbData,
                Key: {
                    user: el.user,
                    itemID: el.itemID
                },
            };

            const commandInputDeleteItem = new DeleteCommand(inputDeleteItem);
            return docClient.send(commandInputDeleteItem);
        });

        return Promise.all(deleteCommands);
    }

    const usersToDelete = allUsers.filter(user => user && user.role === 'delete');

    if (!usersToDelete.length) return { deletedUsers: [], deletedItems: 0 };
    const deletedUsers = await Promise.all(usersToDelete.map(deleteUser));
    await Promise.all(usersToDelete.map(deleteItemsForUser));

    return {
        success: true,
        deletedUsers,
        deletedItemsCount,
        timestamp: new Date().toISOString()
    };
};
