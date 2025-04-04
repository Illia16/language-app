const { setupTestEnv, cleanupTestEnv } = require('../setup/mocks');
const { handler: dataHandler } = require('../../lib/functions/data');
const { getIncorrectItems } = require('../../lib/functions/helpers/openai');
const { getToken } = require('../util');

const FormData = require('form-data');

const path = require('path');
const fs = require('fs');

const { user_a, user_b, user_c } = require('../fixtures/users');

describe('data lambda', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await cleanupTestEnv();
  });

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
          Authorization: `Bearer ${getToken(user_c.username, user_c.role, process.env.SECRET_ID_VALUE)}`
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
});