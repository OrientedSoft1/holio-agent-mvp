# [P3] Chat list: avatar, name, last message, time, unread, pinned, muted

**Phase:** 3 — Core Chat + UI Shell

## Description

Build the chat list panel that displays all of a user's conversations, sorted and decorated with real-time metadata.

### Chat List Item Layout

```
┌─────────────────────────────────────────┐
│ [Avatar]  Chat Name            2:34 PM  │
│           Last message preview   (3) 📌 │
└─────────────────────────────────────────┘
```

- **Avatar**: user photo (DM), group icon, or channel icon.
- **Chat name**: contact name (DM), group/channel name.
- **Last message preview**: truncated, prefixed with sender name for groups.
- **Timestamp**: relative time (just now, 2:34 PM, Yesterday, Mon, Jan 5).
- **Unread count badge**: red circle with number, hidden when 0.
- **Pin indicator**: 📌 icon for pinned chats.
- **Muted icon**: 🔇 for muted chats (no sound, badge still visible).
- **Online dot**: green dot on avatar for online DM contacts.

### Sorting Rules

1. Pinned chats at top (sorted by pin order).
2. Remaining chats sorted by `lastMessageAt` descending.
3. Muted chats sort normally but have subdued styling.

### Real-time Updates

- New messages update last message preview, timestamp, and unread count.
- Chat reorders in list when new message arrives.
- Online dot updates via presence WebSocket events.
- Typing indicator replaces last message preview: "*User is typing...*"

### Interactions

- Click → navigate to chat view.
- Right-click → context menu (pin, mute, archive, mark read, delete).
- Swipe left (mobile) → quick actions (pin, mute, delete).

### Performance

- Virtualized list for smooth scrolling with 100+ chats.
- Paginated loading (fetch 50 chats initially, load more on scroll).

## Acceptance Criteria

- [ ] Chat list displays all user's chats with avatar, name, last message, time
- [ ] Sorted by last message time with pinned chats at top
- [ ] Unread count badges accurate and update in real-time
- [ ] Pin indicator shown for pinned chats
- [ ] Muted icon shown for muted chats
- [ ] Online dot visible for DM contacts who are online
- [ ] Typing indicator replaces last message preview
- [ ] List reorders when new messages arrive
- [ ] Virtualized rendering for performance
- [ ] Context menu with pin, mute, archive, mark read, delete
