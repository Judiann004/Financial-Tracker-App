const { Client } = require('pg');

const client = new Client({
  user: 'postgres', 
  host: 'localhost',
  database: 'Finance_Tracker_App', 
  password: 'Qwaszx34##', 
  port: 5432, // Default
});

client.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database!');

    if (client.connection && client.connection.authorized) {
      console.log('Connection is authorized and ready.');

      client.query('SELECT NOW()', (err, res) => {
        if (err) {
          console.error('Error executing query:', err.stack);
        } else {
          console.log('PostgreSQL server time:', res.rows[0].now);
        }
      });
    } else {
      console.error('Connection is not authorized or ready.');
    }

    client.end(() => {
      console.log('Disconnected from PostgreSQL database.');
    });
  }
});