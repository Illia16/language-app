const { mockClient } = require('aws-sdk-client-mock');
require("aws-sdk-client-mock-jest");
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SSMClient } = require('@aws-sdk/client-ssm');
const { SESClient } = require("@aws-sdk/client-ses");
const { SQSClient } = require("@aws-sdk/client-sqs");
const { getAudio, getIncorrectItems, getAIDataBasedOnUserInput } = require('../../lib/functions/helpers/openai');
const { cleanUpFileName, getSecret } = require('../../lib/functions/helpers');
const { createInvitationCode, createUser, deleteUser, deleteMultipleUserItems } = require('../util');

const { v4: uuidv4 } = require("uuid");

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


const tempUsers = [
  {
    username: process.env.TEST_USER_PREMIUM,
    userId: process.env.TEST_USER_PREMIUM_ID,
    password: process.env.TEST_USER_PREMIUM_PASSWORD,
    userRole: 'admin',
    userEmail: process.env.TEST_USER_PREMIUM_EMAIL,
    userTier: 'premium',
  },
  {
    username: process.env.TEST_USER,
    userId: process.env.TEST_USER_ID,
    password: process.env.TEST_USER_PASSWORD,
    userRole: 'user',
    userEmail: process.env.TEST_USER_EMAIL,
    userTier: 'default',
  },
  {
    username: process.env.TEST_USER_DELETE,
    userId: process.env.TEST_USER_DELETE_ID,
    password: process.env.TEST_USER_DELETE_PASSWORD,
    userRole: 'delete',
    userEmail: process.env.TEST_USER_DELETE_EMAIL,
    userTier: 'default',
  }
]

const setupTestEnv = async () => {
  // Need to get secret to sign JWT for tests
  const secretJwt = await getSecret(process.env.SECRET_ID);
  process.env.SECRET_ID_VALUE = secretJwt;

  // Create invitation code
  const invitationCode = await createInvitationCode(process.env.DB_USERS);
  process.env.INVITATION_CODE = invitationCode;

  // Create users
  for (const user of tempUsers) {
    await createUser({
      dbUsers: process.env.DB_USERS,
      username: user.username,
      userId: user.userId,
      password: user.password,
      userRole: user.userRole,
      userEmail: user.userEmail,
      userTier: user.userTier,
    });
  };
};

const cleanupTestEnv = async () => {
  await Promise.all(tempUsers.map(async (user) => {
    await deleteUser({ dbUsers: process.env.DB_USERS, user: user.username, userId: user.userId })
  }));

  const registeredUserName = 'user_register_from_integration_test';
  const registeredUserId = registeredUserName + '___' + process.env.INVITATION_CODE;
  const registeredUserItemId = 'i_like_learning_english_every_day___welcome_item'; // welcome item ID that comes from when user registers

  await deleteUser({ dbUsers: process.env.DB_USERS, user: registeredUserName, userId: registeredUserId });
  await deleteMultipleUserItems({ dbData: process.env.DB_DATA, items: [{ user: registeredUserName, itemID: registeredUserItemId }] });

  const clearMocks = () => {
    ddbMock.reset();
    ssmMock.reset();
    sesMock.reset();
    sqsMock.reset();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  };
}

module.exports = {
  // ddbMock,
  // ssmMock,
  // sesMock,
  // sqsMock,
  setupTestEnv,
  // clearMocks,
  cleanupTestEnv,
  tempUsers,
};