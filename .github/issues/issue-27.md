## Phase 5: AI Bot System

### Overview

Enable bots to participate in chat channels. Users invite bots to a channel, @mention them to trigger inference, and receive streaming responses rendered in real-time.

### BotChatMember Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `botId` | UUID | FK → Bot |
| `chatId` | UUID | FK → Chat/Channel |
| `addedBy` | UUID | FK → User who invited the bot |
| `addedAt` | timestamp | |

### Invite Flow

1. User opens channel settings → "Add Bot" button
2. Shows list of company bots (from #24)
3. Select bot → creates `BotChatMember` record
4. Bot appears in member list with "Bot" badge

### @Mention Trigger

1. User types `@BotName` in a message and sends
2. Server detects @mention matching a `BotChatMember` in the chat
3. Creates a bot task (see #28) with the trigger message as input
4. Bot processes message context (conversation history) through Bedrock
5. Response streams back via WebSocket

### Bot Messages

- `senderType` field on Message entity: `user` | `bot`
- Bot messages include `botId` reference
- Distinct visual styling in the UI (see #31)

### Streaming Display

- WebSocket emits `bot:stream:start`, `bot:stream:chunk`, `bot:stream:end` events
- Client renders chunks incrementally in the chat
- Typing indicator shown during `bot:stream:start` until first chunk

### Acceptance Criteria

- [ ] Bots can be invited to and removed from channels
- [ ] @mention detection correctly identifies bot names
- [ ] Bot inference triggered on @mention
- [ ] Streaming response displays in real-time via WebSocket
- [ ] Bot messages stored with `senderType=bot` and rendered with distinct styling
- [ ] Bot appears in channel member list with badge
