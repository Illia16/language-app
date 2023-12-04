const { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const client = new S3Client({});
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

module.exports = {
    s3GetFile: async (s3_buckname, filenamepath) => {
        const input = {
            Bucket: s3_buckname,
            Key: filenamepath,
        };
        const command = new GetObjectCommand(input);
        try {
            const res = await client.send(command);
            return res;
        } catch (err) {
            console.error('s3_error_s3GetFile:', err);
            return err;
        }
    },
    s3ListObjects: async (s3_buckname, path) => {
        const input = {
            Bucket: s3_buckname,
            Prefix: path,
        };

        const command = new ListObjectsV2Command(input);
        try {
            const res = await client.send(command);
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
            await client.send(command);
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
            await client.send(command);
        } catch (err) {
            console.error('s3_error_s3UploadFile:', err);
        }
    },
    s3GetSignedUrl: async (s3_buckname, filenamepath) => {
        const command = new GetObjectCommand({ Bucket: s3_buckname, Key: filenamepath });
        const file = await getSignedUrl(client, command, { expiresIn: 3600 });
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
