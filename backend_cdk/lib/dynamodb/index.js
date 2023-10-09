const { DynamoDBClient, BatchWriteItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { GetCommand, BatchGetCommand, BatchWriteCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    console.log('-----------------------------');
    console.log('Language app dynamoDB handler');
    console.log('event', event);
    console.log('context', context);
    console.log('-----------------------------');

    console.log('event.body', event.body);
    const body = JSON.parse(event.body);
    const env = event.requestContext.stage;
    console.log('env', env);

    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
    };

    const action = event.httpMethod;
    if (action === 'GET') {
        const user = event.queryStringParameters.user;
        const languageStudying = event.queryStringParameters.languageStudying;

        const params = {
            TableName: "db-personal-project--language-app-test",
            ...(languageStudying && { FilterExpression: "contains(languageStudying, :filterExp)" }),
            KeyConditionExpression:
              "#userName = :usr",
            ExpressionAttributeValues: {
              ":usr": user,
              ...(languageStudying && { ":filterExp": languageStudying, }),
            },
            ExpressionAttributeNames: { "#userName": "user" },
            ConsistentRead: true,
        };

        const command = new QueryCommand(params);
        const res = await docClient.send(command);
        console.log('res GET QUERY:', res);
        response.body = JSON.stringify(res.Items);
    }

    if (action === 'POST') {
        const input = {
            "RequestItems": {
              "db-personal-project--language-app-test": body.map(el => {
                return {
                    PutRequest: {
                        Item: {
                            user: { "S": el.user },
                            itemID: { "S": el.itemID },
                            item: { "S": el.item },
                            itemCorrect: { "S": el.itemCorrect },
                            itemType: { "S": el.itemType },
                            itemTypeCategory: { "S": el.itemTypeCategory },
                            languageMortherTongue: { "S": el.languageMortherTongue },
                            languageStudying: { "S": el.languageStudying },
                            level: { "S": el.level },
                        }
                    }
                }
              })
            }
        };

        const command = new BatchWriteItemCommand(input);
        const res = await client.send(command);
        console.log('res POST:', res);
        response.body = JSON.stringify({});
    }

    if (action === 'PUT') {
        const input = {
            TableName: "db-personal-project--language-app-test",
            Key: {
                user: {
                    "S": body.user
                },
                itemID: {
                    "S": body.itemID
                }
            }, 
            UpdateExpression: "SET #attributeName = :newValue",
            ExpressionAttributeNames: {
                "#attributeName": "level",
            },
            ExpressionAttributeValues: {
                ":newValue": {
                    "S": body.level
                }
            },
            ReturnValues: "UPDATED_NEW"
        };

        const command = new UpdateItemCommand(input);
        const res = await client.send(command);
        console.log('res PUT (UPDATE):', res);
        response.body = JSON.stringify(res.Attributes);
    }

    if (action === 'DELETE') {
        const input = {
            "RequestItems": {
              "db-personal-project--language-app-test": body.map(el => {
                return {
                    DeleteRequest: {
                        Key: {
                            user: { "S": el.user },
                            itemID: { "S": el.itemID }
                        }
                    }
                }
              })
            }
        };

        const command = new BatchWriteItemCommand(input);
        const res = await client.send(command);
        console.log('res DELETE:', res);
        response.body = JSON.stringify({});
    }

    console.log("response: " + JSON.stringify(response))
    return response;
};
