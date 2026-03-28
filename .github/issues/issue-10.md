# [P2] CompanySelectPage after login

**Phase:** 2 — Company System

## Description

After successful authentication, route the user to a company selection page where they can pick an existing company or create a new one. This is the bridge between auth and the main chat experience.

### Flow

1. User completes OTP verification (from Phase 1).
2. Backend returns JWT + list of user's companies.
3. **If 0 companies** → show "Create your first company" flow.
4. **If 1 company** → auto-select and redirect to chat view.
5. **If 2+ companies** → show CompanySelectPage.

### CompanySelectPage UI

- Header: "Choose a workspace" with Holio branding.
- Grid of company cards:
  - Company logo (or initials avatar).
  - Company name.
  - Member count.
  - Last active timestamp.
- "Create new company" card with `+` icon.
- Remember last selected company (localStorage).

### Create Company Flow (inline or modal)

1. Enter company name → auto-preview slug.
2. Optional: upload logo.
3. Optional: add description.
4. Submit → company created → redirect to main chat view.

### Routing Logic

- `/select-company` route, guarded by auth.
- After selection, store `activeCompanyId` and redirect to `/chat`.
- If token expired during selection, redirect back to login.

## Acceptance Criteria

- [ ] New users (0 companies) see "Create your first company" flow
- [ ] Users with 1 company are auto-redirected to chat
- [ ] Users with 2+ companies see the selection page
- [ ] Company cards show logo, name, member count
- [ ] "Create new company" flow works end-to-end
- [ ] Selection persists across sessions (localStorage)
- [ ] Redirect to `/chat` after selection with correct company context
- [ ] Auth guard prevents unauthenticated access
