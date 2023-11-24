const { DynamoDBClient, BatchWriteItemCommand, PutItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3GetFile, s3ListObjects, s3UploadFile, s3DeleteFile, s3GetSignedUrl, cleanUpFileName, getFilePathIfFileIsPresentInBody } = require('../helpers');
const parser = require('lambda-multipart-parser');

module.exports = async (event, context) => {
    console.log('-----------------------------');
    console.log('Language app dynamoDB handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    let body;
    const env = process.env.env;
    const projectName = process.env.projectName;
    const admin = process.env.admin;

    const allowedOrigins = ["http://localhost:3000", "https://d3uhxucz1lwio6.cloudfront.net"];
    const origin = event.headers.origin;
    const action = event.httpMethod;

    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : null,
        },
        body: null,
    };

    if (action === 'POST' || action === 'PUT') {
        // const contentType = event.headers['Content-Type'] || event.headers['content-type'];
        // const boundary = contentType.split('boundary=')[1];

        const result = await parser.parse(event);
        console.log('_____result', result);
        // body = result;
        if (!result.files.length) {
            delete result.files;
        }

        body = result;
        console.log('_____body', body);
        // body = [parseMultipartFormData(event.body, boundary)];
        // console.log('____formData in the body', body);
    } else {
        body = JSON.parse(event.body);
    }

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

        const data = await Promise.all(
            res.Items
            .map((async (el) => {
                if (el.filePath) {
                    const url = await s3GetSignedUrl(`s3-files-${projectName}-${env}`, el.filePath);
                    el.fileUrl = url;
                }
                return el;
            }))
        );

        response.body = JSON.stringify({success: true, data: data});
    }

    if (action === 'POST') {
        try {
            const checkIfnoAttachmentButFileExistsInS3 = await s3ListObjects(`s3-files-${projectName}-${env}`, `audio/${cleanUpFileName(body.item)}`);
            const existingFileNameS3 = checkIfnoAttachmentButFileExistsInS3?.Contents?.[0]?.Key;

            // Save files(if any) to S3, also do not upload it if it's already in S3 (different user added it)
            const filePath = getFilePathIfFileIsPresentInBody(body);
            if (filePath && !existingFileNameS3) {
                // TODO: check if there's already a file. If there's, rename that file (or delete and upload the new one)
                await s3UploadFile(`s3-files-${projectName}-${env}`, filePath, body.files[0].content);
            }
            //

            const input = {
                "Item": {
                    user: { "S": body.user },
                    itemID: { "S": body.itemID },
                    item: { "S": body.item },
                    itemCorrect: { "S": body.itemCorrect },
                    itemType: { "S": body.itemType },
                    itemTypeCategory: { "S": body.itemTypeCategory },
                    languageMortherTongue: { "S": body.languageMortherTongue },
                    languageStudying: { "S": body.languageStudying },
                    level: { "S": body.level },
                    ...(body.itemTranscription && { itemTranscription: { "S": body.itemTranscription }}),
                    ...((filePath && !existingFileNameS3) && { filePath: { "S": filePath } }),
                    ...(existingFileNameS3 && { filePath: { "S": existingFileNameS3 } }),
                },
                "ReturnConsumedCapacity": "TOTAL",
                "TableName": `db-${projectName}-${env}`
            };

            const command = new PutItemCommand(input);
            const res = await client.send(command);
            console.log('res POST:', res);
            response.body = JSON.stringify({success: true});
        } catch (error) {
            response.statusCode = '500';
            response.body = JSON.stringify({
                success: false,
                message: error.message,
            })
        }
    }

    if (action === 'PUT') {
        try {
            // Save files(if any) to S3
            const filePath = getFilePathIfFileIsPresentInBody(body);
            if (filePath) {
                // TODO: check if there's already a file in S3 while "item" has changed. If there's, rename that file (or delete and upload the new one), rename with the new "item" name
                await s3UploadFile(`s3-files-${projectName}-${env}`, filePath, body.files[0].content);
            }
            //

            const allEls = [];
            for (const key in body) {
                if (!['user', 'itemID'].includes(key)) {
                    const attributeName = key === 'files' ? 'filePath' : key;
                    const attributeValue = (key === 'files' && filePath) ? filePath : body[key];

                    const input = {
                        TableName: `db-${projectName}-${env}`,
                        Key: {
                            user: {
                                "S": body.user
                            },
                            itemID: {
                                "S": body.itemID
                            },
                        },
                        UpdateExpression: "SET #attributeName = :newValue",
                        ExpressionAttributeNames: {
                            "#attributeName": attributeName,
                        },
                        ExpressionAttributeValues: {
                            ":newValue": {
                                "S": attributeValue
                            }
                        },
                        ReturnValues: "ALL_NEW"
                    };

                    const command = new UpdateItemCommand(input);
                    const res = await client.send(command);
                    allEls.push(res.Attributes);
                }
            }

            response.body = JSON.stringify({success: true, data: allEls});
        } catch (error) {
            response.statusCode = '500';
            response.body = JSON.stringify({
                success: false,
                message: error.message,
            })
        }
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

        // Delete from S3
        await Promise.all(
            body
                .filter(el => el.user === admin && el.filePath)
                .map(async (el) => {
                    await s3DeleteFile(`s3-files-${projectName}-${env}`, el.filePath)
                })
        );
        //
        console.log('res DELETE:', res);
        response.body = JSON.stringify({success: true});
    }

    return response;
};
