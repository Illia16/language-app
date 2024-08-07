const bcrypt = require('bcrypt');

const pw_input = process.argv[2] || 'my_pw';

// Function to hash a password
async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

// Function to check a password
async function checkPassword(hashedPassword, userPassword) {
    const match = await bcrypt.compare(userPassword, hashedPassword);
    return match;
}

// Example usage
(async () => {
    // Hash a new password
    const password = pw_input;
    const hashedPassword = await hashPassword(password);
    console.log("Hashed Password:", hashedPassword);

    // Check the password
    const passwordToCheck = pw_input;
    const isCorrect = await checkPassword(hashedPassword, passwordToCheck);
    console.log("Is password correct:", isCorrect);
})();
