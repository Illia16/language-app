#! /usr/bin/env node
'use strict';

const { exec } = require('child_process');

if (process.argv.length < 3){
    process.exit(1);
}

const env = process.argv[2];
const config = require('./deploy.config.js').getConfig(env);

return new Promise((resolve, reject) => {
    if (config.aws && config.aws.s3) {
        const command = `aws s3 sync ${config.aws.s3.local_dist_path} s3://${config.aws.s3.bucket} --region ${config.aws.s3.region} --profile ${config.aws.s3.profile}`;

        exec(command, (error, stdout, stderr) => {;
            if (error) {
                return reject(error);
            } else {
                resolve(stdout);
            }
        })
    } else {
        reject(error);
    }
})
.then(() => new Promise((resolve, reject) => {
    if (config.aws && config.aws.cloudfront) {
        const invalidationCommand = `aws cloudfront create-invalidation --profile ${config.aws.s3.profile} --distribution-id ${config.aws.cloudfront.distribution_id} --paths "/*"`

        exec(invalidationCommand, (error, stdout, stderr) => {;
            if (error) {
                return reject(error);
            } else {
                resolve(stdout);
            }
        })
    } else {
        reject(error);
    }
}))
.then(() => { console.log('completed'); })
