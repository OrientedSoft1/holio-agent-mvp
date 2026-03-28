## Phase 8: Polish

### Overview

Emoji reactions on messages with a picker UI and animated display.

### Reaction Picker

- Trigger: hover over message shows reaction icon; click/long-press to open picker
- Quick reactions row: 6 most popular emoji (👍 ❤️ 😂 😮 😢 🙏)
- Full emoji picker accessible from the quick reaction bar
- Picker closes after selecting an emoji

### Reaction Behavior

- Select emoji → reaction added to the message
- Click own existing reaction → remove it (toggle)
- Click someone else's reaction emoji → add your reaction with that same emoji
- Multiple reactions per message allowed
- One reaction per emoji per user

### Reaction Display

- Reaction bar rendered below the message bubble
- Each reaction shows: emoji + count (e.g., "👍 3")
- Reactions ordered by count (most popular first)
- Hover over a reaction to see who reacted
- Animated entrance when a reaction is added (scale + bounce)

### Real-Time Updates

- Reactions synced via WebSocket events: `reaction:add`, `reaction:remove`
- Count updates in real-time without page refresh
- Animation plays on receiving new reactions from others

### Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `messageId` | UUID | FK → Message |
| `userId` | UUID | FK → User |
| `emoji` | string | Unicode emoji character |
| `createdAt` | timestamp | |

Unique constraint: (`messageId`, `userId`, `emoji`)

### Acceptance Criteria

- [ ] Reaction picker accessible on hover/long-press
- [ ] Quick reactions bar shows popular emoji
- [ ] Adding and removing reactions works in real-time
- [ ] Reaction counts accurate and update via WebSocket
- [ ] Animated display on reaction add (scale + bounce)
- [ ] Hover tooltip shows list of users who reacted
