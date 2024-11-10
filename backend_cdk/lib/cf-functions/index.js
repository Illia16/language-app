function handler(event) {
    const expectedUsername = 'user';
    const expectedPassword = 'pw';

    let request = event.request;
    const headers = request.headers;
    const isProd = headers.host.value === 'languageapp.illusha.net';

    // Redirect if the request is from the CloudFront domain
    if (['d3qignet23dx6u.cloudfront.net', 'd15k5khhejlcll.cloudfront.net'].includes(headers.host.value)) {
        const customDomain = headers.host.value === "d15k5khhejlcll.cloudfront.net" ? "languageapp.illusha.net" : "languageapp-test.illusha.net"

        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: `https://${customDomain}${request.uri}` }
            }
        };
    }

    const objReject = {
        statusCode: 401,
        statusDescription: 'Unauthorized',
        headers: {
            'www-authenticate': { value: 'Basic' },
        },
    };

    if (!isProd) {
        if (!headers.authorization) {
            return objReject;
        }
    
        const authHeader = headers.authorization.value;
        const authString = authHeader.split(' ')[1];
        const authDecoded = Buffer.from(authString, 'base64').toString('utf-8');
        const split = authDecoded.split(':');
    
        if (split[0] !== expectedUsername || split[1] !== expectedPassword) {
            return objReject;
        }
    }

    request.uri = request.uri.replace(/^(.*?)(\/?[^.\/]*\.[^.\/]*)?\/?$/, function($0, $1, $2) {
        return $1 + ($2 ? $2 : "/index.html");
    });

    return request;
}
