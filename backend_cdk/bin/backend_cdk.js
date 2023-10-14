#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { BackendCdkStack } = require('../lib/backend_cdk-stack');

const app = new cdk.App();
const environment = app.node.tryGetContext('env');
const account_id = app.node.tryGetContext('account_id');
const projectName = app.node.tryGetContext('projectName');
console.log('environment', environment);
console.log('account_id', account_id);
// console.log('app.node.tryGetContext()', app.node.tryGetContext('env:live'));

new BackendCdkStack(app, `stack-${projectName}-${environment}`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: account_id, region: 'us-east-1', stage: environment, projectName: projectName },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
