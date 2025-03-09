const { mockClient } = require('aws-sdk-client-mock');
require("aws-sdk-client-mock-jest");
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SSMClient } = require('@aws-sdk/client-ssm');
const { SESClient } = require("@aws-sdk/client-ses");
const { SQSClient } = require("@aws-sdk/client-sqs");
const { getAudio, getIncorrectItems, getAIDataBasedOnUserInput } = require('../../lib/functions/helpers/openai');
const { cleanUpFileName, getSecret } = require('../../lib/functions/helpers');

// Mock clients
// const ddbMock = mockClient(DynamoDBDocumentClient);
// const ssmMock = mockClient(SSMClient);
// const sesMock = mockClient(SESClient);
// const sqsMock = mockClient(SQSClient);

// Mock helper functions
// jest.mock('../../lib/functions/helpers', () => ({
//   findAll: jest.fn(),
//   findAllByPrimaryKey: jest.fn(),
//   findUserByEmail: jest.fn(),
//   findUser: jest.fn(),
//   getEventBridgeRuleInfo: jest.fn(),
//   getRateExpressionNextRun: jest.fn(),
//   getSecret: jest.fn(),
//   saveBatchItems: jest.fn(),
//   cleanUpFileName: jest.fn(), // ??? why do I need to mock this
//   s3UploadFile: jest.fn(),
//   responseWithError: jest.fn().mockImplementation((code, message) => ({
//     statusCode: code,
//     body: JSON.stringify({ message })
//   }))
// }));

jest.mock('../../lib/functions/helpers/openai', () => ({
  isAiDataValid: jest.fn(),
  getAudio: jest.fn(() => {
    const path = require('path');
    const fs = require('fs');

    const audioFilePath = path.resolve(__dirname, '../fixtures/test-item.mp3');
    return fs.readFileSync(audioFilePath);
  }),
  getIncorrectItems: jest.fn(),
  getAIDataBasedOnUserInput: jest.fn(),
}));

const setupTestEnv = async () => {
  // Need to get secret to sign JWT for tests
  const secretJwt = await getSecret(process.env.SECRET_ID);
  process.env.SECRET_ID_VALUE = secretJwt;
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
  // ddbMock,
  // ssmMock,
  // sesMock,
  // sqsMock,
  setupTestEnv,
  // clearMocks,
};