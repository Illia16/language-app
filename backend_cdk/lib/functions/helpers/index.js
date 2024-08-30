const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const clientDynamoDB = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(clientDynamoDB);

const { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const clientS3 = new S3Client({});
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { SecretsManagerClient, GetSecretValueCommand  } = require('@aws-sdk/client-secrets-manager');
const client = new SecretsManagerClient({});


const { EventBridgeClient, DescribeRuleCommand } = require('@aws-sdk/client-eventbridge');
const clientEB = new EventBridgeClient({ region: 'us-east-1'});

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
        console.log('s3helper_s3UploadFile', s3_buckname, filenamepath, streamdata);
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
        const file = await getSignedUrl(clientS3, command, { expiresIn: 3600 });
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
            ...(email && {FilterExpression: "userEmail = :userEmailExp",}),
            KeyConditionExpression:
              "#userName = :usr",
            ExpressionAttributeValues: {
              ":usr": user,
              ...(email && {":userEmailExp": email}),
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
        let response;
        
        try {
            response = await client.send(
                new GetSecretValueCommand({
                    SecretId: secret_name,
                    VersionStage: "AWSCURRENT",
                })
            );
        } catch (error) {
            throw error;
        }

        return response?.SecretString;
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
    getRateExpressionNextRun: (scheduleExpression) => {
        if (!scheduleExpression.startsWith('rate(')) {
            throw new Error('Invalid scheduleExpression');
        }

        const now = new Date();
        const match = scheduleExpression.match(/rate\((\d+) (minute|minutes|hour|hours|day|days)\)/);
    
        if (!match) throw new Error('Invalid rate expression');
    
        const value = parseInt(match[1], 10);
        const unit = match[2];
        let nextRunTime;
    
        switch (unit) {
            case 'minute':
            case 'minutes':
                nextRunTime = new Date(now.getTime() + value * 60 * 1000);
                break;
            case 'hour':
            case 'hours':
                nextRunTime = new Date(now.getTime() + value * 60 * 60 * 1000);
                break;
            case 'day':
            case 'days':
                nextRunTime = new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
                break;
            default:
                throw new Error('Unsupported time unit');
        }
    
        // time in ms
        return nextRunTime - now;
    }
}