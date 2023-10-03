const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const lambda = require('aws-cdk-lib/aws-lambda');
const path = require('path')

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an S3 bucket
    const websiteBucket = new s3.Bucket(this, 'personal-project--language-app-prod', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: 'personal-project--language-app-prod',
    });

    const myFunc = new cloudfront.experimental.EdgeFunction(this, 'redirect-personal-project--language-app--prod', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'redirect-personal-project--language-app--prod',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'redirect')),
    });

    // Create a CloudFront distribution
    new cloudfront.CloudFrontWebDistribution(this, 'MyNuxtCloudFront', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            // originAccessIdentity: cloudfront.OriginAccessIdentity.fromGeneratedId('origin-access-identity-id'),
            // originAccessIdentity: cloudfront.OriginAccessIdentity.fromGeneratedId(this, 'MyOriginAccessIdentity'),
          },
          behaviors: [
            { isDefaultBehavior: true,
              lambdaFunctionAssociations: [
                {
                  eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                  lambdaFunction: myFunc.currentVersion,
                },
              ],
            },
          ],
        },
      ],
    });
  }
}

module.exports = { BackendCdkStack };