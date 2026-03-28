# Holio Agent -- Architecture

## Overview

Holio Agent is a corporate AI messaging platform built as a monorepo with a NestJS backend and React + Vite frontend. Each company (workspace) gets isolated channels, members, roles, and AI bots powered by AWS Bedrock.

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        React + Vite Frontend                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Zustand  │  │  React   │  │ Socket.IO│  │  React Query     │ │
│  │  Stores   │  │  Router  │  │  Client  │  │  (REST calls)    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────────┬───────────────────┬───────────────────┘
                           │ REST (HTTPS)      │ WebSocket (WSS)
┌──────────────────────────┴───────────────────┴───────────────────┐
│                         NestJS Backend                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      Modules                                 │ │
│  │  ┌──────┐ ┌───────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │ │
│  │  │ Auth │ │ Users │ │Companies │ │ Chats  │ │ Messages  │ │ │
│  │  └──────┘ └───────┘ └──────────┘ └────────┘ └───────────┘ │ │
│  │  ┌──────┐ ┌───────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │ │
│  │  │Groups│ │ Bots  │ │BotWorker │ │Stories │ │ Reactions │ │ │
│  │  └──────┘ └───────┘ └──────────┘ └────────┘ └───────────┘ │ │
│  │  ┌──────┐ ┌───────┐ ┌──────────┐ ┌────────┐               │ │
│  │  │Search│ │Upload │ │  Notifs  │ │Gateway │               │ │
│  │  └──────┘ └───────┘ └──────────┘ └────────┘               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   TypeORM       │  │  Bull Queue  │  │   WebSocket Gateway   │ │
│  │   (PostgreSQL)  │  │  (Redis)     │  │   (Socket.IO)         │ │
│  └────────┬───────┘  └──────┬───────┘  └───────────────────────┘ │
└───────────┼──────────────────┼───────────────────────────────────┘
            │                  │
┌───────────┴──────┐  ┌───────┴────────┐  ┌───────────────────────┐
│   PostgreSQL     │  │     Redis      │  │    AWS Bedrock        │
│   Database       │  │  Cache/Queue   │  │  (Claude, Nova,       │
│                  │  │                │  │   Llama, Mistral)     │
└──────────────────┘  └────────────────┘  └───────────────────────┘
                                          ┌───────────────────────┐
                                          │      AWS S3           │
                                          │   File Storage        │
                                          └───────────────────────┘
```

## Authentication Flow

```
User opens Holio
    │
    ▼
Enter phone number (with country code picker)
    │
    ▼
Backend sends SMS code via Twilio
    │
    ▼
User enters 5-digit verification code
    │
    ├─ New user ──► Profile setup (name + avatar) ──► JWT issued
    │
    ├─ Existing user (no 2FA) ──► JWT issued
    │
    └─ Existing user (has 2FA) ──► Enter cloud password ──► JWT issued
    │
    ▼
Select or create company workspace
    │
    ▼
Main chat view
```

## Core Domain Model

### Company (Workspace)

Each company is an isolated workspace with its own:
- Members with role-based access (owner, admin, member, guest)
- Channels (company-scoped chat rooms)
- AI bots (connected to company's AWS Bedrock config)
- Settings (cross-company chat toggle, bot permissions, max members)

Users can belong to multiple companies and switch between them via the company switcher in the sidebar.

### Chat Types

| Type | Scope | Description |
|------|-------|-------------|
| `dm` | Global | 1:1 direct message between any two users |
| `companyChannel` | Company | Channel within a single company |
| `group` | Company | Ad-hoc group within a company |
| `crossCompany` | Multi-company | Shared chat between users from different companies |

### Message Types

| Type | Description |
|------|-------------|
| `text` | Plain text with markdown support |
| `image` | Single or multiple images (photo grid) |
| `voice` | Audio recording with waveform |
| `videoNote` | Round video bubble (Telegram-style) |
| `file` | Document/file attachment (up to 2GB) |
| `gif` | Animated GIF |
| `sticker` | Sticker from sticker pack |
| `poll` | Poll with options (regular or quiz mode) |
| `contact` | Contact card (name + phone) |
| `location` | Map pin with coordinates |
| `botAction` | Bot command trigger |
| `botResult` | Bot response with rich formatting |

### AI Bot System

Each company can deploy AI bots from templates or create custom ones:

```
Company Admin
    │
    ▼
Bot Store ──► Select template (CFO, Marketing, HR, Support, DevOps, Custom)
    │
    ▼
Configure: system prompt, model (Claude/Nova/Llama/Mistral), temperature, tools
    │
    ▼
Invite bot to channel
    │
    ▼
Users @mention bot in chat
    │
    ▼
Message queued in Bull worker
    │
    ▼
Bot worker invokes AWS Bedrock
    │
    ▼
Streaming response appears in chat
    │
    ▼
Task logged in audit trail (tokens, duration, cost)
```

## Database Schema

### Entity Relationship Diagram

```
User ──────────┬──── CompanyMember ────── Company
               │                            │
               │                            ├──── Bot
               │                            │      │
               ├──── Contact                │      ├──── BotChatMember
               │                            │      │
               ├──── ChatMember ─── Chat ───┘      └──── BotTask
               │                     │
               ├──── Story           ├──── Message
               │       │             │       │
               │       └─ StoryView  │       ├──── ReadReceipt
               │                     │       ├──── Reaction
               └──── ChatFolder      │       └──── Poll ──── PollVote
                                     │
                                     └──── ChatMember
```

### Key Entities

**User** -- phone, countryCode, username, firstName, lastName, bio, avatarUrl, isOnline, lastSeen, twoFaHash, privacySettings (JSON)

**Company** -- name, slug, logoUrl, description, ownerId, settings (JSON: allowCrossCompany, allowBots, maxMembers), bedrockEndpoint, bedrockRegion

**CompanyMember** -- companyId, userId, role (owner/admin/member/guest), permissions (JSON)

**Chat** -- companyId (nullable), type (dm/group/companyChannel/crossCompany), name, isPublic, slowModeInterval

**Message** -- chatId, senderId, senderType (user/bot), replyToId, forwardedFromId, type, content, fileUrl, metadata (JSON), isEdited, isPinned, isScheduled

**Bot** -- companyId, name, type (cfo/marketing/hr/support/devops/custom), systemPrompt, modelId, temperature, maxTokens, knowledgeBaseId, tools (JSON)

**BotTask** -- botId, chatId, triggerMessageId, status, input, output, tokensUsed, durationMs

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `message:send` | Client → Server | `{ chatId, type, content, replyToId?, fileUrl? }` |
| `message:new` | Server → Client | Full message object |
| `message:edit` | Bidirectional | `{ messageId, content }` |
| `message:delete` | Bidirectional | `{ messageId, forEveryone }` |
| `message:read` | Client → Server | `{ chatId, messageId }` |
| `typing:start` | Client → Server | `{ chatId }` |
| `typing:stop` | Client → Server | `{ chatId }` |
| `typing:update` | Server → Client | `{ chatId, userId, isTyping }` |
| `presence:update` | Server → Client | `{ userId, isOnline, lastSeen }` |
| `reaction:add` | Bidirectional | `{ messageId, emoji }` |
| `reaction:remove` | Bidirectional | `{ messageId, emoji }` |
| `bot:response` | Server → Client | `{ chatId, botId, content, isStreaming }` |
| `bot:task:status` | Server → Client | `{ taskId, status }` |

## API Endpoints (REST)

### Auth
- `POST /auth/send-code` -- Send SMS verification code
- `POST /auth/verify-code` -- Verify code, return JWT
- `POST /auth/verify-2fa` -- Verify 2FA password
- `POST /auth/refresh` -- Refresh JWT token

### Users
- `GET /users/me` -- Current user profile
- `PATCH /users/me` -- Update profile
- `PATCH /users/me/privacy` -- Update privacy settings
- `POST /users/me/2fa` -- Enable/disable 2FA

### Companies
- `POST /companies` -- Create company
- `GET /companies` -- List user's companies
- `GET /companies/:id` -- Company details
- `PATCH /companies/:id` -- Update company
- `POST /companies/:id/invite` -- Invite member
- `GET /companies/:id/members` -- List members
- `PATCH /companies/:id/members/:userId` -- Update member role

### Chats
- `POST /chats` -- Create chat (DM, group, channel)
- `GET /chats` -- List chats (with folder filter)
- `GET /chats/:id` -- Chat details
- `GET /chats/:id/messages` -- Message history (paginated)
- `POST /chats/:id/messages` -- Send message (REST fallback)
- `PATCH /chats/:id/messages/:messageId` -- Edit message
- `DELETE /chats/:id/messages/:messageId` -- Delete message

### Chat Folders
- `POST /folders` -- Create folder
- `GET /folders` -- List folders
- `PATCH /folders/:id` -- Update folder
- `DELETE /folders/:id` -- Delete folder

### Bots
- `GET /bots/templates` -- List bot templates
- `POST /companies/:id/bots` -- Create bot for company
- `GET /companies/:id/bots` -- List company bots
- `PATCH /bots/:id` -- Update bot config
- `POST /bots/:id/invite` -- Add bot to chat
- `GET /bots/:id/tasks` -- Bot task history

### Stories
- `POST /stories` -- Create story
- `GET /stories` -- List stories from contacts
- `POST /stories/:id/view` -- Mark story as viewed
- `POST /stories/:id/react` -- React to story

### Search
- `GET /search?q=` -- Global search
- `GET /chats/:id/search?q=` -- In-chat search

### Uploads
- `POST /uploads` -- Upload file (multipart, up to 2GB)
- `GET /uploads/:id` -- Get file metadata

## Frontend Architecture

### UI Layout (3-Panel + Company Switcher)

```
┌──────┬──────────────┬───────────────────────────┬──────────────┐
│      │              │                           │              │
│  S   │   Chat List  │      Main Chat View       │   Info       │
│  I   │              │                           │   Panel      │
│  D   │  ┌────────┐  │  ┌─────────────────────┐  │              │
│  E   │  │ Search │  │  │  Chat Header        │  │  Contact /   │
│  B   │  └────────┘  │  └─────────────────────┘  │  Bot /       │
│  A   │  ┌────────┐  │  ┌─────────────────────┐  │  Group       │
│  R   │  │Stories │  │  │                     │  │  Info        │
│      │  └────────┘  │  │  Message Stream      │  │              │
│  H   │  ┌────────┐  │  │  (with bot cards)    │  │  Shared      │
│  O   │  │Folders │  │  │                     │  │  Media       │
│  L   │  └────────┘  │  │                     │  │  Tabs        │
│  I   │  ┌────────┐  │  └─────────────────────┘  │              │
│  O   │  │ Chat   │  │  ┌─────────────────────┐  │  Bot         │
│      │  │ Items  │  │  │  Message Input       │  │  Config      │
│  Co  │  │  ...   │  │  │  @bot mention        │  │              │
│  mp  │  │        │  │  │  emoji/attach/voice  │  │              │
│  any │  │        │  │  └─────────────────────┘  │              │
│      │  │        │  │                           │              │
└──────┴──────────────┴───────────────────────────┴──────────────┘
 ~70px     ~300px            flex-1                   ~300px
```

### State Management (Zustand Stores)

- **authStore** -- JWT tokens, current user, login state
- **companyStore** -- current company, company list, members
- **chatStore** -- active chat, chat list, messages, typing indicators
- **folderStore** -- chat folders, active folder filter
- **botStore** -- company bots, bot configs, active bot tasks
- **uiStore** -- panel visibility, dark mode, sidebar state
- **searchStore** -- search query, results, filters

### Component Hierarchy

```
App
├── LoginPage / VerifyCodePage / TwoFaPage / ProfileSetupPage
├── CompanySelectPage
└── ChatPage
    ├── Sidebar (company switcher, nav icons)
    ├── ChatListPanel
    │   ├── SearchBar
    │   ├── StoryCircles
    │   ├── FolderTabs
    │   └── ChatItem[] (avatar, name, last msg, badge)
    ├── ChatViewPanel
    │   ├── ChatHeader (name, members, actions)
    │   ├── MessageStream
    │   │   ├── DateSeparator
    │   │   ├── MessageBubble (text/image/voice/video/file/bot)
    │   │   ├── BotResponseCard
    │   │   └── SystemMessage
    │   └── MessageInput
    │       ├── ReplyPreview / EditPreview
    │       ├── EmojiPicker
    │       ├── AttachMenu
    │       ├── VoiceRecorder
    │       └── BotMentionAutocomplete
    └── InfoPanel
        ├── ContactInfo / GroupInfo / ChannelInfo / BotInfo
        ├── SharedMediaTabs
        └── BotConfigPanel
```

## Deployment Architecture

```
                    ┌─────────────┐
                    │  CloudFront │
                    │  (CDN)      │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────┴────────┐    ┌──────────┴──────────┐
    │  S3 Bucket       │    │  ALB                 │
    │  (Frontend SPA)  │    │  (Load Balancer)     │
    └──────────────────┘    └──────────┬───────────┘
                                       │
                            ┌──────────┴───────────┐
                            │  ECS Fargate          │
                            │  (NestJS Backend)     │
                            │  - REST API           │
                            │  - WebSocket Gateway  │
                            │  - Bot Worker         │
                            └──────────┬───────────┘
                                       │
                    ┌──────────────┬────┴────┬──────────────┐
                    │              │         │              │
              ┌─────┴─────┐ ┌─────┴───┐ ┌───┴────┐ ┌──────┴──────┐
              │ RDS       │ │ElastiC. │ │  S3    │ │  Bedrock    │
              │ PostgreSQL│ │ Redis   │ │ Files  │ │  AI Models  │
              └───────────┘ └─────────┘ └────────┘ └─────────────┘
```

## Security

- Phone-number auth with rate-limited SMS (5 attempts / 24h lockout)
- JWT access tokens (15min) + refresh tokens (7 days)
- Optional 2FA cloud password (bcrypt hashed)
- Company-scoped data isolation
- Granular privacy settings (last seen, phone, profile photo, forwarding, read receipts)
- Bot task audit logging
- File upload validation (type, size, malware scan)
- WebSocket authentication via JWT handshake
