const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// An idle pooled client can error (Supabase pooler restart, network blip).
// Without a listener Node treats that 'error' event as uncaught and kills the
// whole API process; with one, the pool just discards the dead client.
pool.on('error', (err) => {
  console.error('Unexpected idle DB client error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  // Checked-out client for multi-statement transactions (BEGIN/COMMIT).
  // Caller MUST client.release() in a finally block.
  getClient: () => pool.connect(),
  pool
};
