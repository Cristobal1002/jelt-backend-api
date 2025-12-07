import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET env var is required');
}

export const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
