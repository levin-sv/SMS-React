const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.userId, username: user.username },
      process.env.JWT_SECRET || 'stockhub_sms_secret',
      { expiresIn: '8h' }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      message: 'Username and new password (min 6 characters) are required',
    });
  }
  try {
    const [rows] = await pool.query('SELECT userId FROM User WHERE username = ?', [username]);
    if (!rows.length) {
      return res.status(404).json({ message: 'No account found with that username' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE User SET passwordHash = ? WHERE username = ?', [hash, username]);
    res.json({ message: 'Password updated successfully. You can sign in now.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ message: 'Username and password (min 6 chars) required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO User (username, passwordHash) VALUES (?, ?)', [username, hash]);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
