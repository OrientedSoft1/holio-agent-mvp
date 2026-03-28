# Holio Agent

**Corporate AI Messaging Platform**

Holio Agent is a corporate messaging platform that combines Telegram's messaging UX with Slack's organizational structure and an AI bot management layer powered by AWS Bedrock.

## Key Features

- **Phone-number authentication** with SMS verification and optional 2FA
- **Company workspaces** with roles, invitations, and cross-company chat
- **Real-time messaging** with rich media (images, voice, video, files, GIFs, stickers)
- **AI Bot Manager** -- deploy CFO, Marketing, HR, Support, DevOps, or custom AI bots per company
- **Channels and groups** with granular admin permissions
- **Stories** with privacy controls and 24h expiry
- **Chat folders** with smart filters
- **Privacy settings** matching Telegram's granular controls

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS, TypeORM, PostgreSQL, Socket.IO, Bull queues |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Query |
| AI | AWS Bedrock (Claude, Nova, Llama, Mistral) |
| Storage | AWS S3 |
| Cache | Redis |

## Brand

- **Primary Orange:** `#FF9220`
- **Dark:** `#152022`
- **Lavender:** `#D1CBFB`
- **Sage Green:** `#C6D5BA`
- **Off-white:** `#FCFCF8`

## Getting Started

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## License

Proprietary -- Holio AS
