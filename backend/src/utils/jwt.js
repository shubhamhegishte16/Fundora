import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Admin tokens carry an explicit role claim so they can never be confused
// with a User or Creator token, even though all three currently share JWT_SECRET.
export const generateAdminToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRE || '1d', // shorter-lived than User/Creator tokens
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};