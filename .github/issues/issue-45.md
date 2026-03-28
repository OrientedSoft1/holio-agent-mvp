## Phase 8: Polish

### Overview

Right-side info panel showing detailed contact, group, channel, or bot information with shared media tabs and action buttons.

### Panel Trigger

- Click contact/group name in chat header to open info panel
- Panel slides in from the right (or expands if layout allows)
- Close via X button or Esc key

### Contact Info

- Large avatar (clickable to view full size)
- Display name, username
- Phone number (if visible per privacy settings)
- Bio/about text
- Online status / last seen (if visible per privacy settings)
- Member-since date

### Group/Channel Info

- Group/channel avatar and name
- Description text
- Member count
- Created date and creator name
- Member list (scrollable, searchable)

### Bot Info

- Bot avatar with "AI" badge
- Bot name, type, description
- Model info (which AI model it uses)
- Created by (company admin)

### Shared Media Tabs

| Tab | Content | Display |
|-----|---------|---------|
| Photos | Image attachments | Grid of thumbnails |
| Videos | Video attachments | Grid with play icon overlay |
| Files | Documents (PDF, DOC, etc.) | List with icon, name, size, date |
| Music | Audio files | List with title, duration |
| Voice | Voice messages | List with duration, date |
| Links | URLs shared in chat | List with URL preview (title, favicon) |
| GIFs | Animated GIFs | Grid of thumbnails |

- Each tab shows item count in the tab label
- Items loaded with infinite scroll pagination
- Click item to view/open in context

### Groups in Common

- List of groups shared between the current user and the viewed contact
- Group name + avatar + member count

### Action Buttons

| Action | Contact | Group | Channel | Bot |
|--------|---------|-------|---------|-----|
| Share Contact | ✓ | | | |
| Edit | | ✓ (if admin) | ✓ (if admin) | ✓ (if admin) |
| Delete Chat | ✓ | ✓ | | |
| Leave | | ✓ | ✓ | |
| Block | ✓ | | | |
| Report | ✓ | ✓ | ✓ | |
| Mute | ✓ | ✓ | ✓ | ✓ |

### Acceptance Criteria

- [ ] Info panel opens for contacts, groups, channels, and bots
- [ ] Contact info displays avatar, name, phone, bio, status (respecting privacy)
- [ ] All 7 shared media tabs populated from message history
- [ ] Tab item counts accurate
- [ ] Media items load with infinite scroll pagination
- [ ] Groups in common listed for contacts
- [ ] All action buttons functional for their respective entity types
- [ ] Panel closable via X button or Esc key
