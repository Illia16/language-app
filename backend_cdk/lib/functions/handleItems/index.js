const { DynamoDBClient, BatchWriteItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { QueryCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { s3UploadFile, s3DeleteFile, s3GetSignedUrl, decodeBase64, cleanUpFileName, createPresignedUrlWithClient, putFile, parseMultipartFormData} = require('../helpers');


module.exports = async (event, context) => {
    console.log('-----------------------------');
    console.log('Language app dynamoDB handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    let body;
    const action = event.httpMethod;
    const env = process.env.env;
    const projectName = process.env.projectName;
    const admin = process.env.admin;
    const allowedOrigins = ["http://localhost:3000", "https://d3uhxucz1lwio6.cloudfront.net"];
    const origin = event.headers.origin;

    if (action === 'POST') {
        const contentType = event.headers['Content-Type'] || event.headers['content-type'];
        const boundary = contentType.split('boundary=')[1];
        body = [parseMultipartFormData(event.body, boundary)];
        console.log('____formData in the body', body);
    } else {
        body = JSON.parse(event.body);
    }

    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : null,
        },
        body: null,
    };

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
                .filter(el => el.file && el.file.filename)
                .map(async (el) => {
                    const fileNameCleaned = cleanUpFileName(el.item);
                    const file_name = fileNameCleaned + '.' + el.file.filename.split('.').at(-1);
                    const filename_path = (`audio/${fileNameCleaned}/${file_name}`).toLowerCase().trim();
                    // const base64_encoded_data = el.file.base64.split(',')[1];
                    // const fileItself = decodeBase64(base64_encoded_data);
                    // await s3UploadFile(`s3-files-${projectName}-${env}`, filename_path, fileItself);
        
                    console.log('el.file', el.file);
                    const clientUrl = await createPresignedUrlWithClient(`s3-files-${projectName}-${env}`, filename_path);
                    await putFile(clientUrl, JSON.stringify(el.file));
                })
            )
            //

            const input = {
                "RequestItems": {
                  [`db-${projectName}-${env}`]: body.map(el => {
                    const hasAttachment = el.file && el.file.filename ? true : false;
                    const fileNameCleaned = cleanUpFileName(el.item);
                    const file_name = hasAttachment ? fileNameCleaned + '.' + el.file.filename.split('.').at(-1) : null;
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
                                ...(hasAttachment && { filePath: { "S": `audio/${fileNameCleaned}/${file_name}`.toLowerCase() } }),
                            }
                        }
                    }
                  })
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
                .filter(el => el.keyToUpdate.name === 'filePath')
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
                    const hasAttachment = el.keyToUpdate.name === 'filePath' ? true : false;
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