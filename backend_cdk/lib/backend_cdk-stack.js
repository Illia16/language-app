const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
// const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamoDb = require('aws-cdk-lib/aws-dynamodb');
const apiGateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const aws_ssm = require('aws-cdk-lib/aws-ssm');
const events = require('aws-cdk-lib/aws-events');
const eventsTargets = require('aws-cdk-lib/aws-events-targets');
const sqs = require('aws-cdk-lib/aws-sqs');
const acm = require('aws-cdk-lib/aws-certificatemanager');
const lambdaEventSource = require('aws-cdk-lib/aws-lambda-event-sources');
const path = require('path');
const crypto = require('crypto');

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const STAGE = props.env.STAGE;
    const PROJECT_NAME = props.env.PROJECT_NAME;
    const OPEN_AI_KEY = props.env.OPEN_AI_KEY;
    const CLOUDFRONT_URL = props.env.CLOUDFRONT_URL;
    const CLOUDFRONT_LOGIN = props.env.CLOUDFRONT_LOGIN;
    const CLOUDFRONT_PW = props.env.CLOUDFRONT_PW;
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
      assumedBy: new iam.CompositePrincipal(new iam.ServicePrincipal('lambda.amazonaws.com'), new iam.ServicePrincipal('secretsmanager.amazonaws.com'), new iam.ServicePrincipal('events.amazonaws.com')),
      roleName: `${PROJECT_NAME}--iam-role--${STAGE}`,
    })

    const cfFunction = new cloudfront.Function(this, `${PROJECT_NAME}--cf-fn--${STAGE}`, {
      code: cloudfront.FunctionCode.fromInline(`function handler(event) {
            const expectedUsername = "${CLOUDFRONT_LOGIN}";
            const expectedPassword = "${CLOUDFRONT_PW}";

            let request = event.request;
            const headers = request.headers;
            const isProd = headers.host.value === 'languageapp.illusha.net';

            // Redirect if the request is from the CloudFront domain
            if (['d3qignet23dx6u.cloudfront.net', 'd15k5khhejlcll.cloudfront.net'].includes(headers.host.value)) {
                const customDomain = headers.host.value === "d15k5khhejlcll.cloudfront.net" ? "languageapp.illusha.net" : "languageapp-test.illusha.net"

                return {
                    statusCode: 301,
                    statusDescription: 'Moved Permanently',
                    headers: {
                        'location': { value: 'https://' + customDomain + request.uri }
                    }
                };
            }

            const objReject = {
                statusCode: 401,
                statusDescription: 'Unauthorized',
                headers: {
                    'www-authenticate': { value: 'Basic' },
                },
            };

            if (!isProd) {
                if (!headers.authorization) {
                    return objReject;
                }

                const authHeader = headers.authorization.value;
                const authString = authHeader.split(' ')[1];
                const authDecoded = Buffer.from(authString, 'base64').toString('utf-8');
                const split = authDecoded.split(':');

                if (split[0] !== expectedUsername || split[1] !== expectedPassword) {
                    return objReject;
                }
            }

            request.uri = request.uri.replace(/^(.*?)(\\/?[^.\//]*\\.[^.\\/]*)?\\/?$/, function($0, $1, $2) {
                return $1 + ($2 ? $2 : "/index.html");
            });

            return request;
        }`),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      functionName: `${PROJECT_NAME}--cf-fn--${STAGE}`,
      comment: 'CF function to handle redirects, basic auth, redirects from cf domain to a custom one etc.',
    });

    const oai = new cloudfront.OriginAccessIdentity(this, `${PROJECT_NAME}--oai--${STAGE}`, {
      comment: `${PROJECT_NAME}--oai--${STAGE}`,
    });

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
    });

    // const oac = new cloudfront.S3OriginAccessControl(this, `${PROJECT_NAME}--oac--${STAGE}`, {
    //   originAccessControlName: `${PROJECT_NAME}--oac--${STAGE}`,
    //   signing: cloudfront.Signing.SIGV4_ALWAYS,
    // });

    // new cloudfront.Distribution(this, `${PROJECT_NAME}--cf--${STAGE}`, {
    //   defaultBehavior: {
    //     origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
    //       originAccessControl: oac,
    //     }),
    //     functionAssociations: [{
    //       eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
    //       function: cfFunction,
    //     }]
    //   },
    //   certificate: ssl_cert,
    //   domainNames: [STAGE === 'prod' ? 'languageapp.illusha.net' : 'languageapp-test.illusha.net'],
    //   minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    //   sslSupportMethod: cloudfront.SSLMethod.SNI,
    //   defaultRootObject: 'index.html',
    // });

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
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X, lambda.Runtime.NODEJS_22_X]
    });

    // Lambda fn #1 (handle items by user: add, delete, update)
    const lambdaFnDynamoDb = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-data--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'data/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-data--${STAGE}`,
      role: myIam,
      environment: {
        STAGE: STAGE,
        PROJECT_NAME: PROJECT_NAME,
        CLOUDFRONT_URL: CLOUDFRONT_URL,
        OPEN_AI_KEY: OPEN_AI_KEY,
        S3_FILES: websiteBucketFiles.bucketName,
        DB_DATA: myTable.tableName,
        DB_USERS: myTableUsers.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer]
    });

    // the below grants the Lambda fn basic things (like logs)
    lambdaFnDynamoDb.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    // Lambda fn #2 (handle users: login, generate-invitation-code, register, delete-account, forgot-password, change-password)
    const authFn = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-users--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
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
        S3_FILES: websiteBucketFiles.bucketName,
        DB_DATA: myTable.tableName,
        DB_USERS: myTableUsers.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer],
    });
    authFn.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    )

    // Lambda fn #3 (generate items by AI from user input)
    const lambdaFnDataAIGenerated = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-data-ai-generated--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'data-ai-generated/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-data-ai-generated--${STAGE}`,
      role: myIam,
      environment: {
        STAGE: STAGE,
        PROJECT_NAME: PROJECT_NAME,
        CLOUDFRONT_URL: CLOUDFRONT_URL,
        OPEN_AI_KEY: OPEN_AI_KEY,
        SQS_URL: SQS_URL,
        S3_FILES: websiteBucketFiles.bucketName,
        DB_DATA: myTable.tableName,
        DB_USERS: myTableUsers.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer]
    });

    // the below grants the Lambda fn basic things (like logs)
    lambdaFnDataAIGenerated.role.addManagedPolicy(
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

    const routeDataAIGenerated = myApi.root.addResource('data-ai-generated');
    routeDataAIGenerated.addMethod('POST', new apiGateway.LambdaIntegration(lambdaFnDataAIGenerated));

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

    const apiUsagePlan = new apiGateway.UsagePlan(this, `${PROJECT_NAME}--api-usage-plan--${STAGE}`, {
      name: `${PROJECT_NAME}--api-usage-plan--${STAGE}`,
      description: 'API usage plan to handle number of requests.',
      quota: {
        limit: 1000,
        period: apiGateway.Period.DAY,
      },
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
    });
    [myApi, myApiAuth].forEach((el) => {
      apiUsagePlan.addApiStage({
        stage: el.deploymentStage,
      });
    });

    const ssmSecret = new aws_ssm.StringParameter(this, `${PROJECT_NAME}--ssm-auth--${STAGE}`, {
      parameterName: `${PROJECT_NAME}--ssm-auth--${STAGE}`,
      description: `SSM secret for ${PROJECT_NAME} for auth ${STAGE} environment.`,
      stringValue: crypto.randomBytes(32).toString('hex'),
    });

    // Lambda fn #4 (manage users: delete)
    const manageUsersFn = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-manage-users--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'manage-users/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-manage-users--${STAGE}`,
      role: myIam,
      environment: {
        STAGE: STAGE,
        PROJECT_NAME: PROJECT_NAME,
        S3_FILES: websiteBucketFiles.bucketName,
        DB_DATA: myTable.tableName,
        DB_USERS: myTableUsers.tableName,
        OPEN_AI_KEY: OPEN_AI_KEY,
      },
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer],
    });
    manageUsersFn.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Lambda fn #5 (rotate secret)
    const rotateSecretFn = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-secret-rotation--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'secret-rotation/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-secret-rotation--${STAGE}`,
      environment: {
        SECRET_ID: ssmSecret.parameterName,
        OPEN_AI_KEY: OPEN_AI_KEY,
      },
      role: myIam,
      layers: [lambdaLayer],
    });

    rotateSecretFn.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    const rule = new events.Rule(this, `${PROJECT_NAME}--secret-update-schedule-rule--${STAGE}`, {
      ruleName: `${PROJECT_NAME}--secret-update-schedule-rule--${STAGE}`,
      description: `Event to update auth secret for ${PROJECT_NAME} project ${STAGE} env`,
      schedule: events.Schedule.cron({ minute: '5', hour: '10', day: '25', month: '*', year: '*' }),
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
    authFn.addEnvironment('EB_MANAGE_USERS_NAME', manageUsersRule.ruleName);

    const myDLQ = new sqs.Queue(this, `${PROJECT_NAME}--dlq--${STAGE}`, {
      queueName: `${PROJECT_NAME}--dlq--${STAGE}`,
      retentionPeriod: cdk.Duration.days(14),
    });

    const myQueue = new sqs.Queue(this, `${PROJECT_NAME}--sqs--${STAGE}`, {
      queueName: `${PROJECT_NAME}--sqs--${STAGE}`,
      deadLetterQueue: {
        queue: myDLQ,
        maxReceiveCount: 1,
      },
    });

    // Lambda fn #6 (handle users: sqs)
    const lambdaFnSQS = new lambda.Function(this, `${PROJECT_NAME}--lambda-fn-users-sqs--${STAGE}`, {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'users-sqs/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      functionName: `${PROJECT_NAME}--lambda-fn-users-sqs--${STAGE}`,
      role: myIam,
      environment: {
        CLOUDFRONT_URL: CLOUDFRONT_URL,
        PROJECT_NAME: PROJECT_NAME,
        STAGE: STAGE,
        OPEN_AI_KEY: OPEN_AI_KEY,
        S3_FILES: websiteBucketFiles.bucketName,
        DB_DATA: myTable.tableName,
        DB_USERS: myTableUsers.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      events: [new lambdaEventSource.SqsEventSource(myQueue, {
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
            "ssm:GetParameters",
            "ssm:PutParameter",
            "ssm:DeleteParameter",
          ],
          resources: [ssmSecret.parameterArn],
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
      ],
    })
    )
  }
}

module.exports = { BackendCdkStack };
