## Phase 6: Groups + Channels

### Overview

Company-scoped channels with a full admin permission system and slow mode for rate-limiting messages.

### Granular Permissions

Each channel member has a role with configurable permissions:

| Permission | Description |
|------------|-------------|
| `sendMessages` | Can send text messages |
| `sendMedia` | Can send photos, videos, files |
| `pinMessages` | Can pin/unpin messages |
| `addMembers` | Can add new members to channel |
| `banMembers` | Can ban/unban members |
| `manageAdmins` | Can promote/demote admins |
| `editMessages` | Can edit own messages (or all, if admin) |
| `deleteMessages` | Can delete own messages (or all, if admin) |

Roles hierarchy: **Owner** > **Admin** > **Member** > **Restricted**

### Slow Mode

- Configurable interval between messages per user
- Options: 10s, 30s, 1m, 5m, 15m, 30m, 1h
- Admins exempt from slow mode
- Countdown timer shown to users in the message input
- Setting stored on channel entity

### Channel Metadata

- `description` — channel purpose/topic
- `rules` — channel rules text (shown on join)
- `pinnedMessages` — ordered list of pinned messages
- Pin limit: configurable (default 50)

### Acceptance Criteria

- [ ] Permission system enforces all 8 permissions correctly
- [ ] Role hierarchy respected (owner > admin > member > restricted)
- [ ] Slow mode limits posting frequency per user
- [ ] Admins exempt from slow mode
- [ ] Countdown timer displays in UI when slow mode active
- [ ] Channel description, rules, and pinned messages functional
- [ ] Admin panel for managing permissions (see #34)
