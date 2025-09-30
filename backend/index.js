const express = require('express');
const bodyParser = require('body-parser');
const Ollama = require('./ollama');
const { runQuery, runExplain, initDb } = require('./db');
const { parse } = require('node-sql-parser'); // npm i node-sql-parser
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 4000;

// init DB (creates demo sqlite if missing)
initDb();

function isSelectOnly(sql) {
  // basic safety: only allow single statement starting with SELECT
  const trimmed = sql.trim().toLowerCase();
  if (trimmed.split(';').filter(Boolean).length > 1) return false;
  return trimmed.startsWith('select');
}

function validateSql(sql) {
  if (!isSelectOnly(sql)) throw new Error('Only single SELECT queries are allowed (no DDL/DML).');
  // attempt parse
  try {
    const ast = parse(sql);
    // could further inspect AST to check for unsafe constructs
    return ast;
  } catch (e) {
    throw new Error('SQL parse error: ' + e.message);
  }
}

// endpoint to ask LLM to produce SQL
app.post('/api/suggest', async (req, res) => {
  try {
    const { prompt, model = process.env.OLLAMA_MODEL || 'qwen2.5:3b' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const system = `You are a SQL assistant for a SQLite/Postgres database. Output only JSON with keys: { "sql": "...", "params": [...], "explain": "short explanation" }. SQL must be a single SELECT statement. Do not output backticks or commentary. Use parameter placeholders ? for SQLite or $1/$2 for Postgres.`;

    const fullPrompt = `${system}\n\nUser request: ${prompt}\n\nSchema: Describe tables available: customers(id:int,name:text,signup_date:text), orders(id:int,customer_id:int,amount:real,created_at:text)\n\nReturn JSON only.`;

    const answer = await Ollama.generate({ model, prompt: fullPrompt });
    // try parse response as JSON
    let json;
    try {
      json = JSON.parse(answer.response.trim());
    } catch (e) {
      // fallback: return raw text
      return res.json({ raw: answer.response });
    }
    // validate returned SQL
    try {
      validateSql(json.sql);
    } catch (e) {
      return res.status(400).json({ error: 'LLM produced invalid or unsafe SQL: ' + e.message, llm: json });
    }
    res.json({ llm: json });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// execute SQL safely
app.post('/api/execute', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    if (!sql) return res.status(400).json({ error: 'sql required' });
    validateSql(sql);
    const rows = await runQuery(sql, params);
    res.json({ rows });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// explain / optimization hints
app.post('/api/explain', async (req, res) => {
  try {
    const { sql } = req.body;
    validateSql(sql);
    const plan = await runExplain(sql);
    // generate simple heuristics
    const hints = [];
    const planText = JSON.stringify(plan);
    if (/SCAN|SEQUENTIAL|seq scan|full table/.test(planText.toUpperCase())) {
      hints.push('Query plan indicates a full table scan. Consider adding an index on frequently filtered columns (e.g., customer_id).');
    }
    if (planText.length === 0) hints.push('No explain information found.');
    res.json({ plan, hints });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`SQL Copilot backend running on ${port}`));
