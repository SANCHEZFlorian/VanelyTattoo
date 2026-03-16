const createCrudRouter = require('./crudFactory');
const router = createCrudRouter('categories');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Add custom rename route
router.post('/rename', authMiddleware, async (req, res) => {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
        return res.status(400).json({ message: 'oldName and newName are required' });
    }

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update the category name in the categories table
        await connection.execute(
            'UPDATE categories SET name = ? WHERE name = ?',
            [newName, oldName]
        );

        // 2. Update flash_tattoos
        // We fetch rows that have the old category in their JSON array
        // In MariaDB/MySQL we can use JSON_SEARCH or just string replacement if we're careful
        // JSON_REPLACE is better but tricky with arrays
        // Let's use a simpler approach: fetch all rows and update them if they contain the category

        const [flashRows] = await connection.execute('SELECT id, categories FROM flash_tattoos');
        for (const row of flashRows) {
            let cats = row.categories;
            if (typeof cats === 'string') cats = JSON.parse(cats);

            if (Array.isArray(cats) && cats.includes(oldName)) {
                const newCats = cats.map(c => c === oldName ? newName : c);
                await connection.execute(
                    'UPDATE flash_tattoos SET categories = ? WHERE id = ?',
                    [JSON.stringify(newCats), row.id]
                );
            }
        }

        // 3. Update gallery_items
        const [galleryRows] = await connection.execute('SELECT id, categories FROM gallery_items');
        for (const row of galleryRows) {
            let cats = row.categories;
            if (typeof cats === 'string') cats = JSON.parse(cats);

            if (Array.isArray(cats) && cats.includes(oldName)) {
                const newCats = cats.map(c => c === oldName ? newName : c);
                await connection.execute(
                    'UPDATE gallery_items SET categories = ? WHERE id = ?',
                    [JSON.stringify(newCats), row.id]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Category renamed successfully across all items', oldName, newName });
    } catch (err) {
        await connection.rollback();
        console.error('Error renaming category:', err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;

