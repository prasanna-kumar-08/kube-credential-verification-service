import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WORKER_ID = process.env.WORKER_ID || 'worker-1';

let db: sqlite3.Database;

// Initialize SQLite DB and table
async function initDB() {
  const dbConnection = await open({
    filename: './credentials.db',
    driver: sqlite3.Database
  });

  await dbConnection.exec(
    `CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      credential JSON NOT NULL,
      issuedAt TEXT NOT NULL
    )`
  );

  return dbConnection;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Verification endpoint
app.post('/verify', async (req, res) => {
  try {
    const credential = req.body;
    if (!credential.id) {
      return res.status(400).json({ message: 'Credential must have an id field' });
    }

    const existing = await db.get('SELECT * FROM credentials WHERE id = ?', credential.id);

    if (existing) {
      return res.status(200).json({
        message: 'Credential is valid',
        issuedBy: WORKER_ID,
        issuedAt: existing.issuedAt,
        credentialId: credential.id
      });
    } else {
      return res.status(404).json({ message: 'Credential not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

(async () => {
  db = await initDB();

  app.listen(PORT, () => {
    console.log(`Credential Verification Service running on port ${PORT}, worker: ${WORKER_ID}`);
  });
})();

export { app, initDB }; // Export for testing purposes
