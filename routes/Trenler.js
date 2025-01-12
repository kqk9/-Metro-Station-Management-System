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

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('CALL get_trenler()');
        res.render('Trenler/index', { 
            Trenler: rows[0],
            message: req.query.message
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show add form
router.get('/add', (req, res) => {
    res.render('Trenler/add');
});

router.post('/add', async (req, res) => {
    const { Marka, Model, Kapasite } = req.body;
    console.log(Marka);
    
    try {
        await pool.execute(
            'CALL add_trenler(?, ?, ?)',
            [Marka, Model,  parseFloat(Kapasite)]
        );
        res.redirect('/Trenler?message=Tren added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Trenler WHERE TrenID = ?', [req.params.id]);
        res.render('Trenler/edit', { tren: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.post('/edit/:id', async (req, res) => {
    const { Marka, Model, Kapasite } = req.body;
    const { id } = req.params;
    try {
        await pool.execute(
            'CALL update_trenler(?, ?, ?, ?)',
            [parseInt(id), Marka, Model,  parseFloat(Kapasite)]
        );
        res.redirect('/Trenler?message=Personnel updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        await pool.execute('CALL delete_trenler(?)', [req.params.id]);
        res.redirect('/Trenler?message=Tren deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    try {
        const [rows] = await pool.execute('CALL search_trenler(?)', [`%${searchTerm}%`]);
        
        // Check if the request wants JSON
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json(rows[0]);
        } else {
            // Render the page for non-AJAX requests
            res.render('trenler/index', { 
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