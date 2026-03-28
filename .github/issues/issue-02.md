## Phase 1: Foundation + Phone Auth

### Description
Set up the React + Vite frontend project with:
- React 18 + TypeScript + Vite scaffolding
- Tailwind CSS with Holio brand colors (#FF9220 orange, #152022 dark, #D1CBFB lavender, #FCFCF8 off-white)
- Zustand stores (auth, company, chat, ui, folder, bot, search)
- React Query setup with Axios API client
- Socket.IO client service
- React Router with protected routes (auth guard)
- Base layout components (AppShell)

### Acceptance Criteria
- [ ] `npm run dev` starts frontend on port 5173
- [ ] Tailwind configured with Holio brand palette
- [ ] Zustand stores initialized with TypeScript types
- [ ] API client configured with base URL and JWT interceptor
- [ ] Protected route redirects to login when unauthenticated
