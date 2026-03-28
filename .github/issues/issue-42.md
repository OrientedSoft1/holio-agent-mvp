## Phase 8: Polish

### Overview

Schedule messages for future delivery and bookmark messages to a personal "Saved Messages" chat.

### Scheduled Messages

- **Trigger**: long-press the send button → "Schedule Message" option
- Date/time picker for scheduling
- Scheduled messages show a clock icon in the chat (visible only to sender)
- Stored in `ScheduledMessage` entity until delivery time
- Cron job checks every minute for messages due to be sent
- On delivery: message sent as a normal message, `ScheduledMessage` record deleted
- Manage scheduled: view list of pending scheduled messages, edit or cancel

#### ScheduledMessage Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User (sender) |
| `chatId` | UUID | FK → Chat (target) |
| `content` | text | Message content |
| `attachments` | JSON | Optional attachments |
| `scheduledFor` | timestamp | Delivery time |
| `createdAt` | timestamp | |

### Saved Messages

- Dedicated "Saved Messages" chat pinned at the top of the chat list
- Forward any message to Saved Messages via message context menu → "Save"
- Saved messages retain original sender info, timestamp, and media
- Tag system for organizing saved messages:
  - Create custom tags (e.g., "Important", "Read Later", "Work")
  - Assign one or more tags to each saved message
  - Filter saved messages by tag
- Search within saved messages

### Acceptance Criteria

- [ ] Scheduled messages created via long-press send button
- [ ] Date/time picker functional with future-only validation
- [ ] Scheduled messages auto-sent at the configured time
- [ ] Pending scheduled messages viewable, editable, and cancellable
- [ ] Saved Messages chat accessible and pinned in chat list
- [ ] Any message can be forwarded to Saved Messages
- [ ] Tags can be created, assigned, and used to filter saved messages
