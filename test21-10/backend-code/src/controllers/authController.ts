import { Request, Response } from 'express';
import { query } from '../db/index';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
  }
  return secret;
};

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
};

const verifyPassword = (password: string, hash: string): boolean => {
  const [salt, key] = hash.split(':');
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return key === derivedKey;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'Username, email, and password are required.',
      });
      return;
    }

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({
        status: 'error',
        code: 'USER_EXISTS',
        message: 'A user with this email already exists.',
      });
      return;
    }

    const hashedPassword = hashPassword(password);

    const result = await query(
      'INSERT INTO users (username, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, username, email, phone',
      [username, email, phone, hashedPassword]
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred during registration.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_FAILED',
        message: 'Email and password are required.',
      });
      return;
    }

    const result = await query('SELECT id, username, email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password.',
      });
      return;
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      secret,
      { expiresIn: '30m' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred during login.',
    });
  }
};