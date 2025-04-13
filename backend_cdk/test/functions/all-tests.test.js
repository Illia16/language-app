const { tempUsers, setupTestEnv, cleanupTestEnv, fakeAiItems } = require('../setup/mocks');

const { getIncorrectItems, getAIDataBasedOnUserInput } = require('../../lib/functions/helpers/openai');
const { hashPassword } = require('../../lib/functions/helpers/auth');

const { handler: manageUsersHandler } = require('../../lib/functions/manage-users');
const { handler: secretRotationHandler } = require('../../lib/functions/secret-rotation');
const { handler: usersHandler } = require('../../lib/functions/users');
const { handler: dataAiHandler } = require('../../lib/functions/data-ai-generated');
const { handler: dataHandler } = require('../../lib/functions/data');
const { handler: usersSqsHandler } = require('../../lib/functions/users-sqs');
const { createUser, createUserItem, createSecret, deleteSecret, getSecret, getToken } = require('../util');
const { user_a, user_b, user_c, user_d, user_e } = require('../fixtures/users').users;
const { user_delete } = require('../fixtures/users').temp_users;

const jwt = require('jsonwebtoken');

const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

describe('all tests', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await cleanupTestEnv();
  });

  // 1) Manage users tests
  // describe('when no users to delete', () => {
  //   it('should do nothing', async () => {
  //     const results = await manageUsersHandler();
  //     expect(results).toEqual({ deletedUsers: [], deletedItems: 0 });
  //   });
  // });

  describe('when users to delete exist', () => {
    it('should delete users and their items', async () => {
      const userToDelete = tempUsers.filter(usr => usr.userRole === 'delete')[0];
      const results = await manageUsersHandler();

      expect(results).toEqual({
        success: true,
        deletedUsers: expect.arrayContaining([userToDelete.username]),
        deletedItemsCount: expect.any(Number),
        timestamp: expect.any(String)
      });
    });
  });

  // 2) Secret rotation tests
  describe('secret-rotation lambda', () => {
    it('should update SSM parameter with new random value', async () => {
      const originalSecret = process.env.SECRET_ID;
      process.env.SECRET_ID = 'test-temp-secret';

      await createSecret(process.env.SECRET_ID);
      const res = await getSecret(process.env.SECRET_ID);
      const generatedSecret = res.Parameters[0].Value;
      await secretRotationHandler();

      const resUpdated = await getSecret(process.env.SECRET_ID);

      expect(resUpdated.Parameters[0].Value).not.toEqual(generatedSecret);

      await deleteSecret(process.env.SECRET_ID);
      process.env.SECRET_ID = originalSecret;
    });
  });


  // 3) Users tests
  describe('/users/login path', () => {
    const usersEvent = {
      path: '/users/login',
      body: JSON.stringify({
        user: user_a.username,
        password: user_a.password
      })
    }

    it('should successfully login', async () => {
      const response = await usersHandler(usersEvent);
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);

      const decoded = jwt.verify(body.data.token, process.env.SECRET_ID_VALUE)

      expect(decoded).toEqual({
        user: user_a.username,
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
          user: user_a.username,
          password: 'wrong-password'
        })
      };
      const response = await usersHandler(usersEventWrongPassword);

      expect(response.statusCode).toBe("500");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Either user does not exist or wrong password.');
    })

    it('user is to be deleted', async () => {
      // Create fake user and item (that will be deleted per this test)
      await createUser({
        dbUsers: process.env.DB_USERS,
        username: user_delete.username,
        userId: user_delete.userId,
        password: user_delete.password,
        userRole: user_delete.role,
        userEmail: user_delete.email,
        userTier: user_delete.tier,
      });

      const usersEventDeleteUser = {
        ...usersEvent,
        body: JSON.stringify({
          user: user_delete.username,
          password: user_delete.password
        })
      }

      const response = await usersHandler(usersEventDeleteUser);
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      const accountDeletionTimeInDays = Math.floor(body.data.accountDeletionTime / (1000 * 60 * 60 * 24));
      expect(body.success).toBe(true);
      expect(body.data.accountDeletionTime).toBeDefined();
      expect(accountDeletionTimeInDays).toBeGreaterThanOrEqual(0);
      expect(accountDeletionTimeInDays).toBeLessThanOrEqual(31);
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
          Authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
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
          Authorization: `Bearer ${getToken(user_b.username, user_b.role, process.env.SECRET_ID_VALUE)}`
        }
      };

      const response = await usersHandler(mockEventNotAdmin);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe(`User ${user_b.username} is not authorized to do this action.`);
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
            Authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
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
          user: 'user_register_from_integration_test',
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
          user: user_a.username,
          password: user_a.password,
          userEmail: user_a.email,
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
          user: 'user_register_from_integration_test',
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
        user: user_b.username,
        userId: user_b.userId,
        toBeDeleted: true
      })
    };

    it('should successfully process delete account request', async () => {
      const eventDeleteAccount = {
        ...mockEventDeleteAccount,
        body: JSON.stringify({
          user: user_e.username,
          userId: user_e.userId,
          toBeDeleted: true
        }),
        headers: {
          Authorization: `Bearer ${getToken(user_e.username, user_e.role, process.env.SECRET_ID_VALUE)}`
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
        userEmail: user_a.email,
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
        password: user_a.password, // use existing password as a "new" pw
        userId: user_a.userId,
      })
    };

    it('should successfully process password change request', async () => {
      const eventChangePW = {
        ...mockEventChangePW,
        headers: {
          Authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
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


  // 4) Data AI generated tests
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

    const validAiDataRes = {
      items: [{
        item: 'test-item',
        itemCorrect: 'test-item-correct',
        itemTranscription: 'test-item-transcription',
        itemType: 'test-item-type',
        itemTypeCategory: 'test-item-type-category',
        incorrectItems: ['test-incorrect-item-1', 'test-incorrect-item-2', 'test-incorrect-item-3']
      }]
    };

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
          authorization: `Bearer ${getToken(user_delete.username, user_delete.role, process.env.SECRET_ID_VALUE)}`
        }
      }

      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("410");
      expect(JSON.parse(response.body).message).toBe("User account is to be deleted.");
    });

    it('fail: 401 - Payload is invalid', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken(user_b.username, user_b.role, process.env.SECRET_ID_VALUE)}`
        },
        body: JSON.stringify({
          prompt: null,
          userMotherTongue: null,
          languageStudying: null,
          numberOfItems: null,
        })
      }

      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("Payload is invalid.");
    });

    it('fail: 401 - Payload is invalid - too many items', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken(user_b.username, user_b.role, process.env.SECRET_ID_VALUE)}`
        },
        body: JSON.stringify({
          prompt: 'length that exceeds 100 characters length that exceeds 100 characters length that exceeds 100 characters',
          userMotherTongue: null,
          languageStudying: null,
          numberOfItems: 21,
        })
      }

      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("Payload is invalid.");
    });

    it('fail: 401 - User is not premium', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken(user_b.username, user_b.role, process.env.SECRET_ID_VALUE)}`
        },
        body: JSON.stringify(validPayload)
      }

      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toBe("User is not premium.");
    });

    it('fail: 401 - Failed to get AI data (getAIDataBasedOnUserInput failed)', async () => {
      const mockEventFailToGetAiData = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
        },
        body: JSON.stringify(validPayload)
      }

      getAIDataBasedOnUserInput.mockRejectedValue(new Error('Failed to get AI data'));
      const response = await dataAiHandler(mockEventFailToGetAiData);
      expect(response.statusCode).toBe("401");
      expect(JSON.parse(response.body).message).toContain("Failed to get AI data.");
    });

    it('success: 200 - AI data is valid and processed', async () => {
      const mockEventWithToken = {
        ...mockEvent,
        headers: {
          authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
        },
        body: JSON.stringify(validPayload)
      }

      getAIDataBasedOnUserInput.mockResolvedValue(validAiDataRes);
      const response = await dataAiHandler(mockEventWithToken);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });
  });


  // 5) Data tests
  describe('data: GET', () => {
    const mockEventData = {
      httpMethod: 'GET',
      body: null,
      headers: {}
    }

    it('fail: 401 - No token provided', async () => {
      const response = await dataHandler(mockEventData);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('No token provided.');
    })

    it('fail: 401 - Token is invalid', async () => {
      const eventWithInvalidToken = {
        ...mockEventData,
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      }
      const response = await dataHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("401");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid token.');
    })

    it('fail: 410 - User account is to be deleted (hence no further access)', async () => {
      const eventWithInvalidToken = {
        ...mockEventData,
        headers: {
          Authorization: `Bearer ${getToken(user_delete.username, user_delete.role, process.env.SECRET_ID_VALUE)}`
        },
      }
      const response = await dataHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe("410");
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User account is to be deleted.');
    })

    it('success: 200 - GET', async () => {
      const eventWithInvalidToken = {
        ...mockEventData,
        headers: {
          Authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
        },
      }

      const response = await dataHandler(eventWithInvalidToken);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      const expectedFields = [
        'languageStudying',
        'filePath',
        'user',
        'incorrectItems',
        'itemID',
        'item',
        'itemTranscription',
        'level',
        'itemTypeCategory',
        'itemType',
        'itemCorrect',
        'userMotherTongue',
        'fileUrl'
      ];

      expectedFields.forEach(field => {
        expect(body.data[0][field]).toBeDefined();
      });
    })
  });

  describe('data: DELETE', () => {
    it('success: 200 - DELETE', async () => {
      const eventDelete = {
        httpMethod: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken(user_a.username, user_a.role, process.env.SECRET_ID_VALUE)}`
        },
        body: JSON.stringify({
          itemID: user_a.userId // USER ID is used as itemID
        })
      }

      const response = await dataHandler(eventDelete);
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Data deleted successfully');
    })
  })

  describe('data: PUT, POST', () => {
    const mockEventDataBase = {
      headers: {},
      isBase64Encoded: true,
      body: null
    }

    const mockEventDataPut = {
      ...mockEventDataBase,
      httpMethod: 'PUT'
    }

    const mockEventDataPost = {
      ...mockEventDataBase,
      httpMethod: 'POST'
    }

    const createFormDataEvent = (formData, user, role, method = 'PUT') => {
      const formDataBuffer = formData.getBuffer();
      const base64EncodedBody = formDataBuffer.toString('base64');
      const boundary = formData.getBoundary();

      return {
        ...(method === 'PUT' ? mockEventDataPut : mockEventDataPost),
        headers: {
          Authorization: `Bearer ${getToken(user, role, process.env.SECRET_ID_VALUE)}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: base64EncodedBody,
      }
    }

    it('success: 200 - PUT', async () => {
      const formData = new FormData();
      formData.append('user', user_b.username);
      formData.append('itemID', user_b.userId);
      formData.append('item', 'test put item 1');
      formData.append('itemCorrect', 'test put item correct 1');
      formData.append('itemType', 'test put item type 1');
      formData.append('itemTypeCategory', 'test put item type category 1');
      formData.append('userMotherTongue', 'ru');
      formData.append('languageStudying', 'en');
      formData.append('level', '1');
      formData.append('itemTranscription', 'test put item transcription 1');

      const audioFilePath = path.resolve(__dirname, '../fixtures/test-item-put.m4a');
      const audioFile = fs.readFileSync(audioFilePath);
      formData.append('file', audioFile, {
        filename: 'test-item-put.m4a',
        contentType: 'audio/mp4',
      });

      const response = await dataHandler(createFormDataEvent(formData, user_b.username, user_b.role));
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.languageStudying).toBe('en');
      expect(body.data.filePath).toBe('audio/test_put_item_1/test_put_item_1.m4a');
      expect(body.data.user).toBe(user_b.username);
      expect(body.data.itemID).toBe(user_b.userId);
    })

    it('success: 200 - PUT - update min', async () => {
      const formData = new FormData();
      formData.append('user', user_b.username);
      formData.append('itemID', user_b.userId);
      formData.append('level', '2');

      const response = await dataHandler(createFormDataEvent(formData, user_b.username, user_b.role));
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.level).toBe('2');
    })

    it('success: 200 - POST - user not admin, not premium', async () => {
      const formData = new FormData();
      formData.append('user', user_b.username);
      formData.append('itemID', user_b.userId);
      formData.append('item', 'test post item 1');
      formData.append('itemCorrect', 'test post item correct 1');
      formData.append('itemType', 'test post item type 1');
      formData.append('itemTypeCategory', 'test post item type category 1');
      formData.append('userMotherTongue', 'ru');
      formData.append('languageStudying', 'en');
      formData.append('level', '1');
      formData.append('itemTranscription', 'test post item transcription 1');
      const audioFilePath = path.resolve(__dirname, '../fixtures/test-item-post.m4a');
      const audioFile = fs.readFileSync(audioFilePath);
      formData.append('file', audioFile, {
        filename: 'test-item-post.m4a',
        contentType: 'audio/mp4',
      });

      const response = await dataHandler(createFormDataEvent(formData, user_b.username, user_b.role, 'POST'));
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBe(`Successfully added test post item 1 by ${user_b.username}.`);
    })

    it('success: 200 - POST - admin, premium', async () => {
      const formData = new FormData();
      formData.append('user', user_a.username);
      formData.append('itemID', user_a.userId);
      formData.append('item', 'test post item 2');
      formData.append('itemCorrect', 'test post item correct 2');
      formData.append('itemType', 'test post item type 2');
      formData.append('itemTypeCategory', 'test post item type category 2');
      formData.append('userMotherTongue', 'ru');
      formData.append('languageStudying', 'en');
      formData.append('level', '1');
      formData.append('itemTranscription', 'test post item transcription 2');


      getIncorrectItems.mockResolvedValue(['test-post-item-ai-incorrect-item-1', 'test-post-item-ai-incorrect-item-2', 'test-post-item-ai-incorrect-item-3']);
      const response = await dataHandler(createFormDataEvent(formData, user_a.username, user_a.role, 'POST'));
      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toBe(`Successfully added test post item 2 by ${user_a.username}.`);
    })
  });


  // 6) Users-sqs tests
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
            username: user_d.username,
            userId: user_d.userId,
            toBeDeleted: 'delete'
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);
      const body = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('User deleted');
      expect(body.data.$metadata.httpStatusCode).toBe(200);
      expect(body.data.Attributes.user).toBe(user_d.username);
    });
  });

  describe('change-password flow', () => {
    it('should handle password change request', async () => {
      const hashedPassword = await hashPassword(user_d.password)

      const mockEvent = {
        Records: [{
          body: JSON.stringify({
            eventName: 'change-password',
            dbUsers: process.env.DB_USERS,
            user: user_d.username,
            userId: user_d.userId,
            password: hashedPassword
          })
        }]
      };

      const result = await usersSqsHandler(mockEvent);
      const body = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Password changed');
      expect(body.data.$metadata.httpStatusCode).toBe(200);
      expect(body.data.Attributes.user).toBe(user_d.username);
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
            user: user_a.username,
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
            user: user_a.username,
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