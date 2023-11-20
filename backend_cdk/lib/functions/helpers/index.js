const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const client = new S3Client({});
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

module.exports = {
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
    decodeBase64: (base64_encoded_file) => {
        const file = Buffer.from(base64_encoded_file, 'base64');
        return file;
    },
    cleanUpFileName: (v) => {
        return v.trim().toLowerCase().replace(/[\s,\.]+/g, '_');
    }
}
