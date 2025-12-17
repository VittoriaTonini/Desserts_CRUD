//import
const express = require('express');
const bodyParser = require('body-parser');   
const cors = require('cors'); //CORS permette richieste dal browser su altre porte
const path = require('path');
const { sql, poolPromise } = require('./db'); //importiamo la connessione al DB creata in db.js

const app = express();

//middleware
app.use(cors());       
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); //per leggere i form

//serviamo frontend e folder immagini
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));

//operazioni CRUD

//GET tutti i dolci
app.get('/api/dolci', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Dolci');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET dolce per ID
app.get('/api/dolci/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Dolci WHERE id = @id');
    if (result.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Dolce non trovato' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


