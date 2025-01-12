// File: routes/bilet.js
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

// Get all tickets
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('CALL get_bilet()');
        res.render('bilet/index', { 
            tickets: rows[0],
            message: req.query.message
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show add form
router.get('/add', async (req, res) => {
    try {
        // Get all routes for dropdown
        const [stations] = await pool.execute('SELECT DISTINCT Baslangic_istasyon, Bitis_istasyon FROM Guzergah');
        res.render('bilet/add', { stations });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Add new ticket
router.post('/add', async (req, res) => {
    const { Yolcu_adi, Kalkis_istasyon, Varis_istasyon, Ucret, Tarih } = req.body;
    try {
        await pool.execute(
            'CALL add_bilet(?, ?, ?, ?, ?)',
            [Yolcu_adi, Kalkis_istasyon, Varis_istasyon, parseFloat(Ucret), Tarih]
        );
        res.redirect('/bilet?message=Ticket added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Bilet WHERE BiletID = ?', [req.params.id]);
        const [stations] = await pool.execute('SELECT DISTINCT Baslangic_istasyon, Bitis_istasyon FROM Guzergah');
        
        if (rows.length > 0) {
            // Format date for HTML date input
            rows[0].Tarih = rows[0].Tarih.toISOString().split('T')[0];
            res.render('bilet/edit', { 
                ticket: rows[0],
                stations 
            });
        } else {
            res.redirect('/bilet?message=Ticket not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update ticket
router.post('/edit/:id', async (req, res) => {
    const { Yolcu_adi, Kalkis_istasyon, Varis_istasyon, Ucret, Tarih } = req.body;
    const { id } = req.params;
    try {
        await pool.execute(
            'CALL update_bilet(?, ?, ?, ?, ?, ?)',
            [parseInt(id), Yolcu_adi, Kalkis_istasyon, Varis_istasyon, parseFloat(Ucret), Tarih]
        );
        res.redirect('/bilet?message=Ticket updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Delete ticket
router.post('/delete/:id', async (req, res) => {
    try {
        await pool.execute('CALL delete_bilet(?)', [req.params.id]);
        res.redirect('/bilet?message=Ticket deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Search tickets - with live search
router.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    try {
        const [rows] = await pool.execute('CALL search_bilet(?)', [`%${searchTerm}%`]);
        
        // Handle both JSON and HTML responses
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json(rows[0]);
        } else {
            res.render('bilet/index', { 
                tickets: rows[0],
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