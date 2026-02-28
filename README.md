# CineMatch AI

Movie/series/anime recommendation demo using multiple recommendation approaches.

## Includes

- React + Vite frontend
- Flask backend API
- SQLite login/auth
- Content-Based, Collaborative, Hybrid, and Sequential recommendations
- LangGraph orchestration
- LlamaIndex + ChromaDB retrieval context
- Runtime animation before recommendations are displayed
- Animated dummy knowledge output cards for methods/strengths/weaknesses

## Project Structure

- `app.py` main Flask entry point (root-level)
- `backend/` data, recommenders, SQLite helpers, requirements
- `App.tsx`, `components/`, `services/` frontend app

## Run Backend

Prerequisites: Python 3.10+

1. `cd backend`
2. `python3 -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `cd ..`
6. `python3 app.py`

Backend URL: `http://localhost:5002`

When `dist/` exists (after `npm run build`), opening `http://localhost:5002` serves the frontend.

## Run Frontend

Prerequisites: Node.js 18+

1. `npm install`
2. Optional `.env.local`: `VITE_API_BASE_URL=http://localhost:5002`
3. `npm run dev`

Frontend URL (dev mode): `http://localhost:3000`

## SQLite Browser AppImage (Linux)

1. `chmod +x DB.Browser.for.SQLite-v3.13.1-x86.64-v2.AppImage`
2. `./DB.Browser.for.SQLite-v3.13.1-x86.64-v2.AppImage`
