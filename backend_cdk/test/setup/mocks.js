const { mockClient } = require('aws-sdk-client-mock');
require("aws-sdk-client-mock-jest");
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SSMClient } = require('@aws-sdk/client-ssm');
const { SESClient } = require("@aws-sdk/client-ses");
const { SQSClient } = require("@aws-sdk/client-sqs");
const { getAudio, getIncorrectItems, getAIDataBasedOnUserInput } = require('../../lib/functions/helpers/openai');
const { cleanUpFileName } = require('../../lib/functions/helpers');
// const jwt = require('jsonwebtoken');
// jest.mock('jsonwebtoken');

// Mock clients
const ddbMock = mockClient(DynamoDBDocumentClient);
const ssmMock = mockClient(SSMClient);
const sesMock = mockClient(SESClient);
const sqsMock = mockClient(SQSClient);
// Mock helper functions
jest.mock('../../lib/functions/helpers', () => ({
  findAll: jest.fn(),
  findAllByPrimaryKey: jest.fn(),
  findUserByEmail: jest.fn(),
  findUser: jest.fn(),
  getEventBridgeRuleInfo: jest.fn(),
  getRateExpressionNextRun: jest.fn(),
  getSecret: jest.fn(),
  saveBatchItems: jest.fn(),
  cleanUpFileName: jest.fn(), // ??? why do I need to mock this
  s3UploadFile: jest.fn(),
  responseWithError: jest.fn().mockImplementation((code, message) => ({
    statusCode: code,
    body: JSON.stringify({ message })
  }))
}));

jest.mock('../../lib/functions/helpers/openai', () => ({
  isAiDataValid: jest.fn(),
  getAudio: jest.fn(),
  getIncorrectItems: jest.fn(),
  getAIDataBasedOnUserInput: jest.fn(),
}));

const setupTestEnv = () => {
  process.env.STAGE = 'test';
  process.env.PROJECT_NAME = 'test-project';
  process.env.DB_DATA = 'test-data-table';
  process.env.DB_USERS = 'test-users-table';
  process.env.S3_FILES = 'test-bucket';
  process.env.SECRET_ID = '/test/secret';
  process.env.CLOUDFRONT_URL = 'test.com';
  process.env.CLOUDFRONT_LOGIN = 'test_login';
  process.env.CLOUDFRONT_PW = 'test_pw';
  process.env.OPEN_AI_KEY = 'test_open_ai_key';
  process.env.SQS_URL = 'test_sqs_url';
  process.env.CERTIFICATE_ARN = 'test_certificate_arn';
  process.env.EB_MANAGE_USERS_NAME = 'test_event_bridge_name';
};

const clearMocks = () => {
  ddbMock.reset();
  ssmMock.reset();
  sesMock.reset();
  sqsMock.reset();
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

module.exports = {
  ddbMock,
  ssmMock,
  sesMock,
  sqsMock,
  setupTestEnv,
  clearMocks,
};