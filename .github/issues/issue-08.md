# [P2] Company switcher UI in sidebar

**Phase:** 2 — Company System

## Description

Build a Slack-style company/workspace switcher in the left sidebar. Users who belong to multiple companies need a fast, always-visible way to switch between them.

### UI Components

#### Company Avatar Stack (sidebar top)
- Vertical stack of circular company avatars (logo or initials fallback).
- Active company highlighted with accent border.
- Click avatar to switch active company.
- Unread count badge (red dot or number) per company.

#### Company Switcher Dropdown
- Triggered by clicking the active company name/logo area.
- Lists all user's companies with logo, name, and unread count.
- "Add or join a company" action at the bottom.
- Keyboard navigable (arrow keys + enter).

#### CompanySelectPage
- Shown after login if user belongs to multiple companies.
- Grid/list of companies with logos and names.
- "Create new company" card.
- Redirect to main chat view after selection.

### Behavior

- Switching company updates the chat list, sidebar nav badges, and active context.
- Active company ID stored in local state and persisted (localStorage or URL).
- API requests scoped to the active company via header or query param.
- Unread counts fetched on load and updated in real-time via WebSocket.

## Acceptance Criteria

- [ ] Company avatar stack renders in sidebar with all user's companies
- [ ] Clicking an avatar switches the active company
- [ ] Chat list updates to show chats for the selected company
- [ ] Unread count badges visible per company
- [ ] CompanySelectPage shown after login for multi-company users
- [ ] "Create new company" option available
- [ ] Keyboard navigation works in the switcher
- [ ] Active company persists across page refreshes
