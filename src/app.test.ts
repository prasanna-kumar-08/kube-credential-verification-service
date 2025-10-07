import request from 'supertest';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { app } from './app';

let db: any;

beforeAll(async () => {
  db = await open({ filename: ':memory:', driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS credentials (id TEXT PRIMARY KEY, credential JSON NOT NULL, issuedAt TEXT NOT NULL)`);
  app.locals.db = db;

  // Insert sample credential for testing
  await db.run(
    'INSERT INTO credentials (id, credential, issuedAt) VALUES (?, ?, ?)',
    'test-123',
    JSON.stringify({ id: 'test-123', name: 'Test Credential' }),
    new Date().toISOString()
  );
});

afterAll(async () => {
  await db.close();
});

describe('POST /verify', () => {
  it('should return 200 and valid credential for existing ID', async () => {
    const res = await request(app).post('/verify').send({ id: 'test-123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Credential is valid');
    expect(res.body).toHaveProperty('issuedBy');
    expect(res.body).toHaveProperty('credentialId', 'test-123');
  });

  it('should return 404 for non-existing credential', async () => {
    const res = await request(app).post('/verify').send({ id: 'not-found' });
    expect(res.status).toBe(404);
  });

  it('should return 400 if id field missing', async () => {
    const res = await request(app).post('/verify').send({ name: 'No ID' });
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
