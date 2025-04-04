const { setupTestEnv, cleanupTestEnv } = require('../setup/mocks');
const { handler: secretRotationHandler } = require('../../lib/functions/secret-rotation');
const { createSecret, deleteSecret, getSecret } = require('../util');

describe('secret-rotation lambda', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await cleanupTestEnv();
  });

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