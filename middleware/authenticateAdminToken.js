// authenticateAdminToken.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function authenticateAdminToken(req, res, next) {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    
    if (!decoded || decoded.user_role !== "1") {
      return res.status(403).json({ message: 'Forbidden, admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error validating token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = {
  authenticateAdminToken,
};
