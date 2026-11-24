import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { initDb } from '../src/models/index.js';

test('GET /api/health întoarce ok', async () => {
  process.env.DB_STORAGE = ':memory:';
  await initDb();
  const server = createApp().listen(0);
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/api/health`);
  const body = await res.json();
  server.close();
  assert.equal(res.status, 200);
  assert.equal(body.status, 'ok');
});

test('rută inexistentă → 404 în format coerent', async () => {
  const server = createApp().listen(0);
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/api/nu-exista`);
  const body = await res.json();
  server.close();
  assert.equal(res.status, 404);
  assert.equal(body.error.code, 'NOT_FOUND');
});
