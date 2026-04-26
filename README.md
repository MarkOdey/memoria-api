# Memoria API

AI-powered biographical interview API built with Node.js, Express, MongoDB, and Ollama (local LLM).

## Setup

### Prerequisites
- Docker & Docker Compose
- [Ollama](https://ollama.com) installed and running on your host machine

### 1. Pull a model

```bash
ollama pull llama3.2
```

Any chat model works. `llama3.2` (3B) is fast; `llama3.1:8b` or `mistral` give better quality.

### 2. Configure environment

```bash
cp .env.example .env
# Edit OLLAMA_MODEL if you want a different model
```

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3300`.
MongoDB runs on port `27017` with a named volume (`mongo_data`).

The API container reaches Ollama via `host.docker.internal:11434`
(the `extra_hosts: host-gateway` entry in docker-compose handles Linux compatibility).

### Development (without Docker)

```bash
npm install
# Make sure MongoDB and Ollama are running locally
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/subjects` | Create a new subject |
| GET | `/subjects/:id` | Get subject info |
| GET | `/questions/:subjectId/next` | Get next unanswered question |
| POST | `/answers` | Submit an answer |
| GET | `/story/:subjectId` | Generate biography draft |
| POST | `/agent/generate-questions/:subjectId` | Manually trigger question generation |

### POST /subjects
```json
{ "name": "Jane Doe", "dob": "1950-03-15", "birthplace": "Dublin, Ireland" }
```

### POST /answers
```json
{ "questionId": "<id>", "subjectId": "<id>", "answeredBy": "Jane", "text": "I grew up in a small house near the sea..." }
```

## Architecture

- **Models**: `Subject`, `Question`, `Answer` (Mongoose)
- **Agent Service** (`src/services/agentService.js`):
  - `generateQuestions(subjectId)` — reads existing answers, identifies thin topics, asks the LLM to generate 5 targeted questions
  - `synthesizeStory(subjectId)` — synthesizes all answers into a flowing biographical narrative
- Questions are auto-generated when a subject is created and after each answer is submitted
- Uses Ollama's `format: 'json'` for reliable structured output on question generation

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | — | MongoDB connection string |
| `OLLAMA_HOST` | `http://host.docker.internal:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Model to use |
| `PORT` | `3300` | API port |

## Biography Topics
`childhood` · `family` · `education` · `career` · `relationships` · `beliefs` · `achievements` · `challenges` · `legacy`
