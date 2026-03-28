# [P3] 1:1 DM and company channel creation

**Phase:** 3 — Core Chat + UI Shell

## Description

Enable users to start direct messages and create company channels — the two foundational chat types in Holio.

### Chat Entity

- **id** — UUID
- **type** — enum: `dm`, `group`, `companyChannel`, `crossCompany`
- **companyId** — FK (null for cross-company chats)
- **name** — display name (null for DMs, required for channels)
- **description** — optional (channels only)
- **isPrivate** — boolean (channels only, default `false`)
- **createdBy** — FK to user
- **createdAt / updatedAt** — timestamps
- **lastMessageAt** — denormalized for sort performance

### ChatMember Entity

- **chatId** — FK
- **userId** — FK
- **role** — enum: `owner`, `admin`, `member`
- **joinedAt** — timestamp
- **lastReadAt** — timestamp (for unread calculation)

### DM Creation Flow

1. User opens "New message" or taps a contact.
2. System checks if a DM already exists between the two users (in the same company context).
3. If exists → navigate to it. If not → create Chat (type: `dm`) + 2 ChatMembers.
4. DM name derived from the other participant's display name.

### Channel Creation Flow

1. User clicks "Create channel" in sidebar or chat list.
2. Form: channel name (required), description (optional), public/private toggle.
3. On submit → create Chat (type: `companyChannel`) + ChatMember (creator as `owner`).
4. Public channels are discoverable; private channels are invite-only.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chats/dm` | Create or get existing DM |
| POST | `/chats/channel` | Create a company channel |
| GET | `/chats` | List user's chats (paginated, filterable by type) |
| GET | `/chats/:id` | Get chat details |

## Acceptance Criteria

- [ ] Users can start a DM by selecting a contact
- [ ] Duplicate DMs prevented (reuse existing)
- [ ] Company channels created with name, description, public/private
- [ ] Chat types correctly assigned (`dm`, `companyChannel`)
- [ ] ChatMember records created with appropriate roles
- [ ] Both DMs and channels appear in the chat list
- [ ] Public channels discoverable by company members
- [ ] Private channels visible only to members
