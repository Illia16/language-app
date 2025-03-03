const jwt = require('jsonwebtoken');
const getToken = (role = 'admin') => jwt.sign({
  user: 'testuser',
  role: role
}, 'test-secret', { expiresIn: '25 days' });

module.exports = {
  getToken
}