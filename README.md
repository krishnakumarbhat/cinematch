# CineMatch AI

AI-powered movie, series, and anime recommendation engine using 4 ML algorithms.

## Architecture

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+, Flask |
| Auth | SQLite + token sessions |
| ML | scikit-learn (TF-IDF, Cosine, KNN, SVD) |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |

## Project Structure

```
cinematch/
├── 00_main.py                          ← Entry point (starts Flask on :5002)
├── .env                                ← Environment config
├── .gitignore
├── Dockerfile
├── requirements.txt                    ← Python dependencies
│
├── src/                                ← Backend source
│   ├── 01_AppFactory.py                ← Flask app creation (Factory pattern)
│   ├── 02_Routes.py                    ← All API endpoint definitions
│   ├── 03_AuthMiddleware.py            ← Token extraction & user resolution
│   ├── models/
│   │   └── Database.py                 ← Singleton SQLite manager
│   ├── data/
│   │   └── MovieDataset.py             ← Static movie catalog & user data
│   └── recommenders/
│       ├── TitleClassifier.py          ← Title normalization & matching
│       ├── ContentBasedRecommender.py  ← TF-IDF + Cosine + KNN
│       ├── CollaborativeRecommender.py ← User-User + Item-Item + SVD
│       ├── HybridRecommender.py        ← Weighted ensemble
│       ├── SequentialRecommender.py    ← Markov chain prediction
│       └── RecommendationPipeline.py   ← Orchestrator (calls all recommenders)
│
├── frontend/                           ← React/Vite frontend
│   ├── index.html
│   ├── App.tsx                         ← Main UI component
│   ├── types.ts                        ← TypeScript interfaces
│   ├── components/                     ← UI components
│   └── services/api.ts                 ← HTTP client for backend
│
├── tests/
│   └── test_recommenders.py            ← Unit tests (pytest)
│
├── scripts/
│   ├── setup.sh                        ← One-time env setup
│   ├── build.sh                        ← Frontend production build
│   ├── run.sh                          ← Start backend server
│   └── test.sh                         ← Isolated backend test runner
│
└── docs/
    ├── README.md                       ← This file
    ├── flow_diagram.drawio             ← Execution flow
    ├── hld.drawio                      ← High-Level Design
    ├── lld.drawio                      ← Low-Level Design
    └── uml.drawio                      ← UML class diagram
```

## Execution Flow

```
00_main.py
    │
    ▼
01_AppFactory.py ──→ create_app()
    │                   │
    │                   ├─ Database.init()
    │                   └─ register_routes()
    ▼
02_Routes.py ──→ POST /api/recommend
    │               │
    │               ├─ 03_AuthMiddleware.resolve_user()
    │               │
    │               └─ RecommendationPipeline.run()
    │                       │
    │                       ├─ TitleClassifier.classify()
    │                       ├─ ContentBasedRecommender.recommend()
    │                       ├─ CollaborativeRecommender.recommend()
    │                       ├─ SequentialRecommender.recommend()
    │                       ├─ HybridRecommender.recommend()
    │                       └─ _build_retrieval_context()
    ▼
Response JSON → Frontend renders recommendation cards
```

## Setup

### Quick Start

```bash
chmod +x scripts/*.sh
./scripts/setup.sh     # Install deps + build frontend
./scripts/test.sh      # Run backend tests
./scripts/run.sh       # Start server on http://localhost:5002
```

### Manual

```bash
# Backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend && npm install && npm run build && cd ..

# Run
python 00_main.py
```

### Development

```bash
# Terminal 1: Backend
python 00_main.py

# Terminal 2: Frontend dev server (hot reload on :3000, proxies API to :5002)
cd frontend && npm run dev
```

### Tests

```bash
./scripts/test.sh
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user `{username, password}` |
| POST | `/api/auth/login` | Login → `{token, user}` |
| POST | `/api/recommend` | Get recommendations `{watched_titles: [...]}` |

## Recommendation Algorithms

1. **Content-Based** — TF-IDF vectorizes movie metadata; cosine similarity + KNN find nearest matches to your taste profile.
2. **Collaborative** — User-User and Item-Item cosine similarity combined with SVD matrix factorization for latent factor discovery.
3. **Hybrid** — 50/50 weighted blend of content-based and collaborative scores.
4. **Sequential** — Markov chain model predicts your next watch based on transition probabilities from viewing sequences.

## Design Patterns

| Pattern | Usage |
|---------|-------|
| Factory | `01_AppFactory.create_app()` — creates configured Flask instance |
| Singleton | `Database` — single shared SQLite connection manager |
| Pipeline/Chain | `RecommendationPipeline.run()` — orchestrates classify → recommend → blend → summarize |
| Strategy | Each recommender implements `.recommend()` independently |

## License

MIT
