// test-db.js (temporal)
import db from './src/db/index.js';
(async () => {
  try {
    const rows = await db.query('SELECT 1 FROM RDB$DATABASE', []);
    console.log('DB OK, rows:', rows);
  } catch (e) {
    console.error('DB ERROR:', e);
  } finally {
    process.exit();
  }
})();