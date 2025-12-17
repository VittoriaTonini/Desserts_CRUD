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

//POST: creare un dolce
app.post('/api/dolci', async (req, res) => {
  const { nome, descrizione, immagine } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nome', sql.NVarChar(100), nome)
      .input('descrizione', sql.NVarChar(255), descrizione)
      .input('immagine', sql.NVarChar(255), immagine)
      .query('INSERT INTO Dolci (nome, descrizione, immagine) VALUES (@nome, @descrizione, @immagine); SELECT SCOPE_IDENTITY() AS id');
    res.json({ success: true, id: result.recordset[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//PUT: aggiornare un dolce
app.put('/api/dolci/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descrizione, immagine } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nome', sql.NVarChar(100), nome)
      .input('descrizione', sql.NVarChar(255), descrizione)
      .input('immagine', sql.NVarChar(255), immagine)
      .query('UPDATE Dolci SET nome=@nome, descrizione=@descrizione, immagine=@immagine WHERE id=@id; SELECT @@ROWCOUNT AS count');

    if (result.recordset[0].count === 0)
      return res.status(404).json({ success: false, message: 'Dolce non trovato' });
    
    res.json({ success: true, message: 'Dolce aggiornato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//DELETE: eliminare un dolce
app.delete('/api/dolci/:id', async (req, res) => {
  const { id } = req.params; // Prendiamo l'id del dolce da eliminare

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Dolci WHERE id=@id; SELECT @@ROWCOUNT AS count');

    if (result.recordset[0].count === 0)
      return res.status(404).json({ success: false, message: 'Dolce non trovato' });

    res.json({ success: true, message: 'Dolce eliminato' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//avvio server
app.listen(3000);


