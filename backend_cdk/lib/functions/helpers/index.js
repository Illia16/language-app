const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const clientDynamoDB = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(clientDynamoDB);

const { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const clientS3 = new S3Client({});
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
    checkIfUserExists: async (tableName, v, email = null) => {
        // Used to check during registration: check invitation code, check if user exists (email and login)
        const input = {
            TableName: tableName,
            ...(email && {FilterExpression: "userEmail = :userEmailExp",}),
            KeyConditionExpression: "#userName = :usr",
            ExpressionAttributeValues: {
                ":usr": v,
                ...(email && {":userEmailExp": email}),
            },
            ExpressionAttributeNames: {
                "#userName": "user"
            },
            ConsistentRead: true,
        }

        const commandCheckUserName = new QueryCommand(input);
        const res = await docClient.send(commandCheckUserName);
        return res;
    },
    findUserByEmail: async (tableName, v) => {
        // Used to check during forgot-password call
        const params = {
            TableName: tableName,
            ProjectionExpression: '#emailAlias, #userPw',
            ExpressionAttributeNames: {
              '#emailAlias': 'userEmail',
              '#userPw': 'password',
            }
        };

        const command = new ScanCommand(params);
        const res = await docClient.send(command);
        return res.Items.filter(item => item.userEmail === v)[0];
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
    }
}
