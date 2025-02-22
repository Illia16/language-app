const { mockClient } = require('aws-sdk-client-mock');
require("aws-sdk-client-mock-jest");
const { DynamoDBDocumentClient, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const { handler: manageUsersHandler } = require('../lib/functions/manage-users');
const { handler: secretRotationHandler } = require('../lib/functions/secret-rotation');
const { handler: usersSqsHandler } = require('../lib/functions/users-sqs');

const { findAll, findAllByPrimaryKey, findUserByEmail, getSecret, saveBatchItems } = require('../lib/functions/helpers');
const { isAiDataValid } = require('../lib/functions/helpers/openai');
const { SSMClient, PutParameterCommand } = require('@aws-sdk/client-ssm');
const { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");

// Mock the DynamoDB Document Client
const ddbMock = mockClient(DynamoDBDocumentClient);
// Mock the SSM client
const ssmMock = mockClient(SSMClient);
// Mock the SES client
const sesMock = mockClient(SESClient);

// Mock the helper functions
jest.mock('../lib/functions/helpers', () => ({
  findAll: jest.fn(),
  findAllByPrimaryKey: jest.fn(),
  findUserByEmail: jest.fn(),
  getSecret: jest.fn(),
  saveBatchItems: jest.fn(),
  isAiDataValid: jest.fn,
}));

describe('manage-users lambda', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    ddbMock.reset();
    jest.clearAllMocks();
    ssmMock.reset();
    sesMock.reset();

    // Set up environment variables
    process.env.STAGE = 'test';
    process.env.PROJECT_NAME = 'test-project';
    process.env.DB_DATA = 'test-data-table';
    process.env.DB_USERS = 'test-users-table';
    process.env.S3_FILES = 'test-bucket';
  });

  it('should do nothing when no users to delete are found', async () => {
    // Setup
    findAll.mockResolvedValue([
      { user: 'user1', userId: '1', role: 'admin' },
      { user: 'user2', userId: '2', role: 'user' }
    ]);

    // Execute
    const results = await manageUsersHandler();

    // Verify
    expect(ddbMock.calls()).toHaveLength(0);
    expect(findAllByPrimaryKey).not.toHaveBeenCalled();
    expect(results).toBeUndefined();
    expect(results).toBe(undefined);
  });

  it('should delete users and their items when users with role "delete" are found', async () => {
    // Setup
    const usersToDelete = [
      { user: 'user1', userId: '1', role: 'premium' },
      { user: 'user2', userId: '2', role: 'active' },
      { user: 'user3', userId: '3', role: 'delete' },
      { user: 'user4', userId: '4', role: 'delete' },
      { user: 'user5', userId: '5', role: 'delete' },
      { user: 'user6', userId: '6', role: 'delete' },
    ].filter(user => user.role === 'delete');

    findAll.mockResolvedValue([
      ...usersToDelete
    ]);

    findAllByPrimaryKey.mockImplementation((table, user) => {
      return Promise.resolve([
        { user, itemID: 'item1' },
        { user, itemID: 'item2' }
      ]);
    });
    ddbMock.on(DeleteCommand).resolves({})
    // Execute
    await manageUsersHandler();

    // Verify
    // Should have been called for each user and their items (4 users * (1 user deletion + 2 items) = 12 calls)
    expect(ddbMock.calls()).toHaveLength(usersToDelete.length * (1 + 2)); // 12
    expect(findAllByPrimaryKey).toHaveBeenCalledTimes(usersToDelete.length);

    // Verify user deletions
    usersToDelete.forEach(user => {
      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: 'test-users-table',
        Key: { user: user.user, userId: user.userId }
      });
    });

    // Verify items deletions
    usersToDelete.forEach(user => {
      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: 'test-data-table',
        Key: { user: user.user, itemID: 'item1' }
      });
      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: 'test-data-table',
        Key: { user: user.user, itemID: 'item2' }
      });
    });
  });

  it('should handle errors gracefully', async () => {
    // Setup
    findAll.mockRejectedValue(new Error('Database error'));

    // Execute and verify
    await expect(manageUsersHandler()).rejects.toThrow('Database error');
  });
});

describe('Secret Rotation Lambda', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    ssmMock.reset();
  });

  it('should update SSM parameter with new random value', async () => {
    // Mock environment variable
    process.env.SECRET_ID = '/test/secret';

    // Mock successful SSM response
    ssmMock.on(PutParameterCommand).resolves();

    // Execute the handler
    await secretRotationHandler();

    // Verify SSM client was called with correct parameters
    const ssmCalls = ssmMock.calls();
    expect(ssmCalls).toHaveLength(1);

    const putParamCall = ssmCalls[0].args[0].input;
    expect(putParamCall.Name).toBe('/test/secret');
    expect(putParamCall.Type).toBe('SecureString');
    expect(putParamCall.Overwrite).toBe(true);
    expect(putParamCall.Value).toMatch(/^[a-f0-9]{64}$/);
  });
});


describe('Users SQS: forgot-password, delete-account, change-password, verify-email, parse-ai-data', () => {
  beforeEach(() => {
    ddbMock.reset();
    sesMock.reset();
    ssmMock.reset();
    jest.clearAllMocks();
  });

  const eventNames = ['forgot-password', 'forgot-password', 'change-password', 'verify-email', 'parse-ai-data'];

  it('should change password', async () => {
    const mockEvent = {
      Records: [{
          body: JSON.stringify({
              eventName: 'change-password',
              dbUsers: 'test-db',
              user: 'test-user',
              userId: 'test-user-id',
              password: 'test-user-password'
          })
      }]
    };

    ddbMock.on(UpdateCommand).resolves({})
    // Execute the handler
    const result = await usersSqsHandler(mockEvent);
    expect(ddbMock.calls()).toHaveLength(1);
    expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
      TableName: 'test-db',
      Key: {
          user: 'test-user',
          userId: 'test-user-id',
      },
    });
  });

  it('should verify-email', async () => {
    const mockEvent = {
      Records: [{
          body: JSON.stringify({
              eventName: 'verify-email',
              userEmail: 'test@example.com'
          })
      }]
    };

    const mockResponse = { MessageId: '12345' };
    // Mock successful SES response
    sesMock.on(VerifyEmailIdentityCommand).resolves(mockResponse);

    // Execute the handler
    const result = await usersSqsHandler(mockEvent);

    // Verify SES client was called with correct parameters
    const sesCalls = sesMock.calls();
    expect(sesCalls).toHaveLength(1);
  });


  it('should return nothing case no eventName match', async () => {
    const mockEvent = {
      Records: [{
          body: JSON.stringify({
              eventName: 'invalid-event-name',
          })
      }]
    };

    // Execute the handler
    const result = await usersSqsHandler(mockEvent);
    expect(result).toBeUndefined();
    expect(result).toBe(undefined)

    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(getSecret).not.toHaveBeenCalled();
    expect(saveBatchItems).not.toHaveBeenCalled();
    expect(sesMock.calls()).toHaveLength(0);
    expect(ddbMock.calls()).toHaveLength(0);
  });
});