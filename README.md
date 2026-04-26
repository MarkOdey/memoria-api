# Memoria API

AI-powered biographical interview API built with Node.js, Express, MongoDB, and the Anthropic SDK.

## Setup

### Prerequisites
- Docker & Docker Compose
- An Anthropic API key

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY
```

### 2. Start with Docker Compose

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3300`.
MongoDB runs on port `27017` with a named volume (`mongo_data`).

### Development (without Docker)

```bash
npm install
# Make sure MongoDB is running locally and MONGODB_URI points to it
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
  - `generateQuestions(subjectId)` — reads existing answers, identifies thin topics, asks Claude to generate 5 targeted questions
  - `synthesizeStory(subjectId)` — synthesizes all answers into a flowing biographical narrative
- Questions are auto-generated when a subject is created and after each answer is submitted

## Biography Topics
`childhood` · `family` · `education` · `career` · `relationships` · `beliefs` · `achievements` · `challenges` · `legacy`
