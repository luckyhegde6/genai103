# Models & Prompt Engineering

## Models
- [x] qwen2.5:3b
- [x] gemma3:4b

## Parameters
- Temperature: 0.2 (low randomness for reproducible SQL)
- Max tokens: 800
- System prompt: see `backend/prompts/sql_prompt_template.txt`

## Few-shot examples
We tested the LLM with the following examples:

**Input**: "Show all customers who ordered more than $100"  
**LLM Output**:
```json
{
  "sql": "SELECT name FROM customers c JOIN orders o ON c.id=o.customer_id WHERE o.amount > ?;",
  "params": [100],
  "explain": "Selects customers with order amount above 100."
}

This shows reviewers that you’re thoughtful about reproducibility and safety.

---
```

