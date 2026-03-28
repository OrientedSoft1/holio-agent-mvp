# [P3] Chat folders with filter tabs

**Phase:** 3 — Core Chat + UI Shell

## Description

Allow users to organize their chat list using customizable folders with filter tabs, similar to Telegram's folder system.

### ChatFolder Entity

- **id** — UUID
- **userId** — FK to owner
- **name** — display name (e.g., "Work", "Family", "Crypto")
- **icon** — emoji or icon identifier
- **position** — sort order (integer)
- **filters** — JSON object defining inclusion/exclusion rules
- **isMuted** — boolean (mute all notifications for this folder)

### Filter Rules (JSON)

```json
{
  "include": {
    "contacts": true,
    "nonContacts": false,
    "groups": true,
    "channels": false,
    "bots": false,
    "chatIds": ["uuid-1", "uuid-2"]
  },
  "exclude": {
    "muted": true,
    "archived": true,
    "chatIds": ["uuid-3"]
  }
}
```

### UI

- **Folder tabs** displayed horizontally below the search bar.
- "All Chats" tab always present as first tab (not deletable).
- Active tab highlighted with Holio accent color.
- Horizontal scroll if more tabs than viewport width.
- Unread badge per tab showing total unread count for that folder.

### Folder Management

- "Edit Folders" screen accessible from settings or long-press on tabs.
- Add folder: name, icon, configure filters via checkboxes and chat picker.
- Reorder folders via drag-and-drop.
- Delete folder (chats remain, just the filter view is removed).
- Maximum 10 custom folders per user.

### Manual Assignment

- Right-click a chat → "Add to folder" → select folder(s).
- A chat can appear in multiple folders if it matches multiple filters.
- Manually assigned chats added to the folder's `include.chatIds`.

## Acceptance Criteria

- [ ] "All Chats" tab always present and shows all chats
- [ ] Users can create up to 10 custom folders
- [ ] Folder tabs filter the chat list based on rules
- [ ] Tabs switch instantly without loading delay
- [ ] Include/exclude filters work for contacts, groups, channels, bots
- [ ] Manual chat assignment to folders works
- [ ] Per-folder mute silences notifications for that folder
- [ ] Folder unread badges show correct counts
- [ ] Folders reorderable via drag-and-drop
- [ ] Filters persist across sessions
