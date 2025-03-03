const { ddbMock, sesMock, sqsMock, clearMocks, setupTestEnv } = require('../setup/mocks');
const { UpdateCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { handler: usersSqsHandler } = require('../../lib/functions/users-sqs');
const { s3UploadFile, findUser, findUserByEmail, getSecret, saveBatchItems, getEventBridgeRuleInfo, getRateExpressionNextRun } = require('../../lib/functions/helpers');
const { isAiDataValid, getAudio, getIncorrectItems, getAIDataBasedOnUserInput } = require('../../lib/functions/helpers/openai');
const { hashPassword, checkPassword } = require('../../lib/functions/helpers/auth');
const { handler: dataAiHandler } = require('../../lib/functions/data-ai-generated');
const jwt = require('jsonwebtoken');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { DescribeRuleCommand } = require('@aws-sdk/client-eventbridge');
const { getToken } = require('../util');

describe('dataAi lambda', () => {
  beforeEach(() => {
    clearMocks();
    setupTestEnv();
    getSecret.mockResolvedValue('test-secret');
  });

  describe('data-ai-generated', () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: null,
      headers: {
        authorization: null,
      }
    }

    const validPayload = {
      prompt: 'valid length that precedes 100 characters',
      userMotherTongue: 'ru',
      languageStudying: 'en',
      numberOfItems: 20,
    }

    const validAiDataRes = [{
      item: 'test-item',
      itemCorrect: 'test-item-correct',
      itemTranscription: 'test-item-transcription',
      itemType: 'test-item-type',
      itemTypeCategory: 'test-item-type-category',
      incorrectItems: ['test-incorrect-item-1', 'test-incorrect-item-2', 'test-incorrect-item-3']
    }];

    it('fail: 401 - No token provided', async () => {
      const response = await dataAiHandler(mockEvent);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("No token provided.");
    });

    it('fail: 401 - Invalid token', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer invalid-token`
        }
      }
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toContain("Failed to validate token");
    });

    it('fail: 410 - User account is to be deleted', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        }
      }

      findUser.mockResolvedValue([{ role: 'delete' }]);
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("410");
      expect(JSON.parse(response.body).message).toBe("User account is to be deleted.");
    });

    it('fail: 401 - Payload is invalid', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          prompt: null,
          userMotherTongue: null,
          languageStudying: null,
          numberOfItems: null,
        })
      }

      findUser.mockResolvedValue([{ role: 'user' }]);
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("Payload is invalid.");
    });

    it('fail: 401 - Payload is invalid - too many items', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          prompt: 'length that exceeds 100 characters length that exceeds 100 characters length that exceeds 100 characters',
          userMotherTongue: null,
          languageStudying: null,
          numberOfItems: 21,
        })
      }

      findUser.mockResolvedValue([{ role: 'user' }]);
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("Payload is invalid.");
    });

    it('fail: 401 - User is not premium', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(validPayload)
      }

      findUser.mockResolvedValue([{ role: 'user', userTier: 'regular' }]);
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("User is not premium.");
    });

    it('fail: 401 - Failed to get AI data (getAIDataBasedOnUserInput failed)', async () => {
      const mockEventFailToGetAiData = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(validPayload)
      }

      findUser.mockResolvedValue([{ role: 'user', userTier: 'premium' }]);
      getAIDataBasedOnUserInput.mockRejectedValue(new Error('Failed to get AI data'));
      const response = await dataAiHandler(mockEventFailToGetAiData);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toContain("Failed to get AI data.");
    });

    it('success: 200 - AI data is valid and processed', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(validPayload)
      }

      findUser.mockResolvedValue([{ role: 'user', userTier: 'premium' }]);
      getAIDataBasedOnUserInput.mockResolvedValue(validAiDataRes);
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });

    it('fail: 500 - Failed to post AI data (saveBatchItems failed)', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(validPayload)
      }

      findUser.mockResolvedValue([{ role: 'user', userTier: 'premium' }]);
      getAIDataBasedOnUserInput.mockResolvedValue(validAiDataRes);
      saveBatchItems.mockRejectedValue(new Error('Failed to get AI data'));
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("500");
      expect(JSON.parse(response.body).message).toContain("Failed to post AI data.");
      expect(ddbMock.calls().length).toBe(0);
    });

    it('success: 200 - all successful', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(validPayload)
      }

      findUser.mockResolvedValue([{ role: 'user', userTier: 'premium' }]);
      getAIDataBasedOnUserInput.mockResolvedValue(validAiDataRes);
      saveBatchItems.mockResolvedValue('Dynamodb success msg...');
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });
  });
});