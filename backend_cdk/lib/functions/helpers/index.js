const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, ScanCommand, GetCommand, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const clientDynamoDB = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(clientDynamoDB);

const { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const clientS3 = new S3Client({});
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm');
const clientSSM = new SSMClient({});

const { EventBridgeClient, DescribeRuleCommand } = require('@aws-sdk/client-eventbridge');
const clientEB = new EventBridgeClient({ region: 'us-east-1' });

const { getAudio } = require('./openai');

module.exports = {
    s3GetFile: async (s3_buckname, filenamepath) => {
        const input = {
            Bucket: s3_buckname,
            Key: filenamepath,
        };
        const command = new GetObjectCommand(input);
        try {
            const res = await clientS3.send(command);
            return res;
        } catch (err) {
            console.error('s3_error_s3GetFile:', err);
            return err;
        }
    },
    s3ListObjects: async (s3_buckname, path) => {
        const input = {
            Bucket: s3_buckname,
            Prefix: `${path}/`,
        };

        const command = new ListObjectsV2Command(input);
        try {
            const res = await clientS3.send(command);
            return res;
        } catch (err) {
            console.error('s3_error_s3ListObjects:', err);
            return err;
        }
    },
    s3DeleteFile: async (s3_buckname, filenamepath) => {
        const input = {
            Bucket: s3_buckname,
            Key: filenamepath,
        };
        const command = new DeleteObjectCommand(input);
        try {
            await clientS3.send(command);
        } catch (err) {
            console.error('s3_error_s3DeleteFile:', err);
        }
    },
    s3UploadFile: async (s3_buckname, filenamepath, streamdata) => {
        const params = {
            Bucket: s3_buckname,
            Key: filenamepath,
            Body: streamdata,
        };

        const command = new PutObjectCommand(params);

        try {
            await clientS3.send(command);
        } catch (err) {
            console.error('s3_error_s3UploadFile:', err);
        }
    },
    s3GetSignedUrl: async (s3_buckname, filenamepath) => {
        const command = new GetObjectCommand({ Bucket: s3_buckname, Key: filenamepath });
        const file = await getSignedUrl(clientS3, command, { expiresIn: 7200 }); // PreSigned URL (for audio files) expires 2 hours after the lesson started.
        return file;
    },
    cleanUpFileName: (v) => {
        return v.trim().toLowerCase().replace(/[\s,\.]+/g, '_');
    },
    getFilePathIfFileIsPresentInBody: (body) => {
        let filePath = null;
        const hasAttachment = body?.files?.length ? true : false;

        if (hasAttachment) {
            let fileNameCleaned = module.exports.cleanUpFileName(body?.item);
            let file_name = fileNameCleaned + '.' + body.files?.[0].filename.split('.').at(-1);
            filePath = `audio/${fileNameCleaned}/${file_name}`.toLowerCase().trim();
        }

        return filePath;
    },
    findUser: async (tableName, user, email = null) => {
        // email is only for users table
        const params = {
            TableName: tableName,
            ...(email && { FilterExpression: "userEmail = :userEmailExp", }),
            KeyConditionExpression:
                "#userName = :usr",
            ExpressionAttributeValues: {
                ":usr": user,
                ...(email && { ":userEmailExp": email }),
            },
            ExpressionAttributeNames: { "#userName": "user" },
            ConsistentRead: true,
        };

        const command = new QueryCommand(params);
        const res = await docClient.send(command);
        return res.Items;
    },
    findUserByEmail: async (tableName, v) => {
        const params = {
            TableName: tableName,
            IndexName: 'userEmailIndex',
            KeyConditionExpression: '#emailAlias = :emailValue',
            ExpressionAttributeNames: {
                '#emailAlias': 'userEmail',
            },
            ExpressionAttributeValues: {
                ':emailValue': v,
            },
        };

        const command = new QueryCommand(params);
        const res = await docClient.send(command);
        return res.Items[0];
    },
    findAll: async (tableName) => {
        const params = {
            TableName: tableName,
        };
        const command = new ScanCommand(params);
        const data = await docClient.send(command);
        return data.Items;
    },
    findAllByPrimaryKey: async (tableName, v) => {
        const params = {
            TableName: tableName,
            ProjectionExpression: '#aliasForUser, #aliasforItemId',
            ExpressionAttributeNames: {
                '#aliasForUser': 'user',
                '#aliasforItemId': 'itemID',
            },
            FilterExpression: '#aliasForUser = :valueUsr',
            ExpressionAttributeValues: {
                ':valueUsr': v,
            },
        };

        const command = new ScanCommand(params);
        const data = await docClient.send(command);
        return data.Items;
    },
    responseWithError: (errorCode = '500', errorMsg = 'Something went wrong...', headers) => {
        return {
            statusCode: errorCode,
            body: JSON.stringify({
                success: false,
                message: errorMsg,
            }),
            headers: {
                "Access-Control-Allow-Origin": headers,
            },
        }
    },
    getSecret: async (secret_name) => {
        const command = new GetParametersCommand({
            Names: [
                secret_name,
            ],
            WithDecryption: true,
        });
        const response = await clientSSM.send(command);
        return response.Parameters[0].Value;
    },
    getEventBridgeRuleInfo: async (ruleName) => {
        try {
            const command = new DescribeRuleCommand({ Name: ruleName });
            const response = await clientEB.send(command);
            return response;
        } catch (error) {
            console.error('Error describing the rule:', error);
            return error;
        }
    },
    getCronExpressionNextRun: (scheduleExpression) => {
        if (!scheduleExpression.startsWith('cron(')) {
            throw new Error('Invalid scheduleExpression');
        }

        // Extract cron expression parts
        const cronMatch = scheduleExpression.match(/cron\((\d+) (\d+) (\d+) (\*|\d+) (\?|\d+) (\*|\d+)\)/);
        if (!cronMatch) {
            throw new Error('Invalid cron expression format');
        }

        const [_, minute, hour, dayOfMonth, month, dayOfWeek, year] = cronMatch;

        // Create target date
        const now = new Date();
        const targetDate = new Date(now);

        // Set the target date components
        targetDate.setMinutes(parseInt(minute, 10));
        targetDate.setHours(parseInt(hour, 10));
        targetDate.setDate(parseInt(dayOfMonth, 10));

        // Handle month if specified (not *)
        if (month !== '*') {
            targetDate.setMonth(parseInt(month, 10) - 1);
        }

        // Handle year if specified (not *)
        if (year !== '*') {
            targetDate.setFullYear(parseInt(year, 10));
        }

        // If the target date is in the past, move it to the next occurrence
        if (targetDate <= now) {
            if (month !== '*') {
                // If month is specified, move to next year
                targetDate.setFullYear(targetDate.getFullYear() + 1);
            } else {
                // If month is *, move to next month
                targetDate.setMonth(targetDate.getMonth() + 1);

                // If we've moved past December, wrap to next year
                if (targetDate.getMonth() === 0) {
                    targetDate.setFullYear(targetDate.getFullYear() + 1);
                }
            }
        }

        // Return time until next execution in milliseconds
        return targetDate.getTime() - now.getTime();
    },
    saveBatchItems: async (resultsAIdata, userTierPremium, user, userMotherTongue, languageStudying) => {
        try {
            const allEls = [];
            const input = {
                RequestItems: {
                    [process.env.DB_DATA]: await Promise.all(resultsAIdata.map(async (el) => {
                        let audioFilePathAi = '';

                        // get audio of text from AI if user is premium
                        if (userTierPremium) {
                            const audioFile = await getAudio(el.item)
                            const fileNameCleaned = module.exports.cleanUpFileName(el.item);
                            audioFilePathAi = `audio/${fileNameCleaned}/${fileNameCleaned}.mp3`;
                            await module.exports.s3UploadFile(process.env.S3_FILES, audioFilePathAi, audioFile);
                        }
                        return {
                            PutRequest: {
                                Item: {
                                    user: user,
                                    item: el.item,
                                    itemID: new Date().toISOString() + "___" + el.item.slice(0, 10).replaceAll(" ", "_"),
                                    itemCorrect: el.itemCorrect,
                                    incorrectItems: JSON.stringify(el.incorrectItems),
                                    itemType: el.itemType,
                                    itemTypeCategory: el.itemTypeCategory,
                                    userMotherTongue: userMotherTongue,
                                    languageStudying: languageStudying,
                                    level: 0,
                                    itemTranscription: el.itemTranscription,
                                    filePath: audioFilePathAi,
                                    getAudioAI: true, // existing in DB
                                }
                            }
                        }
                    }))
                }
            };
            const commandWrite = new BatchWriteCommand(input);
            const resWrite = await docClient.send(commandWrite);
            allEls.push(resWrite.ItemCollectionMetrics);

            return allEls;
        } catch (error) {
            throw new Error("Failed to saveBatchItems");
        }
    }
}