const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/wishlist
// @desc    Get user wishlist
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT w.*, g.id as flash_id, g.title, g.image_url as first_image
             FROM wishlists w
             JOIN gallery_items g ON w.flash_id = g.id
             WHERE w.client_id = ?`,
            [req.user.id]
        );
        // Note: The frontend expects 'flash_tattoos' object or similar if it was using Supabase join
        // I'll format it to match what's expected if possible, or update the store.
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/wishlist
// @desc    Add to wishlist
router.post('/', authMiddleware, async (req, res) => {
    const { flash_id } = req.body;
    try {
        await db.query(
            'INSERT INTO wishlists (client_id, flash_id) VALUES (?, ?)',
            [req.user.id, flash_id]
        );
        res.json({ message: 'Added to wishlist' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Already in wishlist' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/wishlist/:flashId
// @desc    Remove from wishlist
router.delete('/:flashId', authMiddleware, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM wishlists WHERE client_id = ? AND flash_id = ?',
            [req.user.id, req.params.flashId]
        );
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
