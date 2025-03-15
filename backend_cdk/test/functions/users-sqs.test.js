const { ddbMock, sesMock, clearMocks, setupTestEnv, cleanupTestEnv, fakeAiItems } = require('../setup/mocks');
const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { handler: usersSqsHandler } = require('../../lib/functions/users-sqs');
const { findUserByEmail, getSecret, saveBatchItems } = require('../../lib/functions/helpers');
const { isAiDataValid } = require('../../lib/functions/helpers/openai');
const { hashPassword } = require('../../lib/functions/helpers/auth');
describe('users-sqs lambda', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await cleanupTestEnv();
  });


  describe('forgot-password flow', () => {
    it('should handle forgot password successfully', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'forgot-password',
            dbUsers: process.env.DB_USERS,
            userEmail: process.env.TEST_EMAIL
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);
      expect(result).toBeDefined();
      expect(result.MessageId).toEqual(expect.any(String));
      expect(result.$metadata.httpStatusCode).toBe(200);
    });

    it('should handle user not found case', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'forgot-password',
            dbUsers: process.env.DB_USERS,
            userEmail: 'user-not-found@example.com'
          })
        }]
      };
      const result = await usersSqsHandler(mockEvent);
      expect(result).toBeDefined();
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe('User not found');
    });
  });

  describe('delete-account flow', () => {
    it('should handle delete account request', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'delete-account',
            dbUsers: process.env.DB_USERS,
            username: process.env.TEST_USER,
            userId: process.env.TEST_USER_ID,
            toBeDeleted: 'delete'
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);
      const body = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('User deleted');
      expect(body.data.$metadata.httpStatusCode).toBe(200);
      expect(body.data.Attributes.user).toBe(process.env.TEST_USER);
    });
  });

  describe('change-password flow', () => {
    it('should handle password change request', async () => {
      const hashedPassword = await hashPassword(process.env.TEST_USER_PASSWORD)

      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'change-password',
            dbUsers: process.env.DB_USERS,
            user: process.env.TEST_USER,
            userId: process.env.TEST_USER_ID,
            password: hashedPassword
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);
      const body = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Password changed');
      expect(body.data.$metadata.httpStatusCode).toBe(200);
      expect(body.data.Attributes.user).toBe(process.env.TEST_USER);
    });
  });

  describe('verify-email flow', () => {
    it('should handle email verification request', async () => {
      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'verify-email',
            userEmail: process.env.TEST_EMAIL
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);
      const body = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Email verification sent');
      expect(body.data.$metadata.httpStatusCode).toBe(200);
    });
  });

  describe('parse-ai-data flow', () => {
    it('should handle valid AI data successfully', async () => {
      const mockData = {
        eventName: 'parse-ai-data',
        data: {
          aiData: {
            items: fakeAiItems
          },
          userData: {
            user: process.env.TEST_USER_PREMIUM,
            userMotherTongue: 'ru',
            languageStudying: 'zh',
            userTierPremium: true,
            numberOfItems: 3,
          }
        }
      };

      const mockEvent = {
        Records: [{
          body: JSON.stringify(mockData)
        }]
      };
      const result = await usersSqsHandler(mockEvent);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe('Items saved to DB');
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
              incorrectItems: ['test-incorrect-item-1', 'test-incorrect-item-2', 'test-incorrect-item-3', 'make-object-structure-invalid'],
              someOtherKey: 'some-other-key',
            }]
          },
          userData: {
            user: process.env.TEST_USER_PREMIUM,
            userMotherTongue: 'ru',
            languageStudying: 'zh',
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

      const result = await usersSqsHandler(mockEvent);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe('Failed to validate AI data. Please, redrive manually.');
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
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe('Unknown event name');
    });
  });
});