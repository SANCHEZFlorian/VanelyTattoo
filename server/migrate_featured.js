const db = require('./db');
async function migrate() {
    try {
        await db.pool.execute('ALTER TABLE flash_tattoos ADD COLUMN is_featured BOOLEAN DEFAULT FALSE');
        console.log('Migration successful: Added is_featured to flash_tattoos');
    } catch(err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column is_featured already exists.');
        } else {
            console.error('Migration error:', err);
        }
    }
    process.exit(0);
}
migrate();
