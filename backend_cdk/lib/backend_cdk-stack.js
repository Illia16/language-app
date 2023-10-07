const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const lambda = require('aws-cdk-lib/aws-lambda');
const path = require('path')

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    console.log('environment2', props.env.stage);

    const websiteBucket = new s3.Bucket(this, `personal-project--language-app-${props.env.stage}`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: `personal-project--language-app-${props.env.stage}`,
    });

    const myFunc = new cloudfront.experimental.EdgeFunction(this, `redirect-personal-project--language-app-${props.env.stage}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: `redirect-personal-project--language-app-${props.env.stage}`,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'redirect')),
    });

    const oai = new cloudfront.OriginAccessIdentity(this, `oai-personal-project--language-app-${props.env.stage}`, {
      comment: `oai-personal-project--language-app-${props.env.stage}`,
    });

    new cloudfront.CloudFrontWebDistribution(this, `cf-personal-project--language-app-${props.env.stage}`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: oai,
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
