const { Pool } = require('pg');

let pool;

const createPool = () => {
  if (!pool) {
    pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

const getPool = () => {
  if (!pool) {
    return createPool();
  }
  return pool;
};

module.exports = { getPool, createPool };