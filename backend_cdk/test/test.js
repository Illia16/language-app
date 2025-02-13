const { mockClient } = require('aws-sdk-client-mock');
require("aws-sdk-client-mock-jest");
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { handler } = require('../lib/functions/manage-users');
const { findAll, findAllByPrimaryKey } = require('../lib/functions/helpers');

// Mock the DynamoDB Document Client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Mock the helper functions
jest.mock('../lib/functions/helpers', () => ({
  findAll: jest.fn(),
  findAllByPrimaryKey: jest.fn()
}));

describe('manage-users lambda', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    ddbMock.reset();
    jest.clearAllMocks();

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
    const results = await handler();

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
    await handler();

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
    await expect(handler()).rejects.toThrow('Database error');
  });
});