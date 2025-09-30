const fs = require('fs');
const path = require('path');

const usePostgres = !!process.env.DATABASE_URL;
if (usePostgres) {
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect();
  module.exports = {
    initDb: async () => {},
    runQuery: (sql, params=[]) => client.query(sql, params).then(r=>r.rows),
    runExplain: (sql) => client.query('EXPLAIN ' + sql).then(r => r.rows)
  };
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbFile = path.join(__dirname, 'sample_db', 'demo.db');
  let db;
  function initDb() {
    if (!fs.existsSync(path.join(__dirname, 'sample_db'))) fs.mkdirSync(path.join(__dirname, 'sample_db'));
    const exists = fs.existsSync(dbFile);
    db = new sqlite3.Database(dbFile);
    if (!exists) {
      // create demo tables + seed
      db.serialize(() => {
        db.run(`CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT, signup_date TEXT)`);
        db.run(`CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, created_at TEXT)`);
        const stmt1 = db.prepare("INSERT INTO customers(name, signup_date) VALUES (?,?)");
        stmt1.run('Alice','2023-01-01'); stmt1.run('Bob','2023-02-15'); stmt1.finalize();
        const stmt2 = db.prepare("INSERT INTO orders(customer_id,amount,created_at) VALUES (?,?,?)");
        stmt2.run(1, 120.5, '2023-03-01'); stmt2.run(2, 15.99, '2023-03-05'); stmt2.finalize();
      });
    }
  }
  function runQuery(sql, params=[]) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  function runExplain(sql) {
    return new Promise((resolve, reject) => {
      db.all('EXPLAIN QUERY PLAN ' + sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  module.exports = { initDb, runQuery, runExplain };
}
