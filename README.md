# genai103
SQL Copilot for Local Databases  Pitch: A local AI assistant that translates natural language queries into optimized SQL for your SQLite/Postgres DB and explains the results.


# SQL Copilot (Local) — genai103

A local AI assistant that translates natural language to safe SQL, executes it on local SQLite/Postgres DB, and visualizes results.

## Highlights
- Uses local Ollama LLM (qwen2.5:3b / gemma3:4b) to generate SQL.
- Executes SELECT queries safely with parameterization.
- Shows EXPLAIN plan and optimization hints.
- React frontend with charts & tables.

## Prereqs
- Node 18+
- Docker Desktop
- npm
- Ollama installed & `ollama serve` running (default API port `11434`) and models pulled:
  - `qwen2.5:3b`
  - `gemma3:4b`
- (Optional) Postgres if you want to use `DATABASE_URL` instead of SQLite.

Docs about Ollama local API: https://ollama.com/docs and guides.

## Quickstart (local SQLite demo)
### 1. Clone repo
```bash
git clone https://github.com/luckyhegde6/genai103.git
cd genai103
```
### 2. Install backend deps & start server
```bash
cd backend
npm install
node index.js
# backend runs on http://localhost:4000
```
### 3. Install frontend deps & run
```bash
cd ../frontend
npm install
npm run dev
# open http://localhost:5173
```
### 4. Make queries in the UI. Example: Show total order amount per customer for March 2023.

## Using Postgres

### Set environment:

```bash
export DATABASE_URL="postgres://user:pass@localhost:5432/mydb"
cd backend
npm install
node index.js
```

The backend will use Postgres if `DATABASE_URL` is present.

## Docker Setup

For a streamlined development experience, we recommend using Docker.

1.  **Build the Docker Compose Project:**

    ```bash
    cd genai103
    docker-compose -f docker/docker-compose.yml up -d
    ```
    This command will build and run all the services defined in the `docker-compose.yml` file.

## Troubleshooting

1.  `demo.db` (seed with demo tables + rows)

Your backend already checks if `sample_db/demo.db` exists, and if not it creates + seeds it.

But if the file is already present and empty (0 bytes), SQLite won’t trigger table creation.

Fix: Delete the empty file and let the backend recreate it:

```bash
cd backend/sample_db
rm demo.db
cd ..
node index.js
```

It will run `CREATE TABLE customers`, `CREATE TABLE orders`, and insert Alice/Bob with some orders. Then you’ll have a small but working dataset.

If you want to ship a prebuilt DB in your repo so people don’t need to bootstrap:

Run `sqlite3 demo.db` and paste:

```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT, signup_date TEXT);
INSERT INTO customers(name, signup_date) VALUES ('Alice','2023-01-01'), ('Bob','2023-02-15');

CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, created_at TEXT);
INSERT INTO orders(customer_id, amount, created_at) VALUES
(1, 120.5, '2023-03-01'),
(2, 15.99, '2023-03-05');
```

Then exit and the `demo.db` will have the tables + rows.

## Security notes

  -  This demo purposely restricts execution to SELECT-only queries.

   - Do not point this demo at production DBs without adding auth, rate-limiting, and more robust validation.

## Demo

![SQL Copilot Demo](docs/demo.gif)

The animation shows:
1. User types: *“Show total order amount per customer for March 2023”*
2. LLM produces SQL
3. Copilot executes query & shows table + chart

##  Changing Docker Images (Optional)

You can customize the LLM used by setting environment variables in your .env file. For example:

`MODEL=mistralai/Mistral-7B-Instruct-v0.1`
