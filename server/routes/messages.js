const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const parseJSONFields = (row) => {
  if (!row) return row;
  const newRow = { ...row };
  for (const key in newRow) {
    const val = newRow[key];
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      try { newRow[key] = JSON.parse(val); } catch (e) {}
    }
  }
  return newRow;
};

// GET ALL — protected (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows.map(parseJSONFields));
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET ONE — protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(parseJSONFields(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — PUBLIC (anyone can send a contact message)
router.post('/', async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const preparedValues = values.map(v =>
      (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v
    );
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO messages (${keys.join(', ')}) VALUES (${placeholders})`;

    const [result] = await db.pool.execute(sql, preparedValues);
    const { rows } = await db.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    res.status(201).json(parseJSONFields(rows[0]));
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT — protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const preparedValues = values.map(v =>
      (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v
    );
    preparedValues.push(req.params.id);

    await db.pool.execute(`UPDATE messages SET ${setClause} WHERE id = ?`, preparedValues);
    const { rows } = await db.query('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    res.json(parseJSONFields(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
