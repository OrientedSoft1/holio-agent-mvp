# [P2] Company CRUD: create, update, delete workspace

**Phase:** 2 — Company System

## Description

Implement full CRUD operations for company/workspace management. A company is the top-level organizational unit in Holio, equivalent to a Slack workspace.

### Data Model

- **name** — display name (required, 2–100 chars)
- **slug** — URL-friendly identifier, auto-generated from name, must be unique
- **logo** — uploaded image (S3 key or URL)
- **description** — optional free-text (max 500 chars)
- **settings** — JSON object:
  - `allowCrossCompany` (boolean, default `false`)
  - `allowBots` (boolean, default `true`)
  - `maxMembers` (number, default `100`)
- **createdBy** — reference to the creating user
- **createdAt / updatedAt** — timestamps

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/companies` | Create a new company |
| GET | `/companies/:id` | Get company by ID |
| GET | `/companies/slug/:slug` | Get company by slug |
| PATCH | `/companies/:id` | Update company details/settings |
| DELETE | `/companies/:id` | Soft-delete company (owner only) |

### Business Rules

- Slug is auto-generated from name using `slugify` (lowercase, hyphens, no special chars).
- If slug already exists, append incremental suffix (`-1`, `-2`, …).
- Logo upload accepts JPEG/PNG/WebP, max 5 MB, resized to 256×256.
- The creating user is automatically assigned the `owner` role.
- Settings are stored as a JSONB column and validated against a schema.
- Soft-delete sets a `deletedAt` timestamp; data retained for 30 days.

## Acceptance Criteria

- [ ] `POST /companies` creates a company and returns it with generated slug
- [ ] `GET /companies/:id` returns company details including settings
- [ ] `GET /companies/slug/:slug` resolves company by slug
- [ ] `PATCH /companies/:id` updates name, description, logo, and settings
- [ ] `DELETE /companies/:id` soft-deletes (owner only, 403 for others)
- [ ] Slug auto-generated from name, uniqueness enforced
- [ ] Settings stored as JSON, validated on write
- [ ] Logo upload works with supported formats and size limit
- [ ] Creating user assigned owner role automatically
