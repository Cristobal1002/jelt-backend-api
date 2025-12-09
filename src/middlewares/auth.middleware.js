import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.unauthorized('Token is invalid or expired');
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (err) {
    return res.unauthorized('Token is invalid or expired');
  }
};
