// exports.handler = async (event) => {
//     const expectedUsername = 'user';
//     const expectedPassword = 'pw';

//     const request = event.Records[0].cf.request;
//     console.log('request', JSON.stringify(request, null, 2));
//     const headers = request.headers;
//     console.log('headers', JSON.stringify(headers, null, 2));

//     const objReject = {
//         status: '401',
//         statusDescription: 'Unauthorized',
//         body: 'Unauthorized',
//         headers: {
//             'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic' }],
//         },
//     };

//     if (!headers.authorization) {
//         return objReject;
//     }

//     const authHeader = headers.authorization[0].value;
//     console.log('authHeader', authHeader);
//     const authString = authHeader.split(' ')[1];
//     console.log('authString', authString);
//     const authDecoded = Buffer.from(authString, 'base64').toString('utf-8');
//     console.log('authDecoded', authDecoded);
//     const [username, password] = authDecoded.split(':');

//     if (username !== expectedUsername || password !== expectedPassword) {
//         return objReject;
//     }

//     request.uri = request.uri.replace(/^(.*?)(\/?[^.\/]*\.[^.\/]*)?\/?$/, function($0, $1, $2) {
//         return $1 + ($2 ? $2 : "/index.html");
//     });

//     return request;
// };

function handler(event) {
    var expectedUsername = 'user';
    var expectedPassword = 'pw';
    console.log(JSON.stringify(event));
    console.log('___event', event);

    // var request = event.Records[0].cf.request;
    var request = event.request;
    console.log('request', JSON.stringify(request, null, 2));
    var headers = request.headers;
    console.log('headers', JSON.stringify(headers, null, 2));

    var objReject = {
        statusCode: 401,
        statusDescription: 'Unauthorized',
        headers: {
            'www-authenticate': { value: 'Basic' },
        },
    };

    if (!headers.authorization) {
        return objReject;
    }

    var authHeader = headers.authorization.value;
    console.log('authHeader', authHeader);
    var authString = authHeader.split(' ')[1];
    console.log('authString', authString);
    var authDecoded = String.bytesFrom(authString, 'base64');
    // var authDecoded = Buffer.from(authString, 'base64').toString('utf-8');
    console.log('authDecoded', authDecoded);
    var split = authDecoded.split(':');

    if (split[0] !== expectedUsername || split[1] !== expectedPassword) {
        return objReject;
    }

    request.uri = request.uri.replace(/^(.*?)(\/?[^.\/]*\.[^.\/]*)?\/?$/, function($0, $1, $2) {
        return $1 + ($2 ? $2 : "/index.html");
    });

    return request;
};
