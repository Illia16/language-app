module.exports = {
    getGitHubUserInfo: async (access_token) => {
        try {
            const userInfoRes = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });

            if (!userInfoRes.ok) {
                const errorData = await userInfoRes.json();
                console.error('User info error:', errorData);
                throw new Error('Failed to fetch GitHub user info.');
            }

            const user = await userInfoRes.json();
            return user;
        } catch (error) {
            console.error('Failed to get GitHub user info:', error);
            throw new Error('Failed to get GitHub user info.');
        }
    },
    getGitHubToken: async ({ code, client_id, client_secret, redirect_uri }) => {
        try {
            const endPoint = `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`;
            const response = await fetch(endPoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Token error:', errorData);
                throw new Error('Failed to exchange token.');
            }

            const tokens = await response.json();
            return tokens;
        } catch (error) {
            console.log('____+error1', error);
            throw error;
        }
    }
}