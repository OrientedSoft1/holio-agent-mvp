# [P3] Message actions: send, reply, forward, edit, delete, pin, copy, multi-select

**Phase:** 3 — Core Chat + UI Shell

## Description

Implement the full set of message actions matching Telegram's UX: send, reply, forward, edit, delete, pin, copy text, and multi-select for bulk operations.

### Actions

#### 1. Send
- Text input with Enter to send, Shift+Enter for newline.
- Support plain text (rich media in Phase 4).

#### 2. Reply
- Tap/click "Reply" on a message → quoted preview appears above composer.
- Reply shows original message snippet + sender name in the bubble.
- Click on reply preview scrolls to original message.

#### 3. Forward
- Select "Forward" → chat picker modal.
- Forward to one or multiple chats.
- Forwarded message shows "Forwarded from [Name]" label.

#### 4. Edit
- Edit own messages within 48 hours of sending.
- Composer switches to edit mode with existing text pre-filled.
- Edited messages display "(edited)" label with timestamp.

#### 5. Delete
- **Delete for me** — hides message locally.
- **Delete for everyone** — removes message for all participants (within 48h).
- Deleted-for-everyone shows "This message was deleted" placeholder.

#### 6. Pin
- Pin important messages to chat (admin/owner in channels).
- Pinned messages accessible via pin icon in chat header.
- Notification to chat members when a message is pinned.

#### 7. Copy Text
- Copy message text content to clipboard.
- Toast confirmation: "Copied to clipboard".

#### 8. Multi-select
- Long-press or checkbox mode to select multiple messages.
- Bulk actions: forward selected, delete selected, copy selected.
- Selection count shown in action bar.

### Context Menu

- **Desktop**: right-click on message → context menu with all available actions.
- **Mobile**: long-press → bottom sheet with actions.
- Actions shown based on permissions (e.g., only owner sees "Delete for everyone" after 48h for admins).

## Acceptance Criteria

- [ ] Text messages send via Enter key
- [ ] Reply shows quoted preview in composer and in message bubble
- [ ] Clicking reply preview scrolls to original message
- [ ] Forward works to single and multiple chats
- [ ] Edit works within 48h, shows "(edited)" label
- [ ] Delete for me hides locally, delete for everyone removes for all
- [ ] Pin/unpin works, pinned messages accessible from header
- [ ] Copy text copies to clipboard with confirmation toast
- [ ] Multi-select enables bulk forward, delete, copy
- [ ] Context menu appears on right-click (desktop) / long-press (mobile)
