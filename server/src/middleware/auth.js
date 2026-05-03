import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { ApiError } from './errorHandler.js';
import User from '../modules/auth/user.model.js';

// Verify JWT and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    if (user.isBanned) {
      throw new ApiError(403, 'Account has been banned');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

// Optional auth — attaches user if token present, continues if not
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findById(decoded.userId).select('-password');
    }
  } catch {
    // Silently continue without user
  }
  next();
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
};
