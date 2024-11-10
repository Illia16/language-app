const jwt = require('jsonwebtoken');

const secret  = 'mySecret1234!';

module.exports = async () => {
    const credentials = [
        {
            user: 'illia',
            pw: '111',
            role: 'admin'
        },
        {
            user: 'viktoria',
            pw: '222',
            role: 'user'
        }
    ];

    const userLogin = process.argv[2];
    const userPw = process.argv[3];
    console.log('userLogin', userLogin);
    console.log('userPw', userPw);

    let res;

    const user = credentials.filter(user => user.user === userLogin);
    console.log('user', user);

    if (!user.length) {
        console.log('No user found.');
        return
    }

    if (user.length) {
        console.log('User exists.');

        if (user[0].pw === userPw) {
            console.log('Login success.');
            res = jwt.sign(user[0], secret, {expiresIn: '5s'})
            console.log('Generated token:', res);

            // simulation to test token for validation/expiration
            await new Promise((resolve, reject) => {
                let count = 0;
                const interval = setInterval(() => {
                    count++
                    console.log('count...', count);
                    if (count >= 4) {
                        console.log('done!');
                        clearInterval(interval);
                        resolve();
                    }
                }, 1000);
            })
            console.log('after done...');

            jwt.verify(res, secret, (err, decoded) => {
                if (err) {
                    console.log('Err, token is invalid:', err);
                    return;
                }

                console.log('Token is ok.', decoded);
            })
        } else {
            console.log('Wrong pw.');
        }
    }
}
module.exports();