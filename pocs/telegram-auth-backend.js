const crypto = require('crypto');
const config = require('../../deploy.config');

const main = (userData => {
    const verifyTelegramAuth = (data) => {
        const secretKey = crypto.createHash('sha256').update(config.TG_BOT_TOKEN).digest();
        const dataCheckString = Object.keys(data)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('\n');
        
        const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        
        if (hmac !== data.hash) {
            return false
        }

        const authDate = parseInt(data.auth_date, 10);
        const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
        const maxTimeDifference = 5 * 60; // 5 minutes in seconds

        if (currentTime - authDate > maxTimeDifference) {
            return false; // Data is too old
        }


        return true
    }

    if (verifyTelegramAuth(userData)) {
        return {success: true,  user: userData };
      } else {
        return {success: false, msg: 'Authentication failed' };
    }
})

const res = main({
    "id": 123456789,
    "first_name": "John",
    "username": "jdoe",
    "photo_url": "profile_avatar",
    "auth_date": 1724008128,
    "hash": "some hash"
})

console.log('res', res);

// FE code 
// Add TG script
// const targetElement = document.querySelector('#user_login');
// const tgScript = document.createElement('script');
// tgScript.src = "https://telegram.org/js/telegram-widget.js?22";
// tgScript.setAttribute('data-telegram-login', 'PersonalProjectLanguageAppBot');
// tgScript.setAttribute('data-size', 'small');
// tgScript.setAttribute('data-onauth', 'onTelegramAuth(user)');
// tgScript.setAttribute('data-onunauth', 'onTelegramUnAuth(user)');
// tgScript.setAttribute('data-request-access', 'write');
// tgScript.async = true;
// tgScript.type = 'text/javascript';
// targetElement?.appendChild(tgScript);


// Add callback functions
// const tgFunctionScript = document.createElement('script');
// tgFunctionScript.type = 'text/javascript';
// tgFunctionScript.innerHTML = `
//   function onTelegramAuth(user) {
//     console.log('user onTelegramAuth', user)
//   }
//   function onTelegramUnAuth(user) {
//     console.log('user onTelegramUnAuth', user)
//   }
// `;
// targetElement?.appendChild(tgFunctionScript);