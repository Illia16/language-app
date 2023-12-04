const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamoDb = require('aws-cdk-lib/aws-dynamodb');
const apiGateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const aws_secretsmanager = require('aws-cdk-lib/aws-secretsmanager');
const path = require('path')

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    console.log('environment2', props.env.stage);

    const websiteBucket = new s3.Bucket(this, `${props.env.projectName}-${props.env.stage}`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: `${props.env.projectName}-${props.env.stage}`,
    });

    const websiteBucketFiles = new s3.Bucket(this, `s3-files-${props.env.projectName}-${props.env.stage}`, {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      bucketName: `s3-files-${props.env.projectName}-${props.env.stage}`,
    });

    const myIam = new iam.Role(this, `iam-${props.env.projectName}-${props.env.stage}`, {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        roleName: `iam-${props.env.projectName}-${props.env.stage}`,
    })

    // Basic Auth
    // const auth = new cloudfront.experimental.EdgeFunction(this, `auth--${props.env.projectName}-${props.env.stage}`, {
    //     runtime: lambda.Runtime.NODEJS_18_X,
    //     functionName: `fn_auth--${props.env.projectName}-${props.env.stage}`,
    //     handler: 'index.handler',
    //     code: lambda.Code.fromAsset(path.join(__dirname, 'basic_auth')),
    // })


    // const myFunc = new cloudfront.experimental.EdgeFunction(this, `redirect-${props.env.projectName}-${props.env.stage}`, {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   functionName: `redirect-${props.env.projectName}-${props.env.stage}`,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset(path.join(__dirname, 'basic_auth')),
    // });

    const cfFunction = new cloudfront.Function(this, 'Function', {
        code: cloudfront.FunctionCode.fromFile({
            filePath: __dirname + '/functions/basicAuth/index.js',
        }),
        functionName: `cfFunction-${props.env.projectName}-${props.env.stage}`,
        comment: 'CF to handle redirect.'
    });

    const oai = new cloudfront.OriginAccessIdentity(this, `oai-${props.env.projectName}-${props.env.stage}`, {
      comment: `oai-${props.env.projectName}-${props.env.stage}`,
    });

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        resources: [
          websiteBucket.bucketArn,
          `${websiteBucket.bucketArn}/*`
        ],
        actions: ["s3:GetObject", "s3:ListBucket"],
        principals: [new iam.ArnPrincipal('arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ELUW0TL0CILLB')],
      })
    )

    // websiteBucketFiles.addToResourcePolicy(
    //   new iam.PolicyStatement({
    //     resources: [
    //       websiteBucketFiles.bucketArn,
    //       `${websiteBucketFiles.bucketArn}/*`
    //     ],
    //     actions: ["s3:GetObject", "s3:ListBucket", "s3:PutObject"],
    //     principals: [new iam.ArnPrincipal('arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ELUW0TL0CILLB')],
    //   })
    // )

    new cloudfront.CloudFrontWebDistribution(this, `cf-${props.env.projectName}-${props.env.stage}`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
                isDefaultBehavior: true,
                // lambdaFunctionAssociations: [
                //     {
                //         eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                //         lambdaFunction: myFunc.currentVersion,
                //     },
                // ],
                functionAssociations: [{
                    eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                    function: cfFunction,
                }],
            },
          ],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 404,
          responsePagePath: '/404.html'
        },
        {
          errorCode: 403,
          responseCode: 403,
          responsePagePath: '/404.html'
        }
      ]
    });

    const myTable = new dynamoDb.TableV2(this, `db-${props.env.projectName}-${props.env.stage}`, {
      tableName: `db-${props.env.projectName}-${props.env.stage}`,
      partitionKey: {
        name: 'user',
        type: dynamoDb.AttributeType.STRING
      },
      sortKey: {
        name: 'itemID',
        type: dynamoDb.AttributeType.STRING
      }
    });

    const myTableUsers = new dynamoDb.TableV2(this, `db-users-${props.env.projectName}-${props.env.stage}`, {
      tableName: `db-users-${props.env.projectName}-${props.env.stage}`,
      partitionKey: {
        name: 'user',
        type: dynamoDb.AttributeType.STRING
      },
      sortKey: {
        name: 'userId',
        type: dynamoDb.AttributeType.STRING
      },
    })

    // const helperFns = new lambda.LayerVersion(this, `helper-fn-layer-${props.env.projectName}-${props.env.stage}`, {
    //     code: lambda.Code.fromAsset(path.join(__dirname, '../helpers')),
    //     compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    //     description: `helper functions for Lambda fn`,
    //     layerVersionName: `helper-fn-layer-${props.env.projectName}-${props.env.stage}`,
    // })

    const lambdaFnDynamoDb = new lambda.Function(this, `lambdaFnDynamoDb-${props.env.projectName}-${props.env.stage}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handleItems',
        code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
        functionName: `lambdaFnDynamoDb-${props.env.projectName}-${props.env.stage}`,
        role: myIam,
        environment: {
          env: props.env.stage,
          projectName: props.env.projectName,
          admin: props.env.admin,
          cloudfrontTestUrl: props.env.cloudfrontTestUrl,
          cloudfrontProdUrl: props.env.cloudfrontProdUrl
        },
        // layers: [helperFns],
    });

    // the below line attaches all dynamodb actions to the created by default iam role. we don't want that.
    // myTable.grantReadWriteData(lambdaFnDynamoDb);
    // the below grants the Lambda fn basic things (like logs)
    lambdaFnDynamoDb.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    const authFn = new lambda.Function(this, `authFn-${props.env.projectName}-${props.env.stage}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.auth',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `authFn-${props.env.projectName}-${props.env.stage}`,
      role: myIam,
      environment: {
        env: props.env.stage,
        projectName: props.env.projectName,
        admin: props.env.admin,
        cloudfrontTestUrl: props.env.cloudfrontTestUrl,
        cloudfrontProdUrl: props.env.cloudfrontProdUrl
      },
    });
    authFn.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    myIam.attachInlinePolicy(new iam.Policy(this, `iamPolicy-${props.env.projectName}-${props.env.stage}`, {
          statements: [
              new iam.PolicyStatement({
                  actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem'],
                  // dynamodb:*
                  // dynamodb:BatchGetItem
                  // dynamodb:BatchWriteItem
                  // dynamodb:ConditionCheckItem
                  // dynamodb:DeleteItem
                  // dynamodb:DescribeTable
                  // dynamodb:GetItem
                  // dynamodb:GetRecords
                  // dynamodb:GetShardIterator
                  // dynamodb:PutItem
                  // dynamodb:Query
                  // dynamodb:Scan
                  // dynamodb:UpdateItem
                  resources: [myTable.tableArn, myTableUsers.tableArn],
                  effect: iam.Effect.ALLOW,
              }),
              new iam.PolicyStatement({
                actions: [
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    // "s3:PutObjectAcl",
                    // "s3:GetObjectAcl",
                    // "s3:*"
                  ],
                resources: [websiteBucketFiles.bucketArn, `${websiteBucketFiles.bucketArn}/*`],
                effect: iam.Effect.ALLOW
              }),
            // the below is custom policy to give lambda fn access to write cloudwatch logs
            //   new iam.PolicyStatement({
            //     actions: [
            //       "logs:CreateLogGroup",
            //     ],
            //     resources: [`arn:aws:logs:${props.env.region}:${props.env.account}:*`],
            //     effect: iam.Effect.ALLOW,
            //   }),
            //   new iam.PolicyStatement({
            //     actions: [
            //       "logs:CreateLogStream",
            //       "logs:PutLogEvents"
            //     ],
            //     // resources: [lambdaFnDynamoDb.functionArn],
            //     resources: [`arn:aws:logs:${props.env.region}:${props.env.account}:log-group:/aws/lambda/${lambdaFnDynamoDb.functionName}:*`],
            //     effect: iam.Effect.ALLOW,
            //   })
            //
          ],
      })
    )
    
    // API #1
    const myApi = new apiGateway.LambdaRestApi(this, `api-study-items--${props.env.projectName}-${props.env.stage}`, {
      handler: lambdaFnDynamoDb,
      proxy: false,
      restApiName: `api-study-items--${props.env.projectName}-${props.env.stage}`,
      description: 'API to get/update/post/delete language items of users.',
      binaryMediaTypes: ['multipart/form-data'],
      defaultCorsPreflightOptions: {
        allowOrigins: props.env.stage === 'prod' ? [props.env.cloudfrontProdUrl] : ['http://localhost:3000', props.env.cloudfrontTestUrl],
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
      deploy: false,
    //   change default deploment to test
    //   deployOptions: {
    //     stageName: props.env.stage,
    //   }
    });
    const routeStudyItems = myApi.root.addResource('study-items');
    routeStudyItems.addMethod('GET')
    routeStudyItems.addMethod('POST')
    routeStudyItems.addMethod('PUT')
    routeStudyItems.addMethod('DELETE')
    const stage = new apiGateway.Stage(this, `apiStage-study-items--${props.env.projectName}-${props.env.stage}`,
      {
        deployment: new apiGateway.Deployment(this, `apiDeployment-study-items--${props.env.projectName}-${props.env.stage}`, {api: myApi}),
        stageName: props.env.stage,
      }
    );
    myApi.deploymentStage = props.env.stage;
    // 

    // API #2
    const myApiAuth = new apiGateway.LambdaRestApi(this, `api-auth--${props.env.projectName}-${props.env.stage}`, {
      handler: authFn,
      proxy: false,
      restApiName: `api-auth--${props.env.projectName}-${props.env.stage}`,
      description: 'API to login/register/delete/change passwords for users.',
      defaultCorsPreflightOptions: {
        allowOrigins: props.env.stage === 'prod' ? [props.env.cloudfrontProdUrl] : ['http://localhost:3000', props.env.cloudfrontTestUrl],
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
      deploy: false,
    });

    const routesApiAuth = myApiAuth.root.addResource('auth');
    const item = routesApiAuth.addResource('{item}');
    item.addMethod('POST');
    item.addMethod('DELETE');
    item.addMethod('PUT');
    const stageAuth = new apiGateway.Stage(this, `api-auth-stage--${props.env.projectName}-${props.env.stage}`,
      {
        deployment: new apiGateway.Deployment(this, `api-auth--deployment--${props.env.projectName}-${props.env.stage}`, {
          api: myApiAuth
        }),
        stageName: props.env.stage,
      }
    );
    myApiAuth.deploymentStage = props.env.stage;
    // 


    // generate new JWT secret for auth, rotate every 30 days
    const jwtSecret = new aws_secretsmanager.Secret(this, `secret--${props.env.projectName}`,
      {
        secretName: `secret--${props.env.projectName}`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ name: `secret--${props.env.projectName}` }),
          generateStringKey: 'value',
        },
      }
    );

    // Enable rotation every 30 days
    // jwtSecret.addRotationSchedule(`secret-rotation-schedule--${props.env.projectName}`, {
    //   rotationLambda: new aws_secretsmanager.RotationLambda(this, 'MyRotationLambda', {
    //     rotationFunctionName: `secret-rotation-schedule-fn--${props.env.projectName}`,
    //     inlineCode: 'console.log("Custom rotation function logic here");',
    //   }),
    //   rotationSchedule: cdk.Duration.minutes(3),
    // });

    // add this secret to Lambda FN as an env var
    lambdaFnDynamoDb.addEnvironment('secret', jwtSecret.secretValue.unsafeUnwrap());
    authFn.addEnvironment('secret', jwtSecret.secretValue.unsafeUnwrap());
  }
}

module.exports = { BackendCdkStack };
