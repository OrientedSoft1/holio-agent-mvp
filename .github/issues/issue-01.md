## Phase 1: Foundation + Phone Auth

### Description
Set up the NestJS backend project with:
- NestJS project initialization with TypeScript
- TypeORM configuration with PostgreSQL connection
- Module stubs for all domains: auth, users, contacts, companies, chats, messages, groups, bots, bot-worker, stories, uploads, reactions, search, notifications, gateway
- Basic project structure following entity -> dto -> service -> controller -> module pattern
- Environment configuration (.env) for DB, JWT secret, Twilio, AWS credentials
- CORS and validation pipe setup
- Swagger/OpenAPI documentation setup

### Acceptance Criteria
- [ ] `npm run start:dev` starts the server on port 3000
- [ ] All module stubs are created and registered in AppModule
- [ ] PostgreSQL connection works via TypeORM
- [ ] Swagger UI accessible at /api/docs
- [ ] Environment variables loaded from .env
