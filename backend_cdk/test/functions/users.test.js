const { ddbMock, sesMock, sqsMock, clearMocks, setupTestEnv } = require('../setup/mocks');
const { UpdateCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { handler: usersSqsHandler } = require('../../lib/functions/users-sqs');
const { s3UploadFile, findUser, findUserByEmail, getSecret, saveBatchItems, getEventBridgeRuleInfo, getRateExpressionNextRun } = require('../../lib/functions/helpers');
const { isAiDataValid, getAudio, getIncorrectItems } = require('../../lib/functions/helpers/openai');
const { hashPassword, checkPassword } = require('../../lib/functions/helpers/auth');
const { handler: usersHandler } = require('../../lib/functions/users');
const jwt = require('jsonwebtoken');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { DescribeRuleCommand } = require('@aws-sdk/client-eventbridge');
const { getToken } = require('../util');


describe('users lambda', () => {
  beforeEach(() => {
    clearMocks();
    setupTestEnv();
    getSecret.mockResolvedValue('test-secret');
  });


  describe('/users/login path', () => {
    const mockEvent = {
      path: '/users/login',
      body: JSON.stringify({
        user: 'testuser',
        password: 'testpassword'
      })
    }

    it('should successfully login', async () => {
      const res = [{
        user: 'testuser',
        userId: 'test-user-id',
        userMotherTongue: 'en',
        password: await hashPassword('testpassword'),
        role: 'admin'
      }]
      findUser.mockResolvedValue(res);
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      const decoded = jwt.verify(body.data.token, 'test-secret')
      expect(decoded).toEqual({
        user: 'testuser',
        role: 'admin',
        iat: expect.any(Number),
        exp: expect.any(Number)
      });

      expect(body.data.token).toBeDefined();
      expect(body.data.user).toBeDefined();
      expect(body.data.userId).toBeDefined();
      expect(body.data.userMotherTongue).toBeDefined();
      expect(body.data.role).toBeDefined();
    })

    it('no user found', async () => {
      findUser.mockResolvedValue([]);
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("500");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either user does not exist or wrong password.');
    })

    it('wrong password', async () => {
      findUser.mockResolvedValue([{
        user: 'testuser',
        userId: 'test-user-id',
        userMotherTongue: 'en',
        password: await hashPassword('wrongpassword'),
        role: 'admin'
      }]);
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("500");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either user does not exist or wrong password.');
    })

    it('user is to be deleted', async () => {
      findUser.mockResolvedValue([{
        user: 'testuser',
        userId: 'test-user-id',
        userMotherTongue: 'en',
        password: await hashPassword('testpassword'),
        role: 'delete'
      }]);

      getEventBridgeRuleInfo.mockResolvedValue({
        ScheduleExpression: 'rate(30 days)'
      });
      getRateExpressionNextRun.mockReturnValue(1000 * 60 * 60 * 24 * 30);
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data.accountDeletionTime).toBeDefined();
      expect(body.data.accountDeletionTime).toBe(1000 * 60 * 60 * 24 * 30);
    })
  })

  describe('/users/generate-invitation-code path', () => {
    const mockEvent = {
      path: '/users/generate-invitation-code',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: null,
    };

    it('should successfully generate invitation code', async () => {
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(ddbMock.calls()).toHaveLength(1);
    })

    it('user is not admin', async () => {
      const mockEventNotAdmin = {
        ...mockEvent,
        headers: {
          Authorization: `Bearer ${getToken('user')}`
        }
      };

      const response = await usersHandler(mockEventNotAdmin);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User testuser is not authorized to do this action.');
    })

    it('should return 401 when token is missing', async () => {
      const eventWithoutToken = {
        ...mockEvent,
        headers: {}
      }
      const response = await usersHandler(eventWithoutToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
      expect(ddbMock.calls()).toHaveLength(0);
    })

    it('should return 401 when token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEvent,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }
      const response = await usersHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
      expect(ddbMock.calls()).toHaveLength(0);
    })

    it('should return 500 when there is an server error (PutCommand failed)', async () => {
      ddbMock.on(PutCommand).rejects(new Error('Internal server error'));
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe('500');
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Internal server error');
      expect(ddbMock.calls()).toHaveLength(1);
    })
  })

  describe('/users/register path', () => {
    const mockEvent = {
      path: '/users/register',
      body: JSON.stringify({
        user: 'testuser',
        password: 'testpassword',
        userEmail: 'test@example.com',
        invitationCode: 'test-invitation-code',
        userMotherTongue: 'en'
      })
    }

    it('should successfully register user', async () => {
      findUser
        .mockResolvedValueOnce([]) // First call: check username/email availability
        .mockResolvedValueOnce([{ user: 'valid-code' }]); // Second call: check invitation code

      getAudio.mockResolvedValue('audio_data');
      s3UploadFile.mockResolvedValue();
      getIncorrectItems.mockResolvedValue(['incorrect1', 'incorrect2', 'incorrect3']);

      ddbMock.on(PutCommand).resolves({ Attributes: { user: 'testuser' } });
      sqsMock.on(SendMessageCommand).resolves({});

      const response = await usersHandler(mockEvent);

      // Verify response
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: { user: 'testuser' }
      });
      expect(ddbMock.calls()).toHaveLength(3); // 1 for delete code, 1 for create user, 1 for put welcome item
      expect(sqsMock.calls()).toHaveLength(1);
      expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
        QueueUrl: 'test_sqs_url',
        MessageBody: JSON.stringify({ eventName: 'verify-email', userEmail: 'test@example.com' }),
      });
    })

    it('should return 500 if username is already taken', async () => {
      findUser.mockResolvedValueOnce([{ user: 'testuser' }]);
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe('500');
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either username already taken or inivation code is wrong.');
      expect(ddbMock.calls()).toHaveLength(0);
      expect(sqsMock.calls()).toHaveLength(0);
    })

    it('should return 500 if invitation code is wrong', async () => {
      findUser
        .mockResolvedValueOnce([]) // username is available
        .mockResolvedValueOnce([]); // invitation code is wrong
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe('500');
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either username already taken or inivation code is wrong.');
      expect(ddbMock.calls()).toHaveLength(0);
      expect(sqsMock.calls()).toHaveLength(0);
    })
  })

  describe('/users/delete-account path', () => {
    const mockEvent = {
      path: '/users/delete-account',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        user: 'testuser',
        userId: 'test-user-id',
        toBeDeleted: true
      })
    };

    it('should successfully process delete account request', async () => {
      sqsMock.on(SendMessageCommand).resolves({});
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
      expect(sqsMock.calls()).toHaveLength(1);
    });

    it('should return 401 when token is missing', async () => {
      const eventWithoutToken = {
        ...mockEvent,
        headers: {}
      }
      const response = await usersHandler(eventWithoutToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
      expect(sqsMock.calls()).toHaveLength(0);
    });

    it('should return 401 when token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEvent,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }
      const response = await usersHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
      expect(sqsMock.calls()).toHaveLength(0);
    })
  });


  describe('/users/forgot-password path', () => {
    const mockEvent = {
      path: '/users/forgot-password',
      body: JSON.stringify({
        userEmail: 'test@example.com'
      })
    };

    it('should successfully process forgot password request', async () => {
      sqsMock.on(SendMessageCommand).resolves({});
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
      expect(sqsMock.calls()).toHaveLength(1);
    });

  });

  describe('/users/change-password path', () => {
    const mockEvent = {
      path: '/users/change-password',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        password: 'newPassword123',
        userId: 'test-user-id'
      })
    };

    it('should successfully process password change request', async () => {
      sqsMock.on(SendMessageCommand).resolves({});
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
      expect(sqsMock.calls()).toHaveLength(1);
    });

    it('should return 401 when token is missing', async () => {
      const eventWithoutToken = {
        ...mockEvent,
        headers: {}
      };

      const response = await usersHandler(eventWithoutToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
      expect(sqsMock.calls()).toHaveLength(0);
    });

    it('should return 401 when token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEvent,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }

      const response = await usersHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
      expect(sqsMock.calls()).toHaveLength(0);
    });
  });
});