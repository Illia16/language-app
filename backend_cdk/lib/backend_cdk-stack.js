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
const sqs = require('aws-cdk-lib/aws-sqs');
const acm = require('aws-cdk-lib/aws-certificatemanager');
const lambdaEventSource = require('aws-cdk-lib/aws-lambda-event-sources');
const path = require('path');

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const STAGE = props.env.STAGE;
    const PROJECT_NAME = props.env.PROJECT_NAME;
    const OPEN_AI_KEY = props.env.OPEN_AI_KEY;
    const CLOUDFRONT_URL = props.env.CLOUDFRONT_URL;
    const SQS_URL = props.env.SQS_URL;
    const CERTIFICATE_ARN = props.env.CERTIFICATE_ARN;

    const websiteBucket = new s3.Bucket(this, `${PROJECT_NAME}--s3-site--${STAGE}`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: `${PROJECT_NAME}--s3-site--${STAGE}`,
    });

    const websiteBucketFiles = new s3.Bucket(this, `${PROJECT_NAME}--s3-files--${STAGE}`, {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      bucketName: `${PROJECT_NAME}--s3-files--${STAGE}`,
    });

    const myIam = new iam.Role(this, `${PROJECT_NAME}--iam-role--${STAGE}`, {
        // assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('lambda.amazonaws.com'), new iam.ServicePrincipal('secretsmanager.amazonaws.com'), new iam.ServicePrincipal('events.amazonaws.com')),
        roleName: `${PROJECT_NAME}--iam-role--${STAGE}`,
    })

    // Basic Auth
    // const auth = new cloudfront.experimental.EdgeFunction(this, `${PROJECT_NAME}-auth--${STAGE}`, {
    //     runtime: lambda.Runtime.NODEJS_18_X,
    //     functionName: `${PROJECT_NAME}--fn_auth--${STAGE}`,
    //     handler: 'index.handler',
    //     code: lambda.Code.fromAsset(path.join(__dirname, 'basic_auth')),
    // })


    // const myFunc = new cloudfront.experimental.EdgeFunction(this, `${PROJECT_NAME}--redirect--${STAGE}`, {
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   functionName: `{PROJECT_NAME}--redirect--${STAGE}`,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset(path.join(__dirname, 'basic_auth')),
    // });

    const cfFunction = new cloudfront.Function(this, `${PROJECT_NAME}--cf-fn--${STAGE}`, {
        code: cloudfront.FunctionCode.fromFile({
            filePath: __dirname + '/cf-functions/index.js',
        }),
        runtime: cloudfront.FunctionRuntime.JS_2_0,
        functionName: `${PROJECT_NAME}--cf-fn--${STAGE}`,
        comment: 'CF function to handle redirects, basic auth, redirects from cf domain to a custom one etc.',
    });

    const oai = new cloudfront.OriginAccessIdentity(this, `${PROJECT_NAME}--oai--${STAGE}`, {
      comment: `${PROJECT_NAME}--oai--${STAGE}`,
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

    const ssl_cert = acm.Certificate.fromCertificateArn(this, `${PROJECT_NAME}--certificate--${STAGE}`, CERTIFICATE_ARN); // uploaded manually
    new cloudfront.CloudFrontWebDistribution(this, `${PROJECT_NAME}--cf--${STAGE}`, {
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
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
        ssl_cert,
        {
          aliases: [STAGE === 'prod' ? 'languageapp.illusha.net' : 'languageapp-test.illusha.net'], // only 2 envs for this app
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          sslMethod: cloudfront.SSLMethod.SNI,          
        },
      ),
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
      ],
      // loggingConfig: {
      //   bucket: websiteBucketFiles,
      //   prefix: 'viewer_logs',
      // }
    });

    const myTable = new dynamoDb.TableV2(this, `${PROJECT_NAME}--db-data--${STAGE}`, {
      tableName: `${PROJECT_NAME}--db-data--${STAGE}`,
      partitionKey: {
        name: 'user',
        type: dynamoDb.AttributeType.STRING
      },
      sortKey: {
        name: 'itemID',
        type: dynamoDb.AttributeType.STRING
      }
    });

    const myTableUsers = new dynamoDb.TableV2(this, `${PROJECT_NAME}--db-users--${STAGE}`, {
      tableName: `${PROJECT_NAME}--db-users--${STAGE}`,
      partitionKey: {
        name: 'user',
        type: dynamoDb.AttributeType.STRING
      },
      sortKey: {
        name: 'userId',
        type: dynamoDb.AttributeType.STRING
      },
      globalSecondaryIndexes: [
        {
          indexName: 'userEmailIndex',
          partitionKey: {
            name: 'userEmail',
            type: dynamoDb.AttributeType.STRING
          },
          projectionType: dynamoDb.ProjectionType.ALL,
        }
      ]
    })

    const lambdaLayer = new lambda.LayerVersion(this, `${PROJECT_NAME}--fn-layer--${STAGE}`, {
      layerVersionName: `${PROJECT_NAME}--fn-layer--${STAGE}`,
      code: lambda.Code.fromAsset(path.join(__dirname, 'layers/layer-lambda')),
      compatibleArchitectures: [lambda.Architecture.X86_64, lambda.Architecture.ARM_64],
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X, lambda.Runtime.NODEJS_20_X]
    });

    const lambdaFnDynamoDb = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-data--${STAGE}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'data/index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
        functionName: `${PROJECT_NAME}--lambda-fn-data--${STAGE}`,
        role: myIam,
        environment: {
          STAGE: STAGE,
          PROJECT_NAME: PROJECT_NAME,
          CLOUDFRONT_URL: CLOUDFRONT_URL,
          OPEN_AI_KEY: OPEN_AI_KEY,
        },
        timeout: cdk.Duration.seconds(30),
        layers: [lambdaLayer]
    });

    // the below line attaches all dynamodb actions to the created by default iam role. we don't want that.
    // myTable.grantReadWriteData(lambdaFnDynamoDb);
    // the below grants the Lambda fn basic things (like logs)
    lambdaFnDynamoDb.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    const authFn = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-users--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-users--${STAGE}`,
      role: myIam,
      environment: {
        STAGE: STAGE,
        PROJECT_NAME: PROJECT_NAME,
        CLOUDFRONT_URL: CLOUDFRONT_URL,
        SQS_URL: SQS_URL,
        OPEN_AI_KEY: OPEN_AI_KEY,
      },
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer],
    });
    authFn.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    // API #1
    const myApi = new apiGateway.LambdaRestApi(this, `${PROJECT_NAME}--api-data--${STAGE}`, {
      handler: lambdaFnDynamoDb,
      deployOptions: {
        stageName: STAGE,
      },
      proxy: false,
      restApiName: `${PROJECT_NAME}--api-data--${STAGE}`,
      description: 'API to get/update/post/delete language items of users.',
      binaryMediaTypes: ['multipart/form-data'],
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000', CLOUDFRONT_URL],
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });
    const routeStudyItems = myApi.root.addResource('data');
    routeStudyItems.addMethod('GET')
    routeStudyItems.addMethod('POST')
    routeStudyItems.addMethod('PUT')
    routeStudyItems.addMethod('DELETE')
    // const stage = new apiGateway.Stage(this, `${PROJECT_NAME}--api-stage-data--${STAGE}`,
    //   {
    //     deployment: new apiGateway.Deployment(this, `${PROJECT_NAME}--api-deployment-data--${STAGE}`, {api: myApi}),
    //     stageName: STAGE,
    //   }
    // );
    // myApi.deploymentStage = STAGE;
    //

    // API #2
    const myApiAuth = new apiGateway.LambdaRestApi(this, `${PROJECT_NAME}--api-users--${STAGE}`, {
      handler: authFn,
      proxy: false,
      deployOptions: {
        stageName: STAGE,
      },
      restApiName: `${PROJECT_NAME}--api-users--${STAGE}`,
      description: 'API to login/register/delete/change passwords for users.',
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:3000', CLOUDFRONT_URL],
        allowMethods: apiGateway.Cors.ALL_METHODS,
      },
    });

    const routesApiAuth = myApiAuth.root.addResource('users');
    const item = routesApiAuth.addResource('{item}');
    item.addMethod('POST');
    item.addMethod('DELETE');
    item.addMethod('PUT');
    //

    [myApi, myApiAuth].forEach(el => {
      const apiUsagePlan = el.addUsagePlan(`${PROJECT_NAME}--api-usage-plan--${STAGE}`, {
        name: `${PROJECT_NAME}--api-usage-plan--${STAGE}`,
        description: `API usage plan to handle number of requests.`,
        quota: {
          limit: 1000,
          period: apiGateway.Period.DAY,
        },
        throttle: {
          rateLimit: 100,
          burstLimit: 200,
        },
      });

      apiUsagePlan.addApiStage({
        stage: el.deploymentStage,
      });
    })


    // generate new JWT secret for auth, rotate every 30 days
    const jwtSecret = new aws_secretsmanager.Secret(this, `${PROJECT_NAME}--secret-auth--${STAGE}`, {
        secretName: `${PROJECT_NAME}--secret-auth--${STAGE}`,
        description: `JWT secret for ${PROJECT_NAME} for auth ${STAGE} environment.`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ name: `${PROJECT_NAME}--secret-auth--${STAGE}` }),
          generateStringKey: 'value',
        },
    });

    // Define a Lambda function for the rotation
    const manageUsersFn = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-manage-users--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'manage-users/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-manage-users--${STAGE}`,
      role: myIam,
      environment: {
        STAGE: STAGE,
        PROJECT_NAME: PROJECT_NAME,
      },
      timeout: cdk.Duration.seconds(30),
    });
    manageUsersFn.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Define a Lambda function for the rotation
    const rotateSecretFn = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-secret-rotation--${STAGE}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'secret-rotation/index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
        functionName: `${PROJECT_NAME}--lambda-fn-secret-rotation--${STAGE}`,
        environment: {
            SECRET_ID: `${PROJECT_NAME}--secret-auth--${STAGE}`,
        },
        role: myIam,

    });

    rotateSecretFn.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // jwtSecret.addRotationSchedule(`${PROJECT_NAME}--secret_rotation-auth--${STAGE}`, {
    //   automaticallyAfter: cdk.Duration.days(1),
    //   rotationLambda: rotateSecretFn,
    //   rotateImmediatelyOnUpdate: false,
    // });

    const rule = new events.Rule(this, `${PROJECT_NAME}--secret-update-schedule-rule--${STAGE}`, {
      ruleName: `${PROJECT_NAME}--secret-update-schedule-rule--${STAGE}`,
      description: `Event to update auth secret for ${PROJECT_NAME} project ${STAGE} env`,
      schedule: events.Schedule.rate(cdk.Duration.days(25)),
      targets: [new eventsTargets.LambdaFunction(rotateSecretFn, {
        retryAttempts: 0,
      })],
    });

    const manageUsersRule = new events.Rule(this, `${PROJECT_NAME}--manage-users-schedule-rule--${STAGE}`, {
      ruleName: `${PROJECT_NAME}--manage-users-schedule-rule--${STAGE}`,
      description: `Event to manage users for ${PROJECT_NAME} project ${STAGE} env`,
      schedule: events.Schedule.rate(cdk.Duration.days(30)),
      targets: [new eventsTargets.LambdaFunction(manageUsersFn, {
        retryAttempts: 0,
      })],
    });

    // SQS
    // const myDeadLetterQueue = new sqs.Queue(this, `${PROJECT_NAME}--sqs-dlq--${STAGE}`, {
    //   queueName: `${PROJECT_NAME}--sqs-dlq--${STAGE}`,
    // });
    // TODO: this does not work properly. Fix it later.
    const myQueue = new sqs.Queue(this, `${PROJECT_NAME}--sqs--${STAGE}`, {
      queueName: `${PROJECT_NAME}--sqs--${STAGE}`,
      retentionPeriod: cdk.Duration.hours(1),
      // deadLetterQueue: {
      //   maxReceiveCount: 2,
      //   queue: myDeadLetterQueue,
      // }
    });
    const lambdaFnSQS = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-users-sqs--${STAGE}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'users-sqs/index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
        functionName: `${PROJECT_NAME}--lambda-fn-users-sqs--${STAGE}`,
        role: myIam,
        environment: {
          CLOUDFRONT_URL: CLOUDFRONT_URL,
          PROJECT_NAME: PROJECT_NAME,
          STAGE: STAGE,
        },
        events: [new lambdaEventSource.SqsEventSource(myQueue, {
          // enabled: true,
          batchSize: 1,
        })],
        layers: [lambdaLayer],
    });

    lambdaFnSQS.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    // 

    myIam.attachInlinePolicy(new iam.Policy(this, `${PROJECT_NAME}--iam-policy--${STAGE}`, {
        policyName: `${PROJECT_NAME}--iam-policy--${STAGE}`,
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
                resources: [
                  myTable.tableArn, 
                  myTableUsers.tableArn, 
                  `${myTableUsers.tableArn}/index/*`
                ],
                effect: iam.Effect.ALLOW,
            }),
            new iam.PolicyStatement({
                actions: [
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    // "s3:GetBucketAcl",
                    // "s3:PutBucketAcl",
                    // "s3:PutObjectAcl",
                    // "s3:GetObjectAcl",
                    // "s3:*"
                ],
                resources: [websiteBucketFiles.bucketArn, `${websiteBucketFiles.bucketArn}/*`],
                effect: iam.Effect.ALLOW
            }),
            new iam.PolicyStatement({
                actions: [
                    "events:DescribeRule",
                ],
                resources: [manageUsersRule.ruleArn],
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
            new iam.PolicyStatement({
              actions: [
                  "ses:SendEmail",
              ],
              resources: "*",
              effect: iam.Effect.ALLOW,
              conditions: {
                StringEquals: {
                  "ses:FromAddress": `${process.env.PROJECT_NAME}@devemail.illusha.net`,
                }
              }
            }),
            new iam.PolicyStatement({
              actions: [
                  "ses:VerifyEmailIdentity",
              ],
              resources: "*",
              effect: iam.Effect.ALLOW,
            }),
            new iam.PolicyStatement({
              actions: [
                  "sqs:SendMessage",
              ],
              resources: [myQueue.queueArn],
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
