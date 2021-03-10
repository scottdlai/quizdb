const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.HOST,
  port: process.env.PORT_DB,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

client.connect((err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }

  console.log('connects successfully');
});

module.exports = client;
