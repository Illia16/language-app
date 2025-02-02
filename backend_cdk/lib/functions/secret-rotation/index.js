const { SSMClient, PutParameterCommand } = require('@aws-sdk/client-ssm');
const clientSSM = new SSMClient({});
const crypto = require('crypto');

module.exports.handler = async (event, context) => {
  // Environment variables
  const SECRET_ID = process.env.SECRET_ID;

  const updateParam = new PutParameterCommand({
    Name: SECRET_ID,
    Value: crypto.randomBytes(32).toString('hex'),
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
