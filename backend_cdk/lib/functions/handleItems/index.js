const { DynamoDBClient, BatchWriteItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3GetFile, s3ListObjects, s3UploadFile, s3DeleteFile, s3GetSignedUrl, decodeBase64, cleanUpFileName } = require('../helpers');

module.exports = async (event, context) => {
    console.log('-----------------------------');
    console.log('Language app dynamoDB handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    const body = JSON.parse(event.body);
    const env = process.env.env;
    const projectName = process.env.projectName;
    const admin = process.env.admin;

    const allowedOrigins = ["http://localhost:3000", "https://d3uhxucz1lwio6.cloudfront.net"];
    const origin = event.headers.origin;

    let response = {
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
            // Save files(if any) to S3
            await Promise.all(
                body
                .filter(el => el.file && el.file.name)
                .map(async (el) => {
                    const fileNameCleaned = cleanUpFileName(el.item);
                    const file_name = fileNameCleaned + '.' + el.file.name.split('.').at(-1);
                    const filename_path = (`audio/${fileNameCleaned}/${file_name}`).toLowerCase().trim();
                    const base64_encoded_data = el.file.base64.split(',')[1];
                    const fileItself = decodeBase64(base64_encoded_data);
                    await s3UploadFile(`s3-files-${projectName}-${env}`, filename_path, fileItself);
                })
            )
            //

            const input = {
                "RequestItems": {
                  [`db-${projectName}-${env}`]: await Promise.all(body.map(async (el) => {
                    const hasAttachment = el.file && el.file.name ? true : false;
                    const fileNameCleaned = cleanUpFileName(el.item);
                    const file_name = hasAttachment ? fileNameCleaned + '.' + el.file.name.split('.').at(-1) : null;

                    const checkIfnoAttachmentButFileExistsInS3 = await s3ListObjects(`s3-files-${projectName}-${env}`, `audio/${fileNameCleaned}`);
                    const existingFileNameS3 = checkIfnoAttachmentButFileExistsInS3?.Contents?.[0]?.Key;

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
                                ...(el.itemTranscription && { itemTranscription: { "S": el.itemTranscription }}),
                                ...(hasAttachment && { filePath: { "S": `audio/${fileNameCleaned}/${file_name}`.toLowerCase() } }),
                                ...(existingFileNameS3 && { filePath: { "S": existingFileNameS3 } }),
                            }
                        }
                    }
                  }))
                }
            };
    
            const command = new BatchWriteItemCommand(input);
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
            await Promise.all(
                body
                .filter(el => el.keyToUpdate.name === 'filePath' && Object.keys(el.keyToUpdate.value).length)
                .map(async (el) => {
                    const fileNameCleaned = cleanUpFileName(el.item);
                    const file_name = el.keyToUpdate.value ? fileNameCleaned + '.' + el.keyToUpdate.value.name.split('.').at(-1) : null;
                    const filename_path = (`audio/${fileNameCleaned}/${file_name}`).toLowerCase().trim();
                    const base64_encoded_data = el.keyToUpdate.value.base64.split(',')[1];
                    const fileItself = decodeBase64(base64_encoded_data);
                    await s3UploadFile(`s3-files-${projectName}-${env}`, filename_path, fileItself);
                })
            );
            //

            const allEls = await Promise.all(
                body.map(async (el) => {
                    const fileNameCleaned = cleanUpFileName(el.item);
                    const hasAttachment = (el.keyToUpdate.name === 'filePath' && Object.keys(el.keyToUpdate.value).length) ? true : false;
                    const file_name = hasAttachment ? fileNameCleaned + '.' + el.keyToUpdate.value.name.split('.').at(-1) : null;

                    const input = {
                        TableName: `db-${projectName}-${env}`,
                        Key: {
                            user: {
                                "S": el.user
                            },
                            itemID: {
                                "S": el.itemID
                            },
                        },
                        UpdateExpression: "SET #attributeName = :newValue",
                        ExpressionAttributeNames: {
                            "#attributeName": el.keyToUpdate.name,
                        },
                        ExpressionAttributeValues: {
                            ":newValue": {
                                "S": hasAttachment ? `audio/${fileNameCleaned}/${file_name}`.toLowerCase() : el.keyToUpdate.value
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

    console.log("response: " + JSON.stringify(response))
    return response;
};