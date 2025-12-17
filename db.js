require('dotenv').config(); //import del pacchetto 'dotenv' e chiamiamo il metodo config() per caricare le variabili d'ambiente dal file .env nella proprietà process.env

const sql = require('mssql'); //import del pacchetto 'mssql', il driver per collegarsi a MS SQL Server

const config = {
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD,   
  server: process.env.DB_SERVER,       
  database: process.env.DB_NAME,       
  options: {
    encrypt: false,                    
    trustServerCertificate: true       
  }
};

const poolPromise = new sql.ConnectionPool(config) //creazione di un nuovo pool di connessioni con la configurazione
  .connect() // avvio della connessione al database
  .then(pool => {
    console.log('Connesso a MS SQL Server'); //se la connessione va a buon fine, stampa messaggio
    return pool; //ritorna il pool connesso, da usare nelle query
  })
  .catch(err => console.log('Errore connessione DB:', err)); //se c'è un errore nella connessione, stampa il messaggio di errore nel terminale

module.exports = { sql, poolPromise }; //export degli'oggetti sql e poolPromise, così altri file possono usarli
