## Phase 6: Groups + Channels

### Overview

Admin panel UI for managing channel settings, member permissions, and invite links.

### Permissions Editor

- Table/grid view: rows = members/roles, columns = permissions
- Toggle switch per permission per role
- Changes save immediately (or via "Save" button with confirmation)
- Visual indicator for inherited vs. custom permissions
- Preset roles: Owner, Admin, Member, Restricted (with customizable permission sets)

### Member Management

- Searchable member list
- Each member shows: avatar, name, role, join date
- Actions per member:
  - Assign/change role
  - Kick from channel
  - Ban from channel (with optional duration)
  - View profile
- Bulk actions: select multiple members for role change or kick

### Invite Links

- **Permanent link**: does not expire, can be revoked
- **Temporary link**: configurable expiry (1h, 1d, 7d, 30d, custom)
- **Usage limit**: optional max number of uses per link
- Link management table: link URL, created by, expiry, uses, status
- Revoke button per link
- Copy link button

### Channel Statistics

- Total member count
- Total message count
- Active members (last 7 days)
- Messages per day chart (simple sparkline or bar)

### Acceptance Criteria

- [ ] Permissions editor renders toggles for all permissions per role
- [ ] Permission changes enforced immediately in the channel
- [ ] Member list searchable with role assignment and kick/ban actions
- [ ] Permanent and temporary invite links can be created
- [ ] Invite links respect expiry and usage limits
- [ ] Expired/revoked links return appropriate error on use
- [ ] Channel stats display accurate counts
