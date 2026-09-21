import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not configured. Add it to your environment variables.'
  );
}

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    if (normalizedName.length < 2) {
      return res.status(400).json({
        message: 'Name must contain at least 2 characters'
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long'
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'buyer'
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error('Registration error:', err);

    return res.status(500).json({
      message: 'Unable to register user'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      message: 'Unable to log in'
    });
  }
});

export default router;