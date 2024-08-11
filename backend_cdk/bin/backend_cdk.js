#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { BackendCdkStack } = require('../lib/backend_cdk-stack');

const app = new cdk.App();
const environment = app.node.tryGetContext('env');
const account = app.node.tryGetContext('account');
const projectName = app.node.tryGetContext('projectName');
const cloudfrontTestUrl = app.node.tryGetContext('cloudfrontTestUrl');
const cloudfrontProdUrl = app.node.tryGetContext('cloudfrontProdUrl');
console.log('environment', environment);
console.log('account', account);

new BackendCdkStack(app, `${projectName}-stack-${environment}`, {
    env: { 
        account, 
        region: 'us-east-1', 
        stage: environment, 
        projectName, 
        cloudfrontTestUrl,
        cloudfrontProdUrl,
        openAiKey: process.env.OPEN_AI_KEY,
        senderEmail: process.env.SENDER_EMAIL,
        sqsUrlTest: process.env.SQS_URL_TEST,
        sqsUrlProd: process.env.SQS_URL_PROD,
    },
    description: `Backend stack for ${projectName} for ${environment} environment.`
});
