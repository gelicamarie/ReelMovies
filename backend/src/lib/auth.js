import { sign } from 'jsonwebtoken';

//creates JWT tokens
export const createToken = (
  username,
  userId,
  role,
  tokenSecret,
  expiryTime,
) => sign({ username, userId, role }, tokenSecret, { expiresIn: expiryTime });

export const JWT_SECRET = 'thisisverysecret';
