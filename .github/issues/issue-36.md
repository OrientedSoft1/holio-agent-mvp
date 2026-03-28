## Phase 7: Stories + Search + Privacy

### Overview

Full story feature: create stories with media, set privacy controls, auto-expire after 24 hours, track viewers, and react with emoji.

### Story Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User (creator) |
| `mediaUrl` | string | Uploaded image/video URL |
| `mediaType` | enum | `image` · `video` |
| `caption` | text | Optional caption overlay |
| `privacy` | enum | `everyone` · `contacts` · `close_friends` · `selected` |
| `selectedUserIds` | UUID[] | User IDs if privacy = `selected` |
| `expiresAt` | timestamp | 24 hours after creation |
| `createdAt` | timestamp | |

### Story Creation

- Upload image or video (with compression/optimization)
- Add text caption overlay
- Select privacy level before posting
- "Close Friends" uses a user-managed list

### Story Viewing

- Story circles in the chat list header (horizontal scroll)
- Unviewed stories: colored ring; viewed: grey ring
- Tap circle to open story viewer
- Tap to advance to next story; swipe left/right between users
- Progress bar at top showing story segments

### Viewer List

- Story creator can see who viewed each story
- `StoryView` entity: `storyId`, `viewerId`, `viewedAt`
- Sorted by recency

### Story Reactions

- Swipe up or tap emoji bar to react to a story
- Reaction delivered as a DM to the story creator
- Quick emoji options + full picker

### 24-Hour Auto-Expiry

- `expiresAt` set to `createdAt + 24h`
- Cron job runs every 15 minutes to delete expired stories and their media
- Expired stories no longer visible in any view

### Acceptance Criteria

- [ ] Stories created with image/video upload and caption
- [ ] Privacy levels enforced (everyone, contacts, close friends, selected)
- [ ] Story circles render in chat list with viewed/unviewed state
- [ ] Story viewer supports tap-to-advance and swipe navigation
- [ ] Viewer list shows who watched each story
- [ ] Story reactions sent as DMs to creator
- [ ] Expired stories auto-deleted after 24 hours by cron job
