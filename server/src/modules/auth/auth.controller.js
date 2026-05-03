import jwt from 'jsonwebtoken';
import User from './user.model.js';
import config from '../../config/index.js';
import { ApiError } from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expire });
  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpire });
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ApiError(409, existingUser.email === email ? 'Email already in use' : 'Username already taken');
    }

    const user = await User.create({ username, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User registered: ${user.username}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (user.isBanned) {
      throw new ApiError(403, 'Your account has been banned');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.username}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new ApiError(400, 'Refresh token required');

    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
