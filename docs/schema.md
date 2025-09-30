# Demo Database Schema

**customers**
- id INTEGER PRIMARY KEY
- name TEXT
- signup_date TEXT

**orders**
- id INTEGER PRIMARY KEY
- customer_id INTEGER
- amount REAL
- created_at TEXT
