## Phase 5: AI Bot System

### Overview

Admin-visible audit log of all bot inference tasks. Provides visibility into token usage, performance, costs, and bot behavior for company administrators.

### Audit Data (from BotTask)

Each audit entry includes:
- **Bot info**: bot name, bot type
- **Task info**: trigger message, input context, full output response
- **Model info**: model ID used for inference
- **Performance**: duration in milliseconds
- **Usage**: input tokens, output tokens, total tokens
- **Cost estimate**: calculated from token count × model pricing
- **Status**: completed / failed (with error details)
- **Timestamp**: when the task was created and completed

### API Endpoints

- `GET /api/companies/:companyId/bot-tasks` — List tasks with pagination
  - Query params: `botId`, `status`, `dateFrom`, `dateTo`, `page`, `limit`
- `GET /api/companies/:companyId/bot-tasks/:taskId` — Full task detail (including input/output)
- `GET /api/companies/:companyId/bot-tasks/stats` — Aggregated stats (total tokens, total cost, task counts by status)

### Filters

- By bot (select specific bot)
- By date range (from/to)
- By status (completed, failed, all)
- By model (filter by model family)

### Company Admin Dashboard View

- Summary cards: total tasks, total tokens, estimated cost, avg response time
- Table of recent tasks with sortable columns
- Click row to expand full input/output
- Export to CSV option

### Acceptance Criteria

- [ ] All bot tasks logged automatically (no additional writes needed — uses BotTask entity)
- [ ] Admin API endpoints return filtered, paginated task history
- [ ] Stats endpoint returns aggregated usage metrics
- [ ] Company admins can view and filter full task history
- [ ] Non-admin users cannot access audit endpoints
- [ ] Cost estimates calculated based on model pricing
