const { SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand, RotateSecretCommand, GetRandomPasswordCommand  } = require('@aws-sdk/client-secrets-manager');
const client = new SecretsManagerClient({});

module.exports.handler = async (event, context) => {
    // Environment variables
    const SECRET_ID = process.env.SECRET_ID;

    const input = {
        "SecretId": SECRET_ID,
    };
    const command = new GetSecretValueCommand(input);
    const response = await client.send(command);
    
    const inputGenRandom = {
        "IncludeSpace": false,
        "PasswordLength": 24,
        "RequireEachIncludedType": true
    };
    const commandGenRandom = new GetRandomPasswordCommand(inputGenRandom);
    const responseGenRandom = await client.send(commandGenRandom);
    
    const inputUpdate = {
        "SecretId": SECRET_ID,
        "SecretString": JSON.stringify({ value: responseGenRandom.RandomPassword }),
    };
    const commandUpdate = new UpdateSecretCommand(inputUpdate);
    const responseUpdate = await client.send(commandUpdate);
};
