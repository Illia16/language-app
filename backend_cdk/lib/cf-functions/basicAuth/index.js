function handler(event) {
    const expectedUsername = 'user';
    const expectedPassword = 'pw';
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
    const authDecoded = Buffer.from(authString, 'base64').toString('utf-8');
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
