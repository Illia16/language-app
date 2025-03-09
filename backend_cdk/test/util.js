const jwt = require('jsonwebtoken');
const getToken = (user, role = 'admin', secret) => jwt.sign({
  user: user,
  role: role
}, secret, { expiresIn: '25 days' });

module.exports = {
  getToken
}