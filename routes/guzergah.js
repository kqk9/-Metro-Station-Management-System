// File: routes/guzergah.js
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

// Get all routes
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('CALL get_guzergah()');
        res.render('guzergah/index', { 
            routes: rows[0],
            message: req.query.message
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show add form
router.get('/add', (req, res) => {
    res.render('guzergah/add');
});

// Add new route
router.post('/add', async (req, res) => {
    const { Sure, Baslangic_istasyon, Bitis_istasyon, Mesafe } = req.body;
    try {
        await pool.execute(
            'CALL add_guzergah(?, ?, ?, ?)',
            [parseInt(Sure), Baslangic_istasyon, Bitis_istasyon, parseFloat(Mesafe)]
        );
        res.redirect('/guzergah?message=Route added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Guzergah WHERE GuzergahID = ?', [req.params.id]);
        if (rows.length > 0) {
            res.render('guzergah/edit', { route: rows[0] });
        } else {
            res.redirect('/guzergah?message=Route not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update route
router.post('/edit/:id', async (req, res) => {
    const { Sure, Baslangic_istasyon, Bitis_istasyon, Mesafe } = req.body;
    const { id } = req.params;
    try {
        await pool.execute(
            'CALL update_guzergah(?, ?, ?, ?, ?)',
            [parseInt(id), parseInt(Sure), Baslangic_istasyon, Bitis_istasyon, parseFloat(Mesafe)]
        );
        res.redirect('/guzergah?message=Route updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Delete route
router.post('/delete/:id', async (req, res) => {
    try {
        await pool.execute('CALL delete_guzergah(?)', [req.params.id]);
        res.redirect('/guzergah?message=Route deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Search routes - with live search
router.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    try {
        const [rows] = await pool.execute('CALL search_guzergah(?)', [`%${searchTerm}%`]);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json(rows[0]);
        } else {
            res.render('guzergah/index', { 
                routes: rows[0],
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