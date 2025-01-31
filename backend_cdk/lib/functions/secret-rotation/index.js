const { SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand, RotateSecretCommand, GetRandomPasswordCommand } = require('@aws-sdk/client-secrets-manager');
const { SSMClient, GetParametersCommand, PutParameterCommand } = require('@aws-sdk/client-ssm');
const client = new SecretsManagerClient({});
const clientSSM = new SSMClient({});

module.exports.handler = async (event, context) => {
  // Environment variables
  const SECRET_ID = process.env.SECRET_ID;

  // // const input = {
  // //   "SecretId": SECRET_ID,
  // // };
  // // const command = new GetSecretValueCommand(input);
  // // const response = await client.send(command);

  // const inputGenRandom = {
  //   "IncludeSpace": false,
  //   "PasswordLength": 24,
  //   "RequireEachIncludedType": true
  // };
  // const commandGenRandom = new GetRandomPasswordCommand(inputGenRandom);
  // const responseGenRandom = await client.send(commandGenRandom);

  // const inputUpdate = {
  //   "SecretId": SECRET_ID,
  //   "SecretString": JSON.stringify({ value: responseGenRandom.RandomPassword }),
  // };
  // const commandUpdate = new UpdateSecretCommand(inputUpdate);
  // const responseUpdate = await client.send(commandUpdate);

  const command = new GetParametersCommand({
    Names: [
      SECRET_ID,
    ],
    WithDecryption: true,
  });
  const response = await clientSSM.send(command);
  console.log('ssm response', response.Parameters[0].Value);

  const updateParam = new PutParameterCommand({
    Name: SECRET_ID,
    Value: response.Parameters[0].Value,
    Type: "SecureString",
    Overwrite: true,
  });

  try {
    const updateParamResponse = await clientSSM.send(updateParam);
    console.log("SSM Parameter Updated:", updateParamResponse);
  } catch (error) {
    console.error("Error updating SSM parameter:", error);
  }
};
