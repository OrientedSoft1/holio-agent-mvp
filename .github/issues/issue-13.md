# [P3] WebSocket gateway: real-time messages, typing, presence

**Phase:** 3 — Core Chat + UI Shell

## Description

Implement a NestJS WebSocket gateway using Socket.IO to power real-time messaging, typing indicators, and online presence tracking.

### Connection Lifecycle

1. Client connects with JWT in auth handshake.
2. Server validates token, extracts userId, stores socket mapping in Redis.
3. Client auto-joins rooms for all active chats.
4. On disconnect, update last-seen timestamp and broadcast offline status.

### Events

#### Messages
| Event | Direction | Payload |
|-------|-----------|---------|
| `message:send` | Client → Server | `{ chatId, content, type, replyTo?, tempId }` |
| `message:new` | Server → Client | `{ message, chatId }` |
| `message:update` | Server → Client | `{ messageId, chatId, content, editedAt }` |
| `message:delete` | Server → Client | `{ messageId, chatId, deletedFor }` |

#### Typing
| Event | Direction | Payload |
|-------|-----------|---------|
| `typing:start` | Client → Server | `{ chatId }` |
| `typing:stop` | Client → Server | `{ chatId }` |
| `typing:update` | Server → Client | `{ chatId, userId, isTyping }` |

#### Presence
| Event | Direction | Payload |
|-------|-----------|---------|
| `presence:update` | Server → Client | `{ userId, status, lastSeen? }` |

### Room Management

- Each chat has a Socket.IO room named `chat:{chatId}`.
- Users join rooms on connection for all their active chats.
- Join/leave rooms dynamically when added/removed from chats.

### Redis Integration

- **Socket mapping**: `socket:{userId}` → set of socket IDs (multi-device).
- **Online status**: `online:{userId}` → TTL-based key.
- **Typing debounce**: auto-stop typing after 5 seconds of inactivity.

### Error Handling

- Invalid/expired JWT → disconnect with error event.
- Rate limiting: max 30 messages/minute per user.
- Reconnection: client auto-reconnects with exponential backoff.

## Acceptance Criteria

- [ ] WebSocket connection authenticates via JWT
- [ ] Messages delivered in real-time to all chat participants
- [ ] `message:send` persists message and broadcasts `message:new`
- [ ] Typing indicators show/hide correctly with 5s auto-timeout
- [ ] Online/offline status updates on connect/disconnect
- [ ] Multi-device support (user can be online from multiple clients)
- [ ] Room-based message routing (only chat members receive events)
- [ ] Rate limiting enforced (30 msg/min)
- [ ] Graceful reconnection handling
