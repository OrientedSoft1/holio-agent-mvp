# [P2] Company settings page and admin panel

**Phase:** 2 — Company System

## Description

Build a frontend settings page for company admins to manage company details, permissions, and members.

### Settings Sections

#### General
- Edit company name (live slug preview).
- Upload / change logo (crop tool, drag-and-drop).
- Edit description.

#### Permissions
- Toggle **Allow cross-company chat** (`allowCrossCompany`).
- Toggle **Allow bots** (`allowBots`).
- Set **Max members** limit (number input with validation).

#### Members Management
- Searchable member list with avatar, name, role badge.
- Change member role via dropdown (owner/admin/member/guest).
- Remove member with confirmation dialog.
- View and revoke pending invitations.
- Invite new members (phone, email, or copy invite link).

### Access Control

- Only users with `owner` or `admin` role can access the settings page.
- Non-admins who navigate to the URL see a 403 / "Access Denied" screen.
- Owner-only actions (delete company, transfer ownership) gated separately.

### UX Details

- Auto-save on field blur or explicit "Save" button per section.
- Toast notifications on save success/failure.
- Unsaved changes warning on navigation away.

## Acceptance Criteria

- [ ] Settings page accessible only to admins and owners
- [ ] Non-admins see "Access Denied" when navigating to settings URL
- [ ] Company name, logo, and description editable and persisted
- [ ] Permission toggles update backend settings JSON
- [ ] Max members validation enforced (min 1, max plan limit)
- [ ] Member list displays with roles, searchable
- [ ] Role changes saved and enforced immediately
- [ ] Member removal works with confirmation
- [ ] Pending invitations visible and revocable
- [ ] Changes persist to backend on save
