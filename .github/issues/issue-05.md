## Phase 1: Foundation + Phone Auth

### Description
Create all TypeORM entities for the core domain model:
- **User**: phone, countryCode, username, firstName, lastName, bio, avatarUrl, isOnline, lastSeen, twoFaHash, privacySettings (JSON)
- **Company**: name, slug, logoUrl, description, ownerId, settings (JSON), bedrockEndpoint, bedrockRegion
- **CompanyMember**: companyId, userId, role (owner/admin/member/guest), permissions (JSON), joinedAt, invitedBy
- **CompanyInvitation**: companyId, invitedByUserId, email, phone, token, role, status, expiresAt

All entities should have proper relations, indexes, and timestamps. Generate initial migration.

### Acceptance Criteria
- [ ] All 4 entities created with TypeORM decorators
- [ ] Relations properly defined (User <-> CompanyMember <-> Company)
- [ ] Initial migration generated and runs successfully
- [ ] Unique constraints on User.phone, User.username, Company.slug
- [ ] JSON columns for privacySettings and company settings
