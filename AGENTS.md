# Holio Agent MVP

## Project

Holio Agent is a corporate AI messaging platform combining Telegram's messaging UX with Slack's company workspace structure and an AI bot management layer powered by AWS Bedrock.

## Tech Stack

- **Backend:** NestJS 10, TypeORM 0.3, PostgreSQL 16, Socket.IO 4, Bull 4, AWS Bedrock SDK
- **Frontend:** React 18, Vite 5, Tailwind CSS 3, Zustand 4, React Query 5, Socket.IO Client 4
- **Infrastructure:** AWS (S3 for files, Bedrock for AI, RDS for PostgreSQL, ElastiCache for Redis)

## Conventions

### Backend (NestJS)

- All modules follow: `entity -> dto -> service -> controller -> module` pattern
- DTOs use `class-validator` decorators for validation
- Services handle business logic, controllers are thin
- Use `@CurrentUser()` custom decorator to get authenticated user
- Guard all endpoints with `JwtAuthGuard` unless explicitly public
- WebSocket events follow `domain:action` naming (e.g. `message:send`, `typing:start`)
- Error responses use NestJS `HttpException` with proper status codes

### Frontend (React)

- Components use PascalCase folder names with `index.tsx` barrel exports
- Pages in `src/pages/`, reusable components in `src/components/`
- State management: Zustand stores in `src/stores/`
- API calls: React Query hooks wrapping Axios client in `src/services/`
- Socket events handled via `src/services/socket.service.ts`

### Branding

- **App name:** "Holio Agent" (short: "Holio")
- **Never** reference "Telegram", "Slack", or "clone" in any user-facing text
- **Colors:** Orange `#FF9220`, Dark `#152022`, Lavender `#D1CBFB`, Sage `#C6D5BA`, Off-white `#FCFCF8`
- **Logo:** Bold uppercase "HOLIO" wordmark, heavy geometric sans-serif
- **Terminology:** Company = workspace, Bot = AI agent, Channel = company chat room

### Naming

- Database tables: snake_case plural (e.g. `company_members`)
- TypeORM entities: PascalCase singular (e.g. `CompanyMember`)
- API routes: kebab-case (e.g. `/companies/:id/members`)
- WebSocket events: camelCase with colon separator (e.g. `message:new`)
- Frontend files: PascalCase for components, camelCase for hooks/utils

## Testing

- Backend: Jest. Run with `cd backend && npm test`
- Frontend: Vitest. Run with `cd frontend && npm test`
- Linting: `npm run lint` in both backend/ and frontend/
- Always run lint before committing

## Git Workflow

- Default branch: `dev`
- Branch from `dev` for features: `feature/issue-number-short-description`
- PR back to `dev` when feature complete
- `dev` -> `staging` via PR for QA
- `staging` -> `main` via PR for production
- Conventional commits: `feat(module): description (#issue-number)`
- Prefixes: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`
