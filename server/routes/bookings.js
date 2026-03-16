const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to parse JSON strings in rows
const parseJSONFields = (row) => {
  if (!row) return row;
  const newRow = { ...row };
  for (const key in newRow) {
    const val = newRow[key];
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      try {
        newRow[key] = JSON.parse(val);
      } catch (e) {
        // Not valid JSON, leave as is
      }
    }
  }
  return newRow;
};

// GET ALL — protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(rows.map(parseJSONFields));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET ONE — protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(parseJSONFields(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — PUBLIC (anyone can submit a booking request)
router.post('/', async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    const preparedValues = values.map(v =>
      (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v
    );

    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO bookings (${keys.join(', ')}) VALUES (${placeholders})`;

    const [result] = await db.pool.execute(sql, preparedValues);

    const { rows } = await db.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    res.status(201).json(parseJSONFields(rows[0]));
  } catch (err) {
    console.error('Error creating booking:', err);
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

    const sql = `UPDATE bookings SET ${setClause} WHERE id = ?`;
    await db.pool.execute(sql, preparedValues);

    const { rows } = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(parseJSONFields(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /exceptions — public (used by the booking calendar)
router.get('/exceptions', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM booking_exceptions ORDER BY exception_date ASC');
    res.json(rows.map(parseJSONFields));
  } catch (err) {
    console.error('Error fetching exceptions:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
