## Phase 5: AI Bot System

### Overview

Async task queue for bot inference using Bull + Redis. Decouples message handling from model invocation, provides retry logic, and tracks task lifecycle.

### Architecture

```
@mention detected → BotTask created (status: queued) → Bull queue → Worker picks up
  → Invoke Bedrock (status: running) → Stream results via WebSocket
  → Save response (status: completed) | Retry on failure (status: failed)
```

### BotTask Entity Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `botId` | UUID | FK → Bot |
| `chatId` | UUID | FK → Chat |
| `triggerMessageId` | UUID | FK → Message that triggered the task |
| `status` | enum | `queued` · `running` · `completed` · `failed` |
| `input` | text | Input message/context sent to model |
| `output` | text | Generated response |
| `tokensUsed` | int | Total tokens (input + output) |
| `durationMs` | int | Processing time in milliseconds |
| `error` | text | Error message if failed |
| `attempts` | int | Number of attempts |
| `createdAt` | timestamp | |
| `completedAt` | timestamp | |

### Queue Configuration

- Queue name: `bot-inference`
- Redis connection: reuse existing Redis instance
- Concurrency: configurable per worker (default: 3)
- Retry strategy: 3 attempts with exponential backoff (1s, 5s, 15s)
- Job timeout: 60 seconds

### Worker Responsibilities

1. Dequeue task, set status to `running`
2. Load bot config (model, prompt, temperature, maxTokens)
3. Build conversation context from recent chat messages
4. Invoke Bedrock via `BedrockService` (see #25)
5. Stream chunks back to client via WebSocket
6. On completion: save output, update `tokensUsed`, `durationMs`, set status `completed`
7. On failure: log error, increment attempts, retry or set status `failed`

### Acceptance Criteria

- [ ] Bull queue processes bot tasks asynchronously
- [ ] BotTask entity tracks full lifecycle (queued → running → completed/failed)
- [ ] Worker invokes Bedrock and streams results back via WebSocket
- [ ] Failed tasks retried up to 3 times with exponential backoff
- [ ] Token usage and duration recorded on each task
- [ ] Queue dashboard accessible for monitoring (Bull Board or similar)
