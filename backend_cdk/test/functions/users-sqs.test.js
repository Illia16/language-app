const { ddbMock, sesMock, clearMocks, setupTestEnv } = require('../setup/mocks');
const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { handler: usersSqsHandler } = require('../../lib/functions/users-sqs');
const { findUserByEmail, getSecret, saveBatchItems } = require('../../lib/functions/helpers');
const { isAiDataValid } = require('../../lib/functions/helpers/openai');

describe('Users SQS Handler', () => {
  beforeEach(() => {
    clearMocks();
    setupTestEnv();
  });


  describe('forgot-password flow', () => {
    it('should handle forgot password successfully', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'forgot-password',
            dbUsers: 'test-users-table',
            userEmail: 'test@example.com'
          })
        }]
      };

      getSecret.mockResolvedValue('test-secret-key');
      findUserByEmail.mockResolvedValue({
        user: 'test-user',
        role: 'regular',
        userId: 'test-user-id',
        userEmail: 'test@example.com',
        userMotherTongue: 'en'
      });
      sesMock.on(SendEmailCommand).resolves({});

      await usersSqsHandler(mockEvent);

      expect(getSecret).toHaveBeenCalledWith('test-project--ssm-auth--test');
      expect(findUserByEmail).toHaveBeenCalledWith('test-users-table', 'test@example.com');
      expect(sesMock.calls()).toHaveLength(1);
    });

    it('should handle user not found case', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'forgot-password',
            dbUsers: 'test-users-table',
            userEmail: 'test@example.com'
          })
        }]
      };

      getSecret.mockResolvedValue('test-secret-key');
      findUserByEmail.mockResolvedValue(undefined);

      await usersSqsHandler(mockEvent);

      expect(getSecret).toHaveBeenCalled();
      expect(findUserByEmail).toHaveBeenCalled();
      expect(sesMock.calls()).toHaveLength(0);
      expect(sesMock).not.toHaveReceivedCommandWith(SendEmailCommand);
    });
  });

  describe('delete-account flow', () => {
    it('should handle delete account request', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'delete-account',
            dbUsers: 'test-db',
            username: 'test-user',
            userId: 'test-user-id',
            toBeDeleted: 'delete'
          })
        }]
      };

      ddbMock.on(UpdateCommand).resolves({});

      await usersSqsHandler(mockEvent);

      expect(ddbMock.calls()).toHaveLength(1);
      expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'test-db',
        Key: {
          user: 'test-user',
          userId: 'test-user-id',
        },
      });
    });
  });

  describe('change-password flow', () => {
    it('should handle password change request', async () => {
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

      ddbMock.on(UpdateCommand).resolves({});

      await usersSqsHandler(mockEvent);

      expect(ddbMock.calls()).toHaveLength(1);
      expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'test-db',
        Key: {
          user: 'test-user',
          userId: 'test-user-id',
        },
      });
    });
  });

  describe('verify-email flow', () => {
    it('should handle email verification request', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'verify-email',
            userEmail: 'test@example.com'
          })
        }]
      };

      const mockResponse = { MessageId: '12345' };
      sesMock.on(VerifyEmailIdentityCommand).resolves(mockResponse);

      await usersSqsHandler(mockEvent);

      expect(sesMock.calls()).toHaveLength(1);
    });
  });

  describe('parse-ai-data flow', () => {
    it('should handle valid AI data successfully', async () => {
      const mockData = {
        eventName: 'parse-ai-data',
        data: {
          aiData: {
            items: [{
              item: 'test-item',
              itemCorrect: 'test-item-correct',
              itemTranscription: 'test-item-transcription',
              itemType: 'test-item-type',
              itemTypeCategory: 'test-item-type-category',
              incorrectItems: ['test-incorrect-item-1', 'test-incorrect-item-2', 'test-incorrect-item-3']
            }]
          },
          userData: {
            user: 'test-user',
            userMotherTongue: 'en',
            languageStudying: 'es',
            userTierPremium: true,
            numberOfItems: 1,
          }
        }
      };

      const mockEvent = {
        Records: [{
          body: JSON.stringify(mockData)
        }]
      };

      isAiDataValid.mockReturnValue({ isValid: true });
      saveBatchItems.mockResolvedValue({});

      await usersSqsHandler(mockEvent);

      expect(saveBatchItems).toHaveBeenCalledWith(
        mockData.data.aiData.items,
        mockData.data.userData.userTierPremium,
        mockData.data.userData.user,
        mockData.data.userData.userMotherTongue,
        mockData.data.userData.languageStudying
      );
    });

    it('should reject invalid AI data', async () => {
      const mockData = {
        eventName: 'parse-ai-data',
        data: {
          aiData: {
            items: [{
              item: 'test-item',
              itemCorrect: 'test-item-correct',
              itemTranscription: 'test-item-transcription',
              itemType: 'test-item-type',
              itemTypeCategory: 'test-item-type-category',
              incorrectItems: ['test-incorrect-item-1', 'test-incorrect-item-2', 'test-incorrect-item-3', 'make-object-structure-invalid']
            }]
          },
          userData: {
            user: 'test-user',
            userMotherTongue: 'en',
            languageStudying: 'es',
            userTierPremium: true,
            numberOfItems: 1,
          }
        }
      };

      const mockEvent = {
        Records: [{
          body: JSON.stringify(mockData)
        }]
      };

      isAiDataValid.mockReturnValue({ isValid: false });

      await expect(usersSqsHandler(mockEvent)).rejects.toThrow(
        'Failed to validate AI data. Please, redrive manually.'
      );
      expect(saveBatchItems).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return undefined for unknown event names', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'invalid-event-name',
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);

      expect(result).toBeUndefined();
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(getSecret).not.toHaveBeenCalled();
      expect(saveBatchItems).not.toHaveBeenCalled();
      expect(sesMock.calls()).toHaveLength(0);
      expect(ddbMock.calls()).toHaveLength(0);
    });
  });
});