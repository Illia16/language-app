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
    const env = process.env.env;
    const projectName = process.env.projectName;
    console.log('env', env);

    const allowedOrigins = ["http://localhost:3000", "https://d3uhxucz1lwio6.cloudfront.net"];
    const origin = event.headers.origin;

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : null,
        },
        body: null,
    };

    const action = event.httpMethod;
    if (action === 'GET') {
        const user = event.queryStringParameters.user;
        const languageStudying = event.queryStringParameters.languageStudying;

        const params = {
            TableName: `db-${projectName}-${env}`,
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
              [`db-${projectName}-${env}`]: body.map(el => {
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
        const allEls = await Promise.all(
            body.map(async (el) => {
                const input = {
                    TableName: `db-${projectName}-${env}`,
                    Key: {
                        user: {
                            "S": el.user
                        },
                        itemID: {
                            "S": el.itemID
                        }
                    },
                    UpdateExpression: "SET #attributeName = :newValue",
                    ExpressionAttributeNames: {
                        "#attributeName": el.keyToUpdate.name,
                    },
                    ExpressionAttributeValues: {
                        ":newValue": {
                            "S": el.keyToUpdate.value
                        }
                    },
                    ReturnValues: "ALL_NEW"
                };

                const command = new UpdateItemCommand(input);
                const res = await client.send(command);
                console.log('res PUT (UPDATE):', res);
                return res.Attributes;
            })
        )

        response.body = JSON.stringify(allEls);
    }

    if (action === 'DELETE') {
        const input = {
            "RequestItems": {
              [`db-${projectName}-${env}`]: body.map(el => {
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
