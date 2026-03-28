# [P2] Company membership: invite, accept/decline, roles, permissions

**Phase:** 2 — Company System

## Description

Implement the full company membership lifecycle: inviting users, accepting/declining invitations, assigning roles, and enforcing granular permissions.

### Invitation Flow

1. Admin/owner invites by **phone number**, **email**, or generates an **invite link**.
2. Invited user receives a notification (or can open the link).
3. User accepts or declines the invitation.
4. On accept, a `CompanyMember` record is created with the default role (`member`).
5. Pending invitations expire after 7 days.

### Data Model — CompanyMember

- **companyId** — FK to company
- **userId** — FK to user
- **role** — enum: `owner`, `admin`, `member`, `guest`
- **permissions** — JSON object for granular overrides
- **joinedAt** — timestamp
- **invitedBy** — FK to inviting user

### Data Model — CompanyInvitation

- **companyId** — FK to company
- **inviteePhone / inviteeEmail** — contact info
- **inviteToken** — unique token for link-based invites
- **status** — enum: `pending`, `accepted`, `declined`, `expired`
- **expiresAt** — timestamp (default: 7 days from creation)

### Role Hierarchy & Default Permissions

| Capability | Owner | Admin | Member | Guest |
|------------|-------|-------|--------|-------|
| Delete company | ✅ | ❌ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ |
| Create channels | ✅ | ✅ | ✅ | ❌ |
| Send messages | ✅ | ✅ | ✅ | ✅ |
| View channels | ✅ | ✅ | ✅ | limited |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/companies/:id/invitations` | Invite a user |
| GET | `/companies/:id/invitations` | List pending invitations |
| POST | `/invitations/:token/accept` | Accept an invitation |
| POST | `/invitations/:token/decline` | Decline an invitation |
| GET | `/companies/:id/members` | List members |
| PATCH | `/companies/:id/members/:userId` | Update member role/permissions |
| DELETE | `/companies/:id/members/:userId` | Remove a member |

## Acceptance Criteria

- [ ] Invite by phone, email, and invite link all work
- [ ] Invited user can accept or decline
- [ ] Accepted invite creates CompanyMember with `member` role
- [ ] Pending invitations expire after 7 days
- [ ] Role-based access control enforced on all company endpoints
- [ ] Granular permissions JSON allows per-user overrides
- [ ] List members returns role and joined date
- [ ] Role updates restricted to owner/admin
- [ ] Member removal restricted to owner/admin (owner cannot be removed)
- [ ] Invite link is single-use or revocable
