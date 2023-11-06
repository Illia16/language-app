const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamoDb = require('aws-cdk-lib/aws-dynamodb');
const apiGateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const path = require('path')

class BackendCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    console.log('environment2', props.env.stage);

    const websiteBucket = new s3.Bucket(this, `${props.env.projectName}-${props.env.stage}`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: `${props.env.projectName}-${props.env.stage}`,
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
            filePath: __dirname + '/basic_auth/index.js',
        }),
        functionName: `cfFunction-${props.env.projectName}-${props.env.stage}`,
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

    myIam.attachInlinePolicy(new iam.Policy(this, `iamPolicy-${props.env.projectName}-${props.env.stage}`, {
            statements: [
                new iam.PolicyStatement({
                    actions: ['dynamodb:Query', 'dynamodb:BatchWriteItem', 'dynamodb:UpdateItem'],
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
                    resources: [myTable.tableArn],
                    effect: iam.Effect.ALLOW,
                }),
            ],
        })
    )

    const lambdaFnDynamoDb = new lambda.Function(this, `lambdaFnDynamoDb-${props.env.projectName}-${props.env.stage}`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, 'dynamodb')),
        functionName: `lambdaFnDynamoDb-${props.env.projectName}-${props.env.stage}`,
        role: myIam,
        environment: {
          env: props.env.stage,
          projectName: props.env.projectName,
        }
    });

    // the below line attaches all dynamodb actions to the created by default iam role. we don't want that.
    // myTable.grantReadWriteData(lambdaFnDynamoDb);

    const myApi = new apiGateway.LambdaRestApi(this, `api-study-items--${props.env.projectName}-${props.env.stage}`, {
      handler: lambdaFnDynamoDb,
      proxy: false,
      restApiName: `api-study-items--${props.env.projectName}-${props.env.stage}`,
      description: 'API to get/update/post/delete language items of users.',
      defaultCorsPreflightOptions: {
        allowOrigins: props.env.stage === 'prod' ? ['https://d3uhxucz1lwio6.cloudfront.net'] : ['http://localhost:3000', 'https://d3uhxucz1lwio6.cloudfront.net'],
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

    // user
    // itemID
    // languageStudying
    // languageMortherTongue
    // item (item to study)
    // itemType (tenses, words, sentanses)
    // itemTypeCategory (for various languages: presentPerfect, modal verbs, cooking words, mandarinChar)
    // itemCorrect (translation to languageMortherTongue)
    // level (user mastery lvl for the item)

    // test script
    //aws dynamodb put-item --table-name db-personal-project--language-app-test --profile personal --region us-east-1 --item  "{\"user\": {\"S\": \"illia\"}, \"itemID\": {\"S\": \"я-21321321\"}, \"languageStudying\": {\"S\": \"cn\"}, \"languageMortherTongue\": {\"S\": \"ru\"}, \"item\": {\"S\": \"我\"}, \"itemType\": {\"S\": \"word\"}, \"itemTypeCategory\": {\"S\": \"mandarinChar\"}, \"itemCorrect\": {\"S\": \"Я\"}, \"level\": {\"S\": \"0\"}}"
  }
}

module.exports = { BackendCdkStack };
