const { csrfSync } = require('csrf-sync');

const {
  csrfSynchronisedProtection,
  generateToken,
  getTokenFromState,
  getTokenFromRequest,
  revokeToken
} = csrfSync({
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'];
  },
});

module.exports = {
  csrfProtection: csrfSynchronisedProtection,
  generateToken,
  getTokenFromState,
  getTokenFromRequest,
  revokeToken
};
