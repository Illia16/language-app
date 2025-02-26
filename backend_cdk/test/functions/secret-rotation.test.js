const { ssmMock, clearMocks, setupTestEnv } = require('../setup/mocks');
const { PutParameterCommand } = require('@aws-sdk/client-ssm');
const { handler: secretRotationHandler } = require('../../lib/functions/secret-rotation');

describe('Secret Rotation Lambda', () => {
  beforeEach(() => {
    clearMocks();
    setupTestEnv();
  });

  it('should update SSM parameter with new random value', async () => {
    ssmMock.on(PutParameterCommand).resolves();

    await secretRotationHandler();

    const ssmCalls = ssmMock.calls();
    expect(ssmCalls).toHaveLength(1);

    const putParamCall = ssmCalls[0].args[0].input;
    expect(putParamCall).toEqual({
      Name: '/test/secret',
      Type: 'SecureString',
      Overwrite: true,
      Value: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
  });
});