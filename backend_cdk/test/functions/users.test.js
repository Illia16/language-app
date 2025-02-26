const { ddbMock, sesMock, sqsMock, clearMocks, setupTestEnv } = require('../setup/mocks');
const { UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SendEmailCommand, VerifyEmailIdentityCommand } = require("@aws-sdk/client-ses");
const { handler: usersSqsHandler } = require('../../lib/functions/users-sqs');
const { findUserByEmail, getSecret, saveBatchItems } = require('../../lib/functions/helpers');
const { isAiDataValid } = require('../../lib/functions/helpers/openai');
const { handler: usersHandler } = require('../../lib/functions/users');
const jwt = require('jsonwebtoken');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");


describe('users lambda', () => {
  beforeEach(() => {
    clearMocks();
    setupTestEnv();
    getSecret.mockResolvedValue('test-secret');
  });

  describe('/users/generate-invitation-code path', () => {
    const mockEvent = {
      path: '/users/generate-invitation-code',
      headers: {
        Authorization: 'Bearer valid-token'
      },
      body: null,
    };

    it('should successfully generate invitation code', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        user: 'testuser',
        role: 'admin'
      }));
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(ddbMock.calls()).toHaveLength(1);
    })

    it('user is not admin', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        user: 'testuser2',
        role: 'user'
      }));
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User testuser2 is not authorized to do this action.');
    })

    it('should return 401 when token is missing', async () => {
      delete mockEvent.headers.Authorization;
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
      expect(ddbMock.calls()).toHaveLength(0);
    })

    it('should return 401 when token is invalid', async () => {
      mockEvent.headers.Authorization = 'Bearer invalid-token';
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid signature');
      });
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
      expect(ddbMock.calls()).toHaveLength(0);
    })

    it('should return 500 when there is an server error (PutCommand failed)', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        user: 'testuser',
        role: 'admin'
      }));
      ddbMock.on(PutCommand).rejects(new Error('Internal server error'));
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe('500');
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Internal server error');
      expect(ddbMock.calls()).toHaveLength(1);
    })
  })

  describe('/users/delete-account path', () => {
    const mockEvent = {
      path: '/users/delete-account',
      headers: {
        Authorization: 'Bearer valid-token'
      },
      body: JSON.stringify({
        user: 'testuser',
        userId: 'test-user-id',
        toBeDeleted: true
      })
    };

    it('should successfully process delete account request', async () => {
      // Mock JWT verification
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        user: 'testuser'
      }));
      // jwt.verify.mockReturnValue({ userId: 'test-user-id', role: 'valid-role' });
      sqsMock.on(SendMessageCommand).resolves({});
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
      expect(sqsMock.calls()).toHaveLength(1);
    });

    it('should return 401 when token is missing', async () => {
      delete mockEvent.headers.Authorization;
      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
      expect(sqsMock.calls()).toHaveLength(0);
    });

    it('should return 401 when token is invalid', async () => {
      mockEvent.headers.Authorization = 'Bearer invalid-token';

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const response = await usersHandler(mockEvent);

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
        Authorization: 'Bearer valid-token'
      },
      body: JSON.stringify({
        password: 'newPassword123',
        userId: 'test-user-id'
      })
    };

    it('should successfully process password change request', async () => {
      // Mock JWT verification
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        user: 'testuser'
      }));

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
      // Mock JWT verification to throw error
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await usersHandler(mockEvent);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
      expect(sqsMock.calls()).toHaveLength(0);
    });
  });
});