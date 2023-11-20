const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const client = new S3Client({});
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const https = require('https');
const { Blob, Buffer } = require('node:buffer');

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
    putFile(url, data) {
        return new Promise((resolve, reject) => {
            const parsedData = JSON.parse(data);
            // Extract the binary data from the 'content' property
            const binaryData = Buffer.from(parsedData.content, 'binary');

            const req = https.request(
                url,
                // { method: "PUT", headers: { "Content-Length": new Blob([data]).size } },
                { method: "PUT", headers: { "Content-Length": binaryData.length, "Content-Type": "audio/mpeg" } },

                (res) => {
                    let responseBody = "";
                    res.on("data", (chunk) => {
                        responseBody += chunk;
                    });
                    res.on("end", () => {
                        resolve(responseBody);
                    });
                },
            );

            req.on("error", (err) => {
                reject(err);
            });

            // req.write(data);
            req.write(binaryData);
            req.end();
        });
    },
    createPresignedUrlWithClient: async (bucket, key) => {
        const command = new PutObjectCommand({ Bucket: bucket, Key: key });
        const url = await getSignedUrl(client, command, { expiresIn: 3600 });
        return url;
    },
    decodeBase64: (base64_encoded_file) => {
        const file = Buffer.from(base64_encoded_file, 'base64');
        return file;
    },
    cleanUpFileName: (v) => {
        return v.trim().toLowerCase().replace(/[\s,\.]+/g, '_');
    },
    //Function to parse the body of multipart/form-data
    parseMultipartFormData: (body, boundary) => {
        const parts = body.split(`--${boundary}`);
        const formData = {};
    
        parts.forEach(part => {
        if (part.trim() === '' || part.trim() === '--') {
            return;
        }
    
        const [headers, content] = part.split('\r\n\r\n', 2);
        const contentDisposition = headers.match(/Content-Disposition:.*?name="([^"]+)"(?:; filename="([^"]+)")?/i);
    
        if (contentDisposition) {
            const fieldName = contentDisposition[1];
            const filename = contentDisposition[2];
    
            if (filename) {
            // This part contains a file
            formData[fieldName] = {
                filename: filename,
                // content: content.trim(),
                content: Buffer.from(content, 'binary'), // Treat content as binary
            };
            } else {
            // This part is a regular form field
            formData[fieldName] = content.trim();
            }
        }
        });
    
        return formData;
    }
}
