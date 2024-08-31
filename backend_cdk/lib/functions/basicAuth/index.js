import cf from 'cloudfront';

const kvsHandle = cf.kvs();

async function handler(event) {
    let expectedUsername;
    let expectedPassword;
    try {
        expectedUsername = await kvsHandle.get('BASIC_AUTH_USERNAME');
        expectedPassword = await kvsHandle.get('BASIC_AUTH_PASSWORD');
    } catch (err) {
        console.log(`Kvs key lookup failed for ${key}: ${err}`);
    }

    console.log(JSON.stringify(event));
    console.log('___event', event);

    let request = event.request;
    const headers = request.headers;

    const objReject = {
        statusCode: 401,
        statusDescription: 'Unauthorized',
        headers: {
            'www-authenticate': { value: 'Basic' },
        },
    };

    if (!headers.authorization) {
        return objReject;
    }

    const authHeader = headers.authorization.value;
    const authString = authHeader.split(' ')[1];
    const authDecoded = String.bytesFrom(authString, 'base64');
    console.log('authHeader', authHeader);
    console.log('authString', authString);
    console.log('authDecoded', authDecoded);
    const split = authDecoded.split(':');

    if (split[0] !== expectedUsername || split[1] !== expectedPassword) {
        return objReject;
    }

    request.uri = request.uri.replace(/^(.*?)(\/?[^.\/]*\.[^.\/]*)?\/?$/, function($0, $1, $2) {
        return $1 + ($2 ? $2 : "/index.html");
    });

    return request;
}
