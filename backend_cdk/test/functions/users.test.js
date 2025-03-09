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
  beforeAll(async () => {
    await setupTestEnv();
  });

  describe('/users/login path', () => {
    const usersEvent = {
      path: '/users/login',
      body: JSON.stringify({
        user: process.env.TEST_USER_PREMIUM,
        password: process.env.TEST_USER_PREMIUM_PASSWORD
      })
    }

    it('should successfully login', async () => {
      const response = await usersHandler(usersEvent);
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);

      const decoded = jwt.verify(body.data.token, process.env.SECRET_ID_VALUE)

      expect(decoded).toEqual({
        user: process.env.TEST_USER_PREMIUM,
        role: expect.any(String),
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
      const usersEventNoUser = {
        ...usersEvent,
        body: JSON.stringify({
          user: 'non-existing-user',
          password: 'non-existing-password'
        })
      }
      const response = await usersHandler(usersEventNoUser);

      expect(response.statusCode).toBe("500");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either user does not exist or wrong password.');
    })

    it('wrong password', async () => {
      const usersEventWrongPassword = {
        ...usersEvent,
        body: JSON.stringify({
          user: process.env.TEST_USER_PREMIUM,
          password: 'wrong-password'
        })
      };
      const response = await usersHandler(usersEventWrongPassword);

      expect(response.statusCode).toBe("500");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either user does not exist or wrong password.');
    })

    it('user is to be deleted', async () => {
      const usersEventDeleteUser = {
        ...usersEvent,
        body: JSON.stringify({
          user: process.env.TEST_USER_DELETE,
          password: process.env.TEST_USER_DELETE_PASSWORD
        })
      }

      const response = await usersHandler(usersEventDeleteUser);
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data.accountDeletionTime).toBeDefined();
      expect(body.data.accountDeletionTime).toBe(1000 * 60 * 60 * 24 * 30);
    })
  });


  describe('/users/generate-invitation-code path', () => {
    const mockEventGenerateInvitationCode = {
      path: '/users/generate-invitation-code',
      body: null,
    };

    it('should successfully generate invitation code', async () => {
      const mockEventSuccess = {
        ...mockEventGenerateInvitationCode,
        headers: {
          Authorization: `Bearer ${getToken(process.env.TEST_USER_PREMIUM, 'admin', process.env.SECRET_ID_VALUE)}`
        },
      }

      const response = await usersHandler(mockEventSuccess);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    })

    it('user is not admin', async () => {
      const mockEventNotAdmin = {
        ...mockEventGenerateInvitationCode,
        headers: {
          Authorization: `Bearer ${getToken(process.env.TEST_USER, 'user', process.env.SECRET_ID_VALUE)}`
        }
      };

      const response = await usersHandler(mockEventNotAdmin);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe(`User ${process.env.TEST_USER} is not authorized to do this action.`);
    })

    it('should return 401 when token is missing', async () => {
      const eventWithoutToken = {
        ...mockEventGenerateInvitationCode,
        headers: {}
      }
      const response = await usersHandler(eventWithoutToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
    })

    it('should return 401 when token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEventGenerateInvitationCode,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }
      const response = await usersHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
    })

    it('should return 500 when there is a server error (PutCommand failed)', async () => {
      const originalDbUsers = process.env.DB_USERS;

      try {
        process.env.DB_USERS = 'invalid-table-name';

        const mockEvent = {
          ...mockEventGenerateInvitationCode,
          headers: {
            Authorization: `Bearer ${getToken(process.env.TEST_USER_PREMIUM, 'admin', process.env.SECRET_ID_VALUE)}`
          },
        };

        const response = await usersHandler(mockEvent);

        expect(response.statusCode).toBe("500");
        const body = JSON.parse(response.body);
        expect(body.message).toBe('Requested resource not found');
      } finally {
        process.env.DB_USERS = originalDbUsers;
      }
    });
  });

  describe('/users/register path', () => {
    it('should successfully register user', async () => {
      const mockEvent = {
        path: '/users/register',
        body: JSON.stringify({
          user: 'testuser',
          password: 'testpassword',
          userEmail: 'test@illusha.net',
          invitationCode: process.env.INVITATION_CODE,
          userMotherTongue: 'en',
        })
      }

      getIncorrectItems.mockResolvedValue(['should successfully register user - incorrect1', 'should successfully register user - incorrect2', 'should successfully register user - incorrect3']);

      const response = await usersHandler(mockEvent);

      // Verify response
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    })

    it('should return 500 if username is already taken', async () => {
      const mockEventUsernameTaken = {
        path: '/users/register',
        body: JSON.stringify({
          user: process.env.TEST_USER_PREMIUM,
          password: process.env.TEST_USER_PREMIUM_PASSWORD,
          userEmail: process.env.TEST_USER_PREMIUM_EMAIL,
          invitationCode: process.env.INVITATION_CODE,
          userMotherTongue: 'en'
        })
      }
      const response = await usersHandler(mockEventUsernameTaken);

      expect(response.statusCode).toBe('500');
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either username already taken or inivation code is wrong.');
    })

    it('should return 500 if invitation code is wrong', async () => {
      const mockEventInvitationCodeWrong = {
        path: '/users/register',
        body: JSON.stringify({
          user: 'testuser',
          password: 'testpassword',
          userEmail: 'test@illusha.net',
          invitationCode: 'wrong-invitation-code',
          userMotherTongue: 'en'
        })
      }

      const response = await usersHandler(mockEventInvitationCodeWrong);

      expect(response.statusCode).toBe('500');
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either username already taken or inivation code is wrong.');
    })
  })

  describe('/users/delete-account path', () => {
    const mockEventDeleteAccount = {
      path: '/users/delete-account',
      body: JSON.stringify({
        user: process.env.TEST_USER,
        userId: process.env.TEST_USER_ID,
        toBeDeleted: true
      })
    };

    it('should successfully process delete account request', async () => {
      const eventDeleteAccount = {
        ...mockEventDeleteAccount,
        headers: {
          Authorization: `Bearer ${getToken(process.env.TEST_USER, 'user', process.env.SECRET_ID_VALUE)}`
        },
      }
      const response = await usersHandler(eventDeleteAccount);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
    });

    it('should return 401 when token is missing', async () => {
      const eventWithoutToken = {
        ...mockEventDeleteAccount,
        headers: {}
      }
      const response = await usersHandler(eventWithoutToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
    });

    it('should return 401 when token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEventDeleteAccount,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }
      const response = await usersHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
    })
  });


  describe('/users/forgot-password path', () => {
    const mockEventForgotPW = {
      path: '/users/forgot-password',
      body: JSON.stringify({
        userEmail: process.env.TEST_USER_PREMIUM_EMAIL,
      })
    };

    it('should successfully process forgot password request', async () => {
      const response = await usersHandler(mockEventForgotPW);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
    });
  });

  describe('/users/change-password path', () => {
    const mockEventChangePW = {
      path: '/users/change-password',
      body: JSON.stringify({
        password: process.env.TEST_USER_PREMIUM_PASSWORD, // use existing password as a "new" pw
        userId: process.env.TEST_USER_PREMIUM_ID,
      })
    };

    it('should successfully process password change request', async () => {
      const eventChangePW = {
        ...mockEventChangePW,
        headers: {
          Authorization: `Bearer ${getToken(process.env.TEST_USER_PREMIUM, 'admin', process.env.SECRET_ID_VALUE)}`
        }
      }

      const response = await usersHandler(eventChangePW);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('processed');
    });

    it('should return 401 when token is missing', async () => {
      const eventWithoutToken = {
        ...mockEventChangePW,
        headers: {}
      };

      const response = await usersHandler(eventWithoutToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is missing.');
    });

    it('should return 401 when token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEventChangePW,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }

      const response = await usersHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Token is invalid.');
    });
  });
});