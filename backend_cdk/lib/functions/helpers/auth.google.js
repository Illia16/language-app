module.exports = {
    getGoogleUserInfo: async (access_token) => {
        try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!userInfoRes.ok) {
                const errorData = await userInfoRes.json();
                console.error('User info error:', errorData);
                throw new Error('Failed to fetch Google user info.');
            }

            const user = await userInfoRes.json();
            return user;
        } catch (error) {
            console.error('Failed to get Google user info:', error);
            throw new Error('Failed to get Google user info.');
        }
    },
    getGoogleToken: async ({ code, refresh_token, client_id, client_secret, redirect_uri }) => {
        try {
            const tokenEndpoint = 'https://oauth2.googleapis.com/token';
            const tokenParams = new URLSearchParams({
                ...(code && { code: code }),
                client_id: client_id,
                client_secret: client_secret,
                redirect_uri: redirect_uri,
                ...(refresh_token && { refresh_token: refresh_token }),
                grant_type: refresh_token ? 'refresh_token' : 'authorization_code'
            });

            const tokenRes = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: tokenParams,
            });

            if (!tokenRes.ok) {
                const errorData = await tokenRes.json();
                console.log('____+errorData', errorData);
                if (errorData.error === 'invalid_grant') {
                    throw new Error(errorData.error_description);
                }
                throw new Error('Failed to exchange token.');
            }

            const tokens = await tokenRes.json();
            return tokens;
        } catch (error) {
            console.log('____+error1', error);
            throw error;
        }
    }
}