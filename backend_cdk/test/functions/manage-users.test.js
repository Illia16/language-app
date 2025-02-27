const { ddbMock, setupTestEnv, clearMocks } = require('../setup/mocks');
const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { handler: manageUsersHandler } = require('../../lib/functions/manage-users');
const { findAll, findAllByPrimaryKey } = require('../../lib/functions/helpers');

describe('manage-users lambda', () => {
  beforeEach(() => {
    clearMocks();
    setupTestEnv();
  });

  describe('when no users to delete', () => {
    it('should do nothing', async () => {
      findAll.mockResolvedValue([
        { user: 'user1', userId: '1', role: 'admin' },
        { user: 'user2', userId: '2', role: 'user' }
      ]);

      const results = await manageUsersHandler();

      expect(ddbMock.calls()).toHaveLength(0);
      expect(findAllByPrimaryKey).not.toHaveBeenCalled();
      expect(results).toBeUndefined();
    });
  });

  describe('when users to delete exist', () => {
    it('should delete users and their items', async () => {
      const usersToDelete = [
        { user: 'user3', userId: '3', role: 'delete' },
        { user: 'user4', userId: '4', role: 'delete' },
      ];

      findAll.mockResolvedValue([
        { user: 'user1', userId: '1', role: 'premium' },
        { user: 'user2', userId: '2', role: 'active' },
        ...usersToDelete
      ]);

      findAllByPrimaryKey.mockImplementation((table, user) => {
        return Promise.resolve([
          { user, itemID: 'item1' },
          { user, itemID: 'item2' }
        ]);
      });

      ddbMock.on(DeleteCommand).resolves({});

      await manageUsersHandler();

      // Verify correct number of deletions (2 users * (1 user deletion + 2 items) = 6 calls)
      expect(ddbMock.calls()).toHaveLength(6);

      // Verify user deletions
      usersToDelete.forEach(user => {
        expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
          TableName: 'test-users-table',
          Key: { user: user.user, userId: user.userId }
        });
      });

      // Verify item deletions
      usersToDelete.forEach(user => {
        ['item1', 'item2'].forEach(itemID => {
          expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
            TableName: 'test-data-table',
            Key: { user: user.user, itemID }
          });
        });
      });
    });
  });

  describe('error handling', () => {
    it('should propagate database errors', async () => {
      findAll.mockRejectedValue(new Error('Database error'));
      await expect(manageUsersHandler()).rejects.toThrow('Database error');
    });
  });
});