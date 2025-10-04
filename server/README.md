Alacard Sprint Server

Minimal Express server for the 3-hour Supabase sprint.

Endpoints

- POST `/api/match` create + run a match
- POST `/api/match/:share_id/score` store winner
- GET  `/api/match/:share_id` fetch match
- GET  `/api/notebook?hf_model=org/name&task=chat` generate runnable notebook

Run locally

1) Copy env

   - Use `alacard/.env.example` or set:
     - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (optional)
     - `OPENAI_API_KEY` (optional, for OpenAI models)
     - `HF_API_TOKEN` or `HUGGING_FACE_API_KEY` (optional, for HF README + Inference API)

2) Install and start

   npm install
   npm start --prefix server

SQL (Supabase)

- Apply `sql/matches.sql` in your Supabase project.

Quick tests

- Create and run:

  curl -s -X POST localhost:3000/api/match \
    -H 'content-type: application/json' \
    -d '{"model_a":"openai:gpt-4o-mini","model_b":"hf:meta-llama/Llama-3.1-8B-Instruct","system_prompt":"Helpful assistant; answer concisely.","prompts":["Explain RAG in one paragraph for a PM.","Write a JSON schema for a blog post.","List 3 LLM eval risks with mitigations."]}' | jq

- Generate notebook:

  curl -s "localhost:3000/api/notebook?hf_model=meta-llama/Llama-3.1-8B-Instruct" -o llama.ipynb

