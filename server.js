// logica del backend

// import
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { sql, poolPromise } = require('./db');

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// GET tutti i dolci
app.get('/api/dolci', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Desserts');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('ERRORE GET /api/dolci:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET dolce per ID
app.get('/api/dolci/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Desserts WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Dolce non trovato' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error(`ERRORE GET /api/dolci/${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// POST: creare un dolce
app.post('/api/dolci', async (req, res) => {
  const { nome, descrizione, immagine } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nome', sql.NVarChar(100), nome)
      .input('descrizione', sql.NVarChar(255), descrizione)
      .input('immagine', sql.NVarChar(255), immagine)
      .query(`
        INSERT INTO Desserts (nome, descrizione, immagine)
        VALUES (@nome, @descrizione, @immagine);
        SELECT SCOPE_IDENTITY() AS id
      `);

    res.json({ success: true, id: result.recordset[0].id });
  } catch (err) {
    console.error('ERRORE POST /api/dolci:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT: aggiornare un dolce
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
      .query(`
        UPDATE Desserts
        SET nome=@nome, descrizione=@descrizione, immagine=@immagine
        WHERE id=@id;
        SELECT @@ROWCOUNT AS count
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({ success: false, message: 'Dolce non trovato' });
    }

    res.json({ success: true, message: 'Dolce aggiornato' });
  } catch (err) {
    console.error(`ERRORE PUT /api/dolci/${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: eliminare un dolce
app.delete('/api/dolci/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM Desserts WHERE id=@id;
        SELECT @@ROWCOUNT AS count
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({ success: false, message: 'Dolce non trovato' });
    }

    res.json({ success: true, message: 'Dolce eliminato' });
  } catch (err) {
    console.error(`ERRORE DELETE /api/dolci/${id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname))); // ok per ora


app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
});
