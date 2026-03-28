# [P3] Online/last-seen presence with privacy display

**Phase:** 3 — Core Chat + UI Shell

## Description

Track user online status via WebSocket connections and display privacy-aware last-seen labels in chat headers and contact info.

### Online Tracking

- User marked **online** when at least one WebSocket connection is active.
- User marked **offline** when all connections close (with 30s grace period for reconnects).
- `lastSeenAt` timestamp updated on disconnect.
- Stored in Redis for fast lookups: `presence:{userId}` → `{ status, lastSeenAt }`.

### Display Labels

| Condition | Label |
|-----------|-------|
| Connected now | "online" |
| Last seen < 1 min ago | "last seen just now" |
| Last seen < 1 hour ago | "last seen X minutes ago" |
| Last seen < 24 hours ago | "last seen at HH:MM" |
| Last seen 1–3 days ago | "last seen recently" |
| Last seen 3–7 days ago | "last seen within a week" |
| Last seen 7–30 days ago | "last seen within a month" |
| Last seen > 30 days ago | "last seen a long time ago" |

### Privacy Settings

Users control who can see their last-seen status:

- **Everybody** — all users see exact status.
- **My Contacts** — only mutual contacts see exact status; others see approximate.
- **Nobody** — no one sees last-seen; only "online" shown if currently active.
- **Exceptions** — always allow / never allow specific users (overrides above).

### Display in UI

- **Chat header**: "online" or last-seen label below contact name.
- **Contact info panel**: same label with more detail.
- **Chat list**: green dot on avatar when online (DMs only).

### Mutual Rule

If User A hides their last-seen from User B, then User A also cannot see User B's last-seen (Telegram-style mutual restriction).

## Acceptance Criteria

- [ ] Online status updates when user connects/disconnects via WebSocket
- [ ] 30-second grace period prevents flapping on brief disconnects
- [ ] Last-seen labels display correctly for all time ranges
- [ ] Privacy setting (everybody/contacts/nobody) respected
- [ ] Exception lists (always allow / never allow) override base setting
- [ ] Mutual rule enforced: hiding your status hides others' from you
- [ ] Status displayed in chat header and contact info
- [ ] Green online dot shown on DM avatars in chat list
