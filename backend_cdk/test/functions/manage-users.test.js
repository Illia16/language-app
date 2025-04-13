const { tempUsers } = require('../setup/mocks');
const { handler: manageUsersHandler } = require('../../lib/functions/manage-users');

const { createUser, createUserItem } = require('../util');

describe('manage-users lambda', () => {
  describe('when no users to delete', () => {
    it('should do nothing', async () => {
      const results = await manageUsersHandler();
      expect(results).toEqual({ deletedUsers: [], deletedItems: 0 });
    });
  });

  describe('when users to delete exist', () => {
    it('should delete users and their items', async () => {
      const userToDelete = tempUsers.filter(usr => usr.userRole === 'delete')[0];

      // Create fake user and item (that will be deleted per this test)
      await createUser({
        dbUsers: process.env.DB_USERS,
        username: userToDelete.username,
        userId: userToDelete.userId,
        password: userToDelete.password,
        userRole: userToDelete.userRole,
        userEmail: userToDelete.userEmail,
        userTier: userToDelete.userTier,
      });

      await createUserItem({
        dbData: process.env.DB_DATA,
        user: userToDelete.username,
        itemID: userToDelete.userId,
      });

      const results = await manageUsersHandler();

      expect(results).toEqual({
        success: true,
        deletedUsers: [userToDelete.username],
        deletedItemsCount: 1,
        timestamp: expect.any(String)
      });
    });
  });
});