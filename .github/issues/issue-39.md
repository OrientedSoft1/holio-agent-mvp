## Phase 7: Stories + Search + Privacy

### Overview

Per-chat notification controls, custom sounds, and browser push notifications.

### Per-Chat Mute

- Mute options: `1 hour` · `8 hours` · `2 days` · `Custom duration` · `Forever`
- Muted chats still receive messages but produce no notification
- Muted icon indicator on chat in sidebar
- Custom duration: date/time picker for mute expiry
- Mute auto-expires at the configured time

### Custom Notification Sounds

- Per-chat sound selection from a list of built-in sounds
- Sound preview (play button next to each option)
- "Disable Sound" option for silent notifications (visual badge only)
- Default sound configurable in global settings

### Push Notifications (Web Push API)

- Browser permission request on first login
- Service Worker registration for push events
- Push notification content: sender name, message preview (truncated)
- Click notification to open the specific chat
- Notification grouping for multiple messages from same chat
- Respect mute settings — no push for muted chats

### Notification Badges

- Unread count badge on sidebar chat items
- Folder tab badges showing total unread across folder
- Browser tab title updated with total unread count (e.g., "(5) Holio")
- Badge cleared when chat is opened/read

### Acceptance Criteria

- [ ] Per-chat mute works with all duration options
- [ ] Mute auto-expires at configured time
- [ ] Custom notification sounds configurable per chat
- [ ] Silent mode suppresses sound but shows badge
- [ ] Browser push notifications delivered for new messages
- [ ] Push notifications respect mute settings
- [ ] Unread badges display on sidebar items and folder tabs
