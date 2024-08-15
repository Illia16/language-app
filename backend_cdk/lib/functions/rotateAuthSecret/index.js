const { SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand, RotateSecretCommand, GetRandomPasswordCommand  } = require('@aws-sdk/client-secrets-manager');
const client = new SecretsManagerClient({});

module.exports.handler = async (event, context) => {
    console.log('-----------------------------');
    console.log('Rotate secrete handler');
    console.log('event', event);
    console.log('event.body', event.body);
    console.log('context', context);
    console.log('-----------------------------');

    // Environment variables
    const secretId = process.env.secretId;

    const input = {
        "SecretId": secretId,
    };
    console.log('secretId', secretId);
    const command = new GetSecretValueCommand(input);
    const response = await client.send(command);

    console.log('response GET SECRET', response);

    // generateSecretString: {
    //     secretStringTemplate: JSON.stringify({ name: `${props.env.projectName}--secret-auth--${props.env.stage}` }),
    //     generateStringKey: 'value',
    //   },
    
    
    const inputGenRandom = {
        "IncludeSpace": false,
        "PasswordLength": 24,
        "RequireEachIncludedType": true
    };
    const commandGenRandom = new GetRandomPasswordCommand(inputGenRandom);
    const responseGenRandom = await client.send(commandGenRandom);
    console.log('responseGenRandom.RandomPassword', responseGenRandom.RandomPassword);

    
    const inputUpdate = {
        "SecretId": secretId,
        "SecretString": JSON.stringify({ value: responseGenRandom.RandomPassword }),
    };
    const commandUpdate = new UpdateSecretCommand(inputUpdate);
    const responseUpdate = await client.send(commandUpdate);
    console.log('response UPDATE SECRET', responseUpdate);


    // const inputRotate = {
    //     "SecretId": secretId,
    // };
    // const commandRotate = new RotateSecretCommand(inputRotate);
    // const responseRotate = await client.send(commandRotate);
    // console.log('response Rotate SECRET', responseRotate);
};
