# [P3] Tick system: sent, delivered, read indicators

**Phase:** 3 — Core Chat + UI Shell

## Description

Implement Telegram-style message status indicators (tick/checkmark system) to give users clear feedback on message delivery and read state.

### Tick States

| State | Visual | Meaning |
|-------|--------|---------|
| Pending | 🕐 clock icon | Message queued locally, not yet sent |
| Sent | ✓ single tick | Message received by server |
| Delivered | ✓✓ double tick (grey) | Message delivered to recipient's device |
| Read | ✓✓ double tick (colored) | Message opened/viewed by recipient |

### ReadReceipt Entity

- **messageId** — FK to message
- **userId** — FK to user who read
- **readAt** — timestamp

### Behavior

#### DMs
- Single tick → message saved to DB.
- Double tick → recipient's device received via WebSocket.
- Colored double tick → recipient opened the chat (readAt recorded).

#### Groups / Channels
- Single tick → saved to DB.
- Double tick → delivered to at least one member.
- Colored tick → read by at least one member.
- Read receipts stored for 7 days, then pruned.

### Privacy

- Users can toggle "Read Receipts" off in privacy settings.
- When off: sender never sees colored ticks for that user's reads.
- When off: user also cannot see others' read status (mutual).
- ReadReceipt records still created (for group counts) but not exposed.

### Real-time Updates

- Tick state transitions delivered via WebSocket events:
  - `message:delivered` — `{ messageId, chatId }`
  - `message:read` — `{ messageId, chatId, userId }`
- Client updates tick icon without full message refetch.

## Acceptance Criteria

- [ ] Pending clock icon shown while message is being sent
- [ ] Single tick appears after server confirms receipt
- [ ] Double grey tick appears when delivered to recipient
- [ ] Colored double tick appears when message is read
- [ ] Read receipts respect user's privacy toggle
- [ ] Group read receipts show delivery/read to at least one member
- [ ] Tick transitions update in real-time via WebSocket
- [ ] ReadReceipt records pruned after 7 days for groups
- [ ] Mutual privacy: disabling read receipts hides others' status too
