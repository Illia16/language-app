const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand, BatchWriteCommand, UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { SSMClient, GetParametersCommand, PutParameterCommand, DeleteParameterCommand } = require('@aws-sdk/client-ssm');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const clientSSM = new SSMClient({});

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require('../lib/functions/helpers/auth');
const crypto = require('crypto');

const getToken = (user, role = 'admin', secret) => jwt.sign({
  user: user,
  role: role
}, secret, { expiresIn: '25 days' });

const createSecret = async (secretName) => {
  const command = new PutParameterCommand({
    Name: secretName,
    Value: crypto.randomBytes(32).toString('hex'),
    Type: 'SecureString',
    Overwrite: true,
  });
  const res = await clientSSM.send(command);
  return res;
}

const deleteSecret = async (secretName) => {
  const command = new DeleteParameterCommand({
    Name: secretName,
  });
  const res = await clientSSM.send(command);
  return res;
}

const getSecret = async (secretName) => {
  const command = new GetParametersCommand({
    Names: [secretName],
  });
  const res = await clientSSM.send(command);
  return res;
}

const createInvitationCode = async (dbUsers) => {
  const genInvitationCode = uuidv4();
  const input = {
    "Item": {
      user: genInvitationCode,
      userId: genInvitationCode,
      role: 'user',
    },
    "ReturnConsumedCapacity": "TOTAL",
    "TableName": dbUsers,
  };

  const command = new PutCommand(input);
  await docClient.send(command);
  return genInvitationCode;
}

const createUser = async ({ dbUsers, username, userId, password, userRole, userEmail, userTier }) => {
  const hashedPassword = await hashPassword(password)

  const inputCreateUser = {
    Item: {
      user: username,
      userId: userId,
      password: hashedPassword,
      userMotherTongue: 'ru',
      role: userRole,
      userEmail: userEmail,
      userTier: userTier,
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: dbUsers
  };

  const commandCreateUser = new PutCommand(inputCreateUser);
  await docClient.send(commandCreateUser);
}

const deleteUser = async ({ dbUsers, user, userId }) => {
  const inputDeleteUser = {
    TableName: dbUsers,
    Key: {
      user: user,
      userId: userId
    },
  };

  const commandInputDeleteUser = new DeleteCommand(inputDeleteUser);
  await docClient.send(commandInputDeleteUser);
}

const createUserItem = async ({ dbData, user, itemID }) => {
  const input = {
    "Item": {
      user: user,
      itemID: itemID,
      item: 'fake_item',
      itemCorrect: 'fake_item_correct',
      incorrectItems: JSON.stringify(['fake_incorrect_item_1', 'fake_incorrect_item_2']),
      itemType: 'fake_item_type',
      itemTypeCategory: 'fake_item_type_category',
      userMotherTongue: 'ru',
      languageStudying: 'en',
      level: '0',
      getAudioAI: true,
      itemTranscription: 'fake_item_transcription',
      filePath: 'fake_file_path',
      existingFileNameS3: 'fake_existing_file_name_s3',
      audioFilePathAi: 'fake_audio_file_path_ai',
    },
    "TableName": dbData
  };

  const command = new PutCommand(input);
  await docClient.send(command);
}

const deleteMultipleUserItems = async ({ dbData, items }) => {
  const deleteRequests = items.map(item => ({
    DeleteRequest: {
      Key: {
        user: item.user,
        itemID: item.itemID,
      }
    }
  }));

  const input = {
    "RequestItems": {
      [dbData]: deleteRequests
    }
  };

  const command = new BatchWriteCommand(input);
  await docClient.send(command);
}

module.exports = {
  getToken,
  createSecret,
  deleteSecret,
  getSecret,
  createInvitationCode,
  createUser,
  deleteUser,
  deleteMultipleUserItems,
  createUserItem,
}