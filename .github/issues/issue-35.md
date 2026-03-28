## Phase 6: Groups + Channels

### Overview

Show which members have read a message in small group chats. Read receipt records are retained for 7 days and then automatically cleaned up.

### ReadReceipt Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `messageId` | UUID | FK → Message |
| `userId` | UUID | FK → User who read the message |
| `readAt` | timestamp | When the message was read |

### Behavior

- When a user views a message, a `ReadReceipt` is created (or updated)
- On a sent message, show read count (e.g., "Read by 3")
- Tap/click the read count to see the list of readers with timestamps
- Only applies to small groups (configurable threshold, default ≤ 50 members)
- In larger groups/channels, read receipts are disabled for performance

### Privacy

- Respect individual user privacy settings for read receipts
- If a user has read receipts disabled, their reads are not recorded
- The user with disabled receipts also cannot see others' read status

### Auto-Cleanup

- Cron job runs daily
- Deletes `ReadReceipt` records older than 7 days
- Configurable retention period via environment variable

### Acceptance Criteria

- [ ] Read receipts recorded when users view messages in groups
- [ ] Read count displayed on sent messages
- [ ] Expandable viewer list shows who read and when
- [ ] Read receipts disabled for groups exceeding member threshold
- [ ] Individual privacy settings respected (opt-out honored)
- [ ] Auto-cleanup cron deletes records older than 7 days
