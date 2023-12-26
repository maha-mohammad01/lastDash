// authenticateToken.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token is missing.' });
  }

  jwt.verify(token, secretKey, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired.' });
      } else {
        return res.status(401).json({ message: 'Invalid token.' });
      }
    }

    if (decoded.is_deleted) {
      return res.status(401).json({ message: 'User account has been deleted' });
    }

    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticateToken,
};
