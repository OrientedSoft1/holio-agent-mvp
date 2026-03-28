## Phase 5: AI Bot System

### Overview

Predefined bot templates that serve as starting points for creating company bots. Each template encapsulates a role with sensible defaults that are fully customizable after creation.

### BotTemplate Entity Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Template display name |
| `description` | string | What this bot does |
| `category` | enum | `finance` · `marketing` · `hr` · `support` · `devops` · `general` |
| `defaultSystemPrompt` | text | Pre-written system prompt |
| `defaultModelId` | string | Recommended Bedrock model |
| `defaultTools` | JSON | Pre-configured tool set |
| `iconUrl` | string | Template icon/illustration URL |
| `createdAt` | timestamp | |

### Seed Templates

1. **CFO Bot** — Financial analysis, budget tracking, expense insights. Model: Claude Sonnet.
2. **Marketing Bot** — Campaign ideas, copy writing, analytics summaries. Model: Claude Sonnet.
3. **HR Bot** — Policy Q&A, onboarding guidance, leave management. Model: Nova Pro.
4. **Support Bot** — Customer ticket triage, FAQ answers, escalation rules. Model: Claude Sonnet.
5. **DevOps Bot** — Incident summaries, deployment status, infra Q&A. Model: Llama 3.
6. **Custom Bot** — Blank slate with minimal defaults. Model: Claude Sonnet.

### API Endpoints

- `GET /api/bot-templates` — List all templates (public, no auth required)
- `GET /api/bot-templates/:templateId` — Get template details
- `POST /api/companies/:companyId/bots` — Create bot from template (pass `templateId` in body)

### Acceptance Criteria

- [ ] BotTemplate entity created with schema above
- [ ] Database seeded with all 6 templates on migration
- [ ] Templates listed via API endpoint
- [ ] Creating a bot with `templateId` pre-fills all default fields
- [ ] All template fields are overridable at creation time
- [ ] Template icons/illustrations included as static assets or URLs
