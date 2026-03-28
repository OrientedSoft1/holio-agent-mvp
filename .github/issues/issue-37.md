## Phase 7: Stories + Search + Privacy

### Overview

Comprehensive search functionality: global search across chats/contacts/channels, in-chat message search, and media type filters.

### Global Search

- Search bar in the sidebar header
- Searches across:
  - Chat names and last messages
  - Contact names and usernames
  - Public channel names and descriptions
- Results grouped by category (Chats, Contacts, Channels)
- Debounced input (300ms) for live results

### In-Chat Message Search

- Search icon in chat header opens search bar within the chat
- Full-text search across all messages in the conversation
- Navigate between matches (up/down arrows)
- Matched messages highlighted and scrolled into view
- Result count displayed (e.g., "3 of 12 matches")

### Date Range Filter

- Date picker for "From" and "To" dates
- Filters applied to in-chat search results
- Jump to date: select a date to jump to that point in the conversation

### Media Type Filters

Filter in-chat or global search by media type:

| Filter | Content |
|--------|---------|
| Photos | Image attachments |
| Videos | Video attachments |
| Documents | PDF, DOC, XLS, etc. |
| Links | URLs in messages |
| Voice | Voice messages |
| Music | Audio file attachments |
| GIFs | Animated GIF images |

### Recent Searches

- Last 20 searches stored locally
- Displayed when search bar is focused and empty
- Clear individual items or clear all
- Tap to re-execute search

### Search Results Display

- Highlighted matching text in results
- Context snippet around the match
- Timestamp and chat name for each result
- Click to navigate to the message in its chat

### Acceptance Criteria

- [ ] Global search finds chats, contacts, and channels by name/username
- [ ] In-chat message search finds messages with highlighted matches
- [ ] Date range filter works for in-chat search
- [ ] Media type filters return correct content types
- [ ] Recent search history saved and displayed
- [ ] Search results highlight matching text
- [ ] Navigating to a result scrolls to the correct message
