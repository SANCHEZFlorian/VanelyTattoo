const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Utility to create standard CRUD routes for a table
 * @param {string} tableName
 * @returns {express.Router}
 */
function createCrudRouter(tableName) {
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

    // GET ALL
    router.get('/', async (req, res) => {
        try {
            const { rows } = await db.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
            res.json(rows.map(parseJSONFields));
        } catch (err) {
            console.error(`Error fetching ${tableName}:`, err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET ONE
    router.get('/:id', async (req, res) => {
        try {
            const { rows } = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
            res.json(parseJSONFields(rows[0]));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST
    router.post('/', authMiddleware, async (req, res) => {
        try {
            const payload = { ...req.body };
            delete payload.id;
            delete payload.created_at;
            delete payload.updated_at;
            
            // Format any incoming ISO dates to MySQL 'YYYY-MM-DD HH:MM:SS'
            for (const key in payload) {
                if (typeof payload[key] === 'string' && payload[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
                    payload[key] = new Date(payload[key]).toISOString().slice(0, 19).replace('T', ' ');
                }
            }

            const keys = Object.keys(payload);
            const values = Object.values(payload);

            // Convert arrays/objects to JSON strings for MariaDB if necessary
            const preparedValues = values.map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);

            const placeholders = keys.map(() => '?').join(', ');
            const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

            const [result] = await db.pool.execute(sql, preparedValues);

            // Fetch the newly created record
            const { rows } = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
            res.status(201).json(parseJSONFields(rows[0]));
        } catch (err) {
            console.error(`Error creating ${tableName}:`, err);
            res.status(500).json({ error: err.message });
        }
    });

    // PUT
    router.put('/:id', authMiddleware, async (req, res) => {
        try {
            const payload = { ...req.body };
            delete payload.id;
            delete payload.created_at;
            delete payload.updated_at;

            // Format any incoming ISO dates to MySQL 'YYYY-MM-DD HH:MM:SS'
            for (const key in payload) {
                if (typeof payload[key] === 'string' && payload[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
                    payload[key] = new Date(payload[key]).toISOString().slice(0, 19).replace('T', ' ');
                }
            }

            const keys = Object.keys(payload);
            const values = Object.values(payload);

            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const preparedValues = values.map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
            preparedValues.push(req.params.id);

            const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
            await db.pool.execute(sql, preparedValues);

            const { rows } = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
            res.json(parseJSONFields(rows[0]));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // DELETE
    router.delete('/:id', authMiddleware, async (req, res) => {
        try {
            await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
            res.json({ message: `${tableName} deleted successfully` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}

module.exports = createCrudRouter;
