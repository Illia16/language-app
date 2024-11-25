#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { BackendCdkStack } = require('../lib/backend_cdk-stack');

const app = new cdk.App();

new BackendCdkStack(app, `${process.env.PROJECT_NAME}-stack-${process.env.ENV_NAME}`, {
    env: {
        region: 'us-east-1', 
        STAGE: process.env.ENV_NAME,
        PROJECT_NAME: process.env.PROJECT_NAME,
        CLOUDFRONT_URL: `https://${process.env.CLOUDFRONT_URL}`,
        CLOUDFRONT_LOGIN: process.env.CLOUDFRONT_LOGIN,
        CLOUDFRONT_PW: process.env.CLOUDFRONT_PW,
        OPEN_AI_KEY: process.env.OPEN_AI_KEY,
        SQS_URL: process.env.SQS_URL,
        CERTIFICATE_ARN: process.env.CERTIFICATE_ARN,
    },
    description: `Backend stack for ${process.env.PROJECT_NAME} for ${process.env.ENV_NAME} environment.`
});
