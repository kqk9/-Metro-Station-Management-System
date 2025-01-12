const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Aa777923',
    database: 'metroStationdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get all personal
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('CALL get_personal()');
        res.render('personel/index', { 
            personal: rows[0],
            message: req.query.message
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show add form
router.get('/add', (req, res) => {
    res.render('personel/add');
});

// Add new personal
router.post('/add', async (req, res) => {
    const { Ad, Soyad, Pozisyon, Maas } = req.body;
    try {
        await pool.execute(
            'CALL add_personal(?, ?, ?, ?)',
            [Ad, Soyad, Pozisyon, parseFloat(Maas)]
        );
        res.redirect('/personel?message=Personnel added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM personal WHERE personalID = ?', [req.params.id]);
        res.render('personel/edit', { person: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update personal
router.post('/edit/:id', async (req, res) => {
    const { Ad, Soyad, Pozisyon, Maas } = req.body;
    const { id } = req.params;
    try {
        await pool.execute(
            'CALL update_personal(?, ?, ?, ?, ?)',
            [parseInt(id), Ad, Soyad, Pozisyon, parseFloat(Maas)]
        );
        res.redirect('/personel?message=Personnel updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Delete personal
router.post('/delete/:id', async (req, res) => {
    try {
        await pool.execute('CALL delete_personal(?)', [req.params.id]);
        res.redirect('/personel?message=Personnel deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    try {
        const [rows] = await pool.execute('CALL search_personal(?)', [`%${searchTerm}%`]);
        
        // Check if the request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json(rows[0]);
        } else {
            // Render the page for non-AJAX requests
            res.render('personel/index', { 
                personal: rows[0],
                searchTerm: searchTerm
            });
        }
    } catch (error) {
        console.error(error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({ error: 'Server error' });
        } else {
            res.status(500).send('Server error');
        }
    }
});

module.exports = router;