// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {validateRegistration, handleValidationErrors} = require('../chains/validation');
const {Op} = require('sequelize')
const router = express.Router();

// Register a new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{username}, {email}],
        },
    });

    if (existingUser) {
        return res.status(400).json({message: 'Username or email already exists'});
    }

    const user = await User.create({ firstName, lastName, username, email, password });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15min' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ message: 'User registration failed', error: err.message });
  }
});

// Login user
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({ 
        where: {
            [Op.or]: [{ username: identifier }, { email: identifier }],
          },
        });
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    });

module.exports = router;