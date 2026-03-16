const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/flash', require('./routes/flash'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/promos', require('./routes/promos'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/users', require('./routes/users'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Vanely Tattoo API is running' });
});

// Health Check / DB Check
app.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() as now');
        res.json({ status: 'ok', serverTime: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
