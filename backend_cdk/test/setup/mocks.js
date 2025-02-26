const { mockClient } = require('aws-sdk-client-mock');
require("aws-sdk-client-mock-jest");
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SSMClient } = require('@aws-sdk/client-ssm');
const { SESClient } = require("@aws-sdk/client-ses");

// Mock clients
const ddbMock = mockClient(DynamoDBDocumentClient);
const ssmMock = mockClient(SSMClient);
const sesMock = mockClient(SESClient);

// Mock helper functions
jest.mock('../../lib/functions/helpers', () => ({
  findAll: jest.fn(),
  findAllByPrimaryKey: jest.fn(),
  findUserByEmail: jest.fn(),
  getSecret: jest.fn(),
  saveBatchItems: jest.fn(),
}));

jest.mock('../../lib/functions/helpers/openai', () => ({
  isAiDataValid: jest.fn(),
}));

const setupTestEnv = () => {
  process.env.STAGE = 'test';
  process.env.PROJECT_NAME = 'test-project';
  process.env.DB_DATA = 'test-data-table';
  process.env.DB_USERS = 'test-users-table';
  process.env.S3_FILES = 'test-bucket';
  process.env.SECRET_ID = '/test/secret';
};

const clearMocks = () => {
  ddbMock.reset();
  ssmMock.reset();
  sesMock.reset();
  jest.clearAllMocks();
};

module.exports = {
  ddbMock,
  ssmMock,
  sesMock,
  setupTestEnv,
  clearMocks,
};