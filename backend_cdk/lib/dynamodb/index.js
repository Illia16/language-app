const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    console.log('-----------------------------');
    console.log('Language app dynamoDB handler');
    console.log('event', event);
    console.log('context', context);
    console.log('-----------------------------');

    const env = event.requestContext.stage;
    console.log('env', env);

    const response = {
        statusCode: 200,
        body: null,
    };

    const action = event.httpMethod;
    if (action === 'GET') {
        const command = new GetCommand({
            TableName: "dynamoDb-personal-project--language-app-test",
            Key: {
                user: event.queryStringParameters.user,
                languageStudying: event.queryStringParameters.languageStudying,
            },
        });
        
        const res = await docClient.send(command);
        console.log('res GET:', res);
        response.body = JSON.stringify(res);
    }

    if (action === 'POST') {
        const command = new PutCommand({
            TableName: "dynamoDb-personal-project--language-app-test",
            Item: {
                user: event.queryStringParameters.user,
                languageStudying: event.queryStringParameters.languageStudying,
            },
        });
        
        const res = await docClient.send(command);
        console.log('res POST:', res);
        response.body = JSON.stringify(res);
    }

    if (action === 'PUT') {
        const command = new UpdateCommand({
            TableName: "dynamoDb-personal-project--language-app-test",
            Key: {
                user: event.queryStringParameters.user,
                languageStudying: event.queryStringParameters.languageStudying,
            },
            UpdateExpression: "set newVal = :value",
            ExpressionAttributeValues: {
                ":value": event.queryStringParameters.level,
            },
            ReturnValues: "ALL_NEW",
        });
        
        const res = await docClient.send(command);
        console.log('res PUT:', res);
        response.body = JSON.stringify(res);
    }

    if (action === 'DELETE') {
        const command = new DeleteCommand({
            TableName: "dynamoDb-personal-project--language-app-test",
            Key: {
                user: event.queryStringParameters.user,
                languageStudying: event.queryStringParameters.languageStudying,
            },
        });
        
        const res = await docClient.send(command);
        console.log('res DELETE:', res);
        response.body = JSON.stringify(res);
    }

    console.log("response: " + JSON.stringify(response))
    return response;
};
