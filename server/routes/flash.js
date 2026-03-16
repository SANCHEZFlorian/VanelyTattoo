const createCrudRouter = require('./crudFactory');
const router = createCrudRouter('flash_tattoos');

const db = require('../db');
router.post('/:id/increment-view', async (req, res) => {
    try {
        await db.query('UPDATE flash_tattoos SET views = views + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
