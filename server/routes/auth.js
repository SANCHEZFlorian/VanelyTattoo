const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const { rows } = await db.query('SELECT * FROM profiles WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // 2. Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 3. Create JWT
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        // 4. Return user info and token (excluding password_hash)
        const { password_hash, ...userInfo } = user;
        res.json({
            user: userInfo,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile (using token)
const authMiddleware = require('../middleware/authMiddleware');
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM profiles WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });

        const { password_hash, ...userInfo } = rows[0];
        res.json(userInfo);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/me
// @desc    Update user profile
router.put('/me', authMiddleware, async (req, res) => {
    const { full_name, avatar_url } = req.body;
    try {
        // Safety: Ensure avatar_url is a string or null
        const finalAvatarUrl = typeof avatar_url === 'object' && avatar_url !== null ? avatar_url.url : avatar_url;

        await db.query(
            'UPDATE profiles SET full_name = ?, avatar_url = ? WHERE id = ?',
            [full_name, finalAvatarUrl, req.user.id]
        );
        res.json({ message: 'Profile updated' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// @route   PUT /api/auth/password
// @desc    Update user password
router.put('/password', authMiddleware, async (req, res) => {
    const { password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        await db.query(
            'UPDATE profiles SET password_hash = ? WHERE id = ?',
            [password_hash, req.user.id]
        );
        res.json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
