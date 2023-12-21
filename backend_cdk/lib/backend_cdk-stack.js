const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamoDb = require('aws-cdk-lib/aws-dynamodb');
const apiGateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const aws_secretsmanager = require('aws-cdk-lib/aws-secretsmanager');
const events = require('aws-cdk-lib/aws-events');
const eventsTargets = require('aws-cdk-lib/aws-events-targets');
const path = require('path')

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    console.log('environment2', props.env.stage);

    const websiteBucket = new s3.Bucket(this, `${props.env.projectName}--s3-site--${props.env.stage}`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: `${props.env.projectName}--s3-site--${props.env.stage}`,
    });

    const websiteBucketFiles = new s3.Bucket(this, `${props.env.projectName}--s3-files--${props.env.stage}`, {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      bucketName: `${props.env.projectName}--s3-files--${props.env.stage}`,
    });

    const myIam = new iam.Role(this, `${props.env.projectName}--iam-role--${props.env.stage}`, {
        // assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('lambda.amazonaws.com'), new iam.ServicePrincipal('secretsmanager.amazonaws.com'), new iam.ServicePrincipal('events.amazonaws.com')),
        roleName: `${props.env.projectName}--iam-role--${props.env.stage}`,
    })

    // Basic Auth
    // const auth = new cloudfront.experimental.EdgeFunction(this, `${props.env.projectName}-auth--${props.env.stage}`, {
    //     runtime: lambda.Runtime.NODEJS_18_X,
    //     functionName: `${props.env.projectName}--fn_auth--${props.env.stage}`,
    //     handler: 'index.handler',
    //     code: lambda.Code.fromAsset(path.join(__dirname, 'basic_auth')),
    // })


    // const myFunc = new cloudfront.experimental.EdgeFunction(this, `${props.env.projectName}--redirect--${props.env.stage}`, {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   functionName: `{props.env.projectName}--redirect--${props.env.stage}`,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset(path.join(__dirname, 'basic_auth')),
    // });

    const cfFunction = new cloudfront.Function(this, `${props.env.projectName}--cf-redirect-fn--${props.env.stage}`, {
        code: cloudfront.FunctionCode.fromFile({
            filePath: __dirname + '/functions/basicAuth/index.js',
        }),
        functionName: `${props.env.projectName}--cf-redirect-fn--${props.env.stage}`,
        comment: 'CF to handle redirect.'
    });

    const oai = new cloudfront.OriginAccessIdentity(this, `${props.env.projectName}--oai--${props.env.stage}`, {
      comment: `${props.env.projectName}--oai--${props.env.stage}`,
    });

    // websiteBucket.addToResourcePolicy(
    //   new iam.PolicyStatement({
    //     resources: [
    //       websiteBucket.bucketArn,
    //       `${websiteBucket.bucketArn}/*`
    //     ],
    //     actions: ["s3:GetObject", "s3:ListBucket"],
    //     principals: [new iam.ArnPrincipal('arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E2MVKOXEMZ8ANE')],
    //   })
    // );

    new cloudfront.CloudFrontWebDistribution(this, `${props.env.projectName}--cf--${props.env.stage}`, {
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

    const myTable = new dynamoDb.TableV2(this, `${props.env.projectName}--db-data--${props.env.stage}`, {
      tableName: `${props.env.projectName}--db-data--${props.env.stage}`,
      partitionKey: {
        name: 'user',
        type: dynamoDb.AttributeType.STRING
      },
      sortKey: {
        name: 'itemID',
        type: dynamoDb.AttributeType.STRING
      }
    });

    const myTableUsers = new dynamoDb.TableV2(this, `${props.env.projectName}--db-users--${props.env.stage}`, {
      tableName: `${props.env.projectName}--db-users--${props.env.stage}`,
      partitionKey: {
        name: 'user',
        type: dynamoDb.AttributeType.STRING
      },
      sortKey: {
        name: 'userId',
        type: dynamoDb.AttributeType.STRING
      },
    })

    // const helperFns = new lambda.LayerVersion(this, `${props.env.projectName}--helper-fn-layer--${props.env.stage}`, {
    //     code: lambda.Code.fromAsset(path.join(__dirname, '../helpers')),
    //     compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    //     description: `helper functions for Lambda fn`,
    //     layerVersionName: `${props.env.projectName}--helper-fn-layer--${props.env.stage}`,
    // })

    const lambdaFnDynamoDb = new lambda.Function(this, `${props.env.projectName}--lambda-fn-db-data--${props.env.stage}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handleItems',
        code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
        functionName: `${props.env.projectName}--lambda-fn-db-data--${props.env.stage}`,
        role: myIam,
        environment: {
          env: props.env.stage,
          projectName: props.env.projectName,
          cloudfrontTestUrl: props.env.cloudfrontTestUrl,
          cloudfrontProdUrl: props.env.cloudfrontProdUrl
        },
        timeout: cdk.Duration.seconds(30),
        // layers: [helperFns],
    });

    // the below line attaches all dynamodb actions to the created by default iam role. we don't want that.
    // myTable.grantReadWriteData(lambdaFnDynamoDb);
    // the below grants the Lambda fn basic things (like logs)
    lambdaFnDynamoDb.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    const authFn = new lambda.Function(this, `${props.env.projectName}--lambda-fn-db-users--${props.env.stage}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.auth',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${props.env.projectName}--lambda-fn-db-users--${props.env.stage}`,
      role: myIam,
      environment: {
        env: props.env.stage,
        projectName: props.env.projectName,
        cloudfrontTestUrl: props.env.cloudfrontTestUrl,
        cloudfrontProdUrl: props.env.cloudfrontProdUrl
      },
    });
    authFn.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    // API #1
    const myApi = new apiGateway.LambdaRestApi(this, `${props.env.projectName}--api-data--${props.env.stage}`, {
      handler: lambdaFnDynamoDb,
      deployOptions: {
        stageName: props.env.stage,
      },
      proxy: false,
      restApiName: `${props.env.projectName}--api-data--${props.env.stage}`,
      description: 'API to get/update/post/delete language items of users.',
      binaryMediaTypes: ['multipart/form-data'],
      defaultCorsPreflightOptions: {
        allowOrigins: props.env.stage === 'prod' ? [props.env.cloudfrontProdUrl] : ['http://localhost:3000', props.env.cloudfrontTestUrl],
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });
    const routeStudyItems = myApi.root.addResource('data');
    routeStudyItems.addMethod('GET')
    routeStudyItems.addMethod('POST')
    routeStudyItems.addMethod('PUT')
    routeStudyItems.addMethod('DELETE')
    // const stage = new apiGateway.Stage(this, `${props.env.projectName}--api-stage-data--${props.env.stage}`,
    //   {
    //     deployment: new apiGateway.Deployment(this, `${props.env.projectName}--api-deployment-data--${props.env.stage}`, {api: myApi}),
    //     stageName: props.env.stage,
    //   }
    // );
    // myApi.deploymentStage = props.env.stage;
    //

    // API #2
    const myApiAuth = new apiGateway.LambdaRestApi(this, `${props.env.projectName}--api-users--${props.env.stage}`, {
      handler: authFn,
      proxy: false,
      deployOptions: {
        stageName: props.env.stage,
      },
      restApiName: `${props.env.projectName}--api-users--${props.env.stage}`,
      description: 'API to login/register/delete/change passwords for users.',
      defaultCorsPreflightOptions: {
        allowOrigins: props.env.stage === 'prod' ? [props.env.cloudfrontProdUrl] : ['http://localhost:3000', props.env.cloudfrontTestUrl],
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });

    const routesApiAuth = myApiAuth.root.addResource('auth');
    const item = routesApiAuth.addResource('{item}');
    item.addMethod('POST');
    item.addMethod('DELETE');
    item.addMethod('PUT');
    //


    // generate new JWT secret for auth, rotate every 30 days
    const jwtSecret = new aws_secretsmanager.Secret(this, `${props.env.projectName}--secret-auth--${props.env.stage}`, {
        secretName: `${props.env.projectName}--secret-auth--${props.env.stage}`,
        description: `JWT secret for ${props.env.projectName} for auth ${props.env.stage} environment.`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ name: `${props.env.projectName}--secret-auth--${props.env.stage}` }),
          generateStringKey: 'value',
        },
    });

    // TODO:
    // Define a Lambda function for the rotation
    const rotateSecretFn = new lambda.Function(this, `${props.env.projectName}--secret-rotation-fn--${props.env.stage}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.rotateAuthSecret',
        functionName: `${props.env.projectName}--secret-rotation-fn--${props.env.stage}`,
        environment: {
            secretId: `${props.env.projectName}--secret-auth--${props.env.stage}`,
        },
        code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
        role: myIam,

    });

    rotateSecretFn.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // jwtSecret.addRotationSchedule(`${props.env.projectName}--secret_rotation-auth--${props.env.stage}`, {
    //   automaticallyAfter: cdk.Duration.days(1),
    //   rotationLambda: rotateSecretFn,
    //   rotateImmediatelyOnUpdate: false,
    // });

    // add this secret to Lambda FN as an env var
    lambdaFnDynamoDb.addEnvironment('secret', jwtSecret.secretValue.unsafeUnwrap());
    authFn.addEnvironment('secret', jwtSecret.secretValue.unsafeUnwrap());

    const rule = new events.Rule(this, `${props.env.projectName}--secret-update-schedule-rule--${props.env.stage}`, {
      ruleName: `${props.env.projectName}--secret-update-schedule-rule--${props.env.stage}`,
      description: `Event to update auth secret for ${props.env.projectName} project ${props.env.stage} env`,
      schedule: events.Schedule.rate(cdk.Duration.days(1)),
      targets: [new eventsTargets.LambdaFunction(rotateSecretFn, {
        retryAttempts: 0,
      })],
    });

    myIam.attachInlinePolicy(new iam.Policy(this, `${props.env.projectName}--iam-policy--${props.env.stage}`, {
        policyName: `${props.env.projectName}--iam-policy--${props.env.stage}`,
        statements: [
            new iam.PolicyStatement({
                actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Scan', 'dynamodb:DeleteItem'],
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
            new iam.PolicyStatement({
                actions: [
                    "secretsmanager:GetSecretValue",
                    "secretsmanager:RotateSecret",
                    "secretsmanager:UpdateSecret",
                ],
                resources: [jwtSecret.secretArn],
                effect: iam.Effect.ALLOW
            }),
            new iam.PolicyStatement({
                actions: ["secretsmanager:GetRandomPassword"],
                resources: "*",
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
  }
}

module.exports = { BackendCdkStack };
