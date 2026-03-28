## Phase 5: AI Bot System

### Overview

Bot entity and full CRUD API for creating, configuring, and managing AI bots within a company. Bots are created from templates and fully customizable.

### Bot Entity Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `companyId` | UUID | FK → Company (scoping) |
| `name` | string | Display name |
| `avatarUrl` | string | Bot avatar image URL |
| `description` | string | Short description of bot purpose |
| `type` | enum | `cfo` · `marketing` · `hr` · `support` · `devops` · `custom` |
| `systemPrompt` | text | System prompt sent to the model |
| `modelId` | string | Bedrock model identifier |
| `temperature` | float | Sampling temperature (0–1) |
| `maxTokens` | int | Max response tokens |
| `knowledgeBaseId` | UUID | Optional FK → KnowledgeBase for RAG |
| `tools` | JSON | Array of enabled tool definitions |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### CRUD Endpoints

- `POST /api/companies/:companyId/bots` — Create bot (from template or scratch)
- `GET /api/companies/:companyId/bots` — List company bots
- `GET /api/companies/:companyId/bots/:botId` — Get bot details
- `PATCH /api/companies/:companyId/bots/:botId` — Update bot config
- `DELETE /api/companies/:companyId/bots/:botId` — Delete bot

All endpoints scoped to `companyId`. Only company admins can create, update, or delete bots.

### Access Control

- Company admins: full CRUD
- Company members: read-only (list, view)
- Other companies: no access

### Acceptance Criteria

- [ ] Bot entity created with all fields in the schema
- [ ] CRUD endpoints functional and tested
- [ ] Bots scoped to company — no cross-company access
- [ ] Only company admins can create, update, or delete bots
- [ ] Validation on all fields (e.g., temperature range, valid modelId)
- [ ] Bot creation from template pre-fills fields (see #26)
