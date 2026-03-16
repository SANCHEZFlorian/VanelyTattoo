const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/users
// @desc    Create a new user (Admin only)
router.post('/', [authMiddleware], async (req, res) => {
    // Basic admin check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { email, password, role, full_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if user already exists
        const { rows: existingUsers } = await db.query('SELECT id FROM profiles WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const id = crypto.randomUUID();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // Default permissions based on role
        const permissions = role === 'admin' 
            ? { all: true } 
            : { manage_gallery: true, manage_flash: true, manage_bookings: true };

        const sql = `
            INSERT INTO profiles (id, email, password_hash, role, full_name, permissions)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            id, 
            email, 
            password_hash, 
            role || 'artist', 
            full_name || email.split('@')[0], 
            JSON.stringify(permissions)
        ]);

        // Return the created user (without password hash)
        res.status(201).json({
            id,
            email,
            role: role || 'artist',
            full_name: full_name || email.split('@')[0],
            created_at: new Date()
        });

    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Admin only simplified check for now (role = 'admin')
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

// @route   GET /api/users
// @desc    Get all users (Admin only)
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role
router.put('/:id/role', [authMiddleware, adminMiddleware], async (req, res) => {
    const { role } = req.body;
    try {
        await db.query('UPDATE profiles SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        await db.query('DELETE FROM profiles WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
