import bcrypt from 'bcrypt';

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const comparePassword = async (password, hashed) =>
  bcrypt.compare(password, hashed);
