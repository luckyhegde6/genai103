const request = require('supertest');
const app = require('../index'); // export app from index.js instead of app.listen()

describe('SQL safety', () => {
  it('rejects INSERT', async () => {
    const res = await request(app)
      .post('/api/execute')
      .send({ sql: 'INSERT INTO customers(name) VALUES ("Mallory")' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only single SELECT/);
  });

  it('accepts SELECT', async () => {
    const res = await request(app)
      .post('/api/execute')
      .send({ sql: 'SELECT * FROM customers LIMIT 1' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.rows)).toBe(true);
  });
});
