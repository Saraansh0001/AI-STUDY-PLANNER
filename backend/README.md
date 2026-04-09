# AI Study Buddy Backend (Phase 1)

<p align="center">
  <b>Node.js environment API for step-based study tasks, scoring, and episode flow simulation.</b>
</p>

<p align="center">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5.2.1-000000?logo=express" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7.7.0-2D3748?logo=prisma" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Phase%201%20Complete-0ea5e9" />
</p>

---

## 1. Project Title

AI Study Buddy Backend

---

## 2. Project Description

This backend is a lightweight Express API that simulates an OpenEnv-style task environment for an AI study workflow.

It exposes step-based endpoints to:

- reset an environment session,
- fetch current environment state,
- submit an action for the current task,
- receive reward/transition feedback based on grader logic.

The current implementation is a simulation environment (task engine + scorer), not a full production backend with user auth, persistent API services, or complete DB logging.

---

## 3. Phase 1 Scope (Completed)

Phase 1 backend scope implemented:

- Express server bootstrap and JSON API middleware.
- Environment lifecycle endpoints: state, reset, step.
- Input validation with Zod for action payloads.
- Multi-task environment flow:
  - summarize
  - quiz_gen
  - answer_query
- Heuristic reward grader for each task type.
- Step loop protection with max step cap and penalty.
- Environment metadata via OpenEnv-style YAML descriptor.
- Prisma schema prepared for trajectory and PDF metadata storage.
- Baseline script for running an agent loop against API (OpenAI or mock responses).
- Dockerfile for containerized backend startup.

---

## 4. Features Implemented (Current)

### API Endpoints

- GET /state
  - Returns current observation, reward, done flag, and task info.
- POST /reset
  - Resets environment to first task and step 0.
- POST /step
  - Accepts action payload, validates schema, scores output, transitions environment.

### Environment Logic

- Task sequence is fixed in memory.
- Each task has an observation and expected context.
- Reward threshold for task pass is 0.6.
- Maximum steps per task is 3.
- Penalty applied for repeated low-quality attempts.

### Grading Behavior

- Summarization:
  - basic heuristic around non-empty and relative response length.
- Quiz generation:
  - expects JSON/array-like structure and rewards 3-question format.
- Query answering:
  - rewards keyword overlap with expected context.

### Baseline Agent Runner

- script file: scripts/baseline.js
- Supports:
  - OpenAI chat completion path when OPENAI_API_KEY is set.
  - mock response path when API key is absent.
- Runs a full environment episode until done=true.

---

## 5. Tech Stack

### Runtime

- Node.js
- Express 5
- CommonJS modules

### Validation and Logic

- Zod for request schema validation

### AI Client / Baseline Utilities

- OpenAI SDK (used by baseline script)

### Data Layer Preparation

- Prisma ORM
- SQLite datasource in Prisma schema

### DevOps

- Docker (Node 18 Alpine image)
- dotenv for environment configuration

---

## 6. Folder Structure Explanation

```text
backend/
|-- src/
|   |-- server.js                 # Express app bootstrap and route mounting
|   |-- routes/
|   |   |-- api.js               # /state, /reset, /step endpoint handlers
|   |-- env/
|       |-- logic.js             # Task engine, progression, rewards, done state
|       |-- grader.js            # Heuristic scoring functions per task
|       |-- schemas.js           # Zod schemas for observation/action/reward
|
|-- prisma/
|   |-- schema.prisma            # Prisma models: Trajectory, PDFMetadata
|
|-- scripts/
|   |-- baseline.js              # API-driving baseline agent loop
|
|-- prisma.config.ts             # Prisma config using DATABASE_URL env var
|-- openenv.yaml                 # OpenEnv-like task + endpoint metadata
|-- Dockerfile                   # Container build/start definition
|-- package.json                 # Dependencies and scripts
|-- package-lock.json            # Locked dependency graph
|-- .gitignore                   # Ignore rules
|-- .env                         # Local environment variables (not committed)
```

---

## 7. How It Works (High-Level)

1. Server starts from src/server.js and mounts API routes.
2. EnvLogic initializes in memory with predefined tasks.
3. Client calls POST /reset to start episode.
4. Client calls GET /state to inspect current observation.
5. Client sends POST /step with action payload:
   - task
   - response
6. API validates request with ActionSchema.
7. Grader evaluates response quality and returns score.
8. Environment updates step counters and task index.
9. Response includes next observation, reward, done status, and grader info.

---

## 8. Setup & Installation Instructions

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Run Backend

```bash
npm start
```

Default URL:

- http://localhost:3000

### Optional: Run with Docker

```bash
docker build -t ai-study-buddy-backend .
docker run -p 3000:3000 ai-study-buddy-backend
```

---

## 9. Usage Instructions

### Manual API Flow

1. Reset:

```bash
curl -X POST http://localhost:3000/reset
```

2. Check state:

```bash
curl http://localhost:3000/state
```

3. Submit step:

```bash
curl -X POST http://localhost:3000/step \
  -H "Content-Type: application/json" \
  -d '{"task":"summarize","response":"Reinforcement learning is a machine learning paradigm where agents learn via reward."}'
```

### Baseline Script

Run episode loop against local server:

```bash
node scripts/baseline.js
```

Behavior:

- Uses OpenAI response generation when OPENAI_API_KEY is provided.
- Falls back to mock responses when key is missing.

---

## 10. Screenshots

No backend screenshots are included in repository currently.

Placeholder suggestions:

- docs/screenshots/backend-state-response.png
- docs/screenshots/backend-step-response.png
- docs/screenshots/backend-baseline-run.png

---

## 11. Known Issues / Limitations (Observed)

- Data persistence is not active in API flow (DB logging is explicitly skipped in routes).
- Session handling is minimal (single in-memory environment instance).
- sessionId is defined but currently unused in route logic.
- No authentication, authorization, rate limiting, or API security middleware.
- No automated tests configured.
- Prisma is present but not wired into active request pipeline in Phase 1.
- server.log and .env exist locally; operational hygiene may need cleanup before production.

---

## 12. Future Scope (Post-Phase 1)

- Persist trajectories/actions/rewards to database via Prisma client.
- Multi-session environment support (per user/session isolation).
- Proper auth and API security controls.
- Better reward models and richer rubric-based grading.
- Production logging, monitoring, and test coverage.
- Full OpenEnv compatibility and external agent integrations.

---

## 13. Contributors

Contributor metadata is not declared in package metadata in this folder.

Suggested format:

- Name - Backend engineering
- Name - Environment/grading logic

---

## NPM Scripts

- npm start
  - Starts Express server on PORT or 3000.
- npm test
  - Placeholder script (currently exits with error).
