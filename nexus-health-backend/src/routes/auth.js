const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, uuidv4 } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const refreshTokens = [];

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'nexus-secret-key',
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'nexus-secret-key',
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient', phone, dateOfBirth, gender, specialization, licenseNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      gender: gender || 'other',
      specialization: role === 'doctor' ? specialization : undefined,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
      createdAt: new Date(),
      bloodType: null,
      allergies: [],
      emergencyContact: null,
      chronicConditions: [],
    };

    db.users.push(user);
    const { password: _, ...userWithoutPassword } = user;
    const tokens = generateTokens(user);
    refreshTokens.push(tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
      token: tokens.accessToken,
      ...tokens,
      data: {
        user: userWithoutPassword,
        token: tokens.accessToken,
        ...tokens,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);
    refreshTokens.push(tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: tokens.accessToken,
      ...tokens,
      data: {
        user: userWithoutPassword,
        token: tokens.accessToken,
        ...tokens,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user (me)
router.get('/me', authenticate, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id) || req.user;
  const { password: _, ...cleanUser } = user;
  res.json({
    success: true,
    user: cleanUser,
    data: {
      user: cleanUser,
    },
  });
});

// Refresh token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'nexus-secret-key');
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const tokens = generateTokens(user);
    const idx = refreshTokens.indexOf(refreshToken);
    refreshTokens[idx] = tokens.refreshToken;
    res.json({
      success: true,
      ...tokens,
      token: tokens.accessToken,
      data: tokens,
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  const idx = refreshTokens.indexOf(refreshToken);
  if (idx > -1) refreshTokens.splice(idx, 1);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Update Profile
router.put('/profile', authenticate, (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  const allowedUpdates = ['name', 'phone', 'dateOfBirth', 'gender', 'bloodType', 'allergies', 'emergencyContact', 'chronicConditions'];
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      db.users[userIndex][key] = req.body[key];
    }
  }

  const { password: _, ...updatedUser } = db.users[userIndex];
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser,
    data: updatedUser,
  });
});

// Demo accounts
router.get('/demo', (req, res) => {
  res.json({
    message: 'Demo accounts',
    accounts: [
      { email: 'patient@nexushealth.com', password: 'password123', role: 'patient' },
      { email: 'doctor@nexushealth.com', password: 'password123', role: 'doctor' },
      { email: 'admin@nexushealth.com', password: 'password123', role: 'admin' },
    ],
  });
});

module.exports = router;
