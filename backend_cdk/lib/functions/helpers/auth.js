const bcryptjs = require('bcryptjs');

module.exports = {
    hashPassword: async (password) => {
        const saltRounds = 10;
        const salt = await bcryptjs.genSalt(saltRounds);
        const hashedPassword = await bcryptjs.hash(password, salt);
        return hashedPassword;
    },
    checkPassword: async (hashedPassword, userPassword) => {
        const match = await bcryptjs.compare(userPassword, hashedPassword);
        return match;
    },
}