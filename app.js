const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const personalRoutes = require('./routes/personel');
const trenlerRoutes = require('./routes/Trenler');
const guzergahRoutes = require('./routes/guzergah');
const biletRoutes = require('./routes/bilet');

app.use('/guzergah', guzergahRoutes);
app.use('/Trenler', trenlerRoutes);
app.use('/personel', personalRoutes)
app.use('/bilet', biletRoutes);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aa777923',
    database: 'metroStationdb'
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});


app.get('/', (req, res) => {
  const tables = [
    { name: 'Personel', description: '.' },
    { name: 'Trenler', description: '.' },
    { name: 'Guzergah', description: '.' },
    { name: 'Bilet', description: '.' }
  ];
  res.render('home', { tables });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});