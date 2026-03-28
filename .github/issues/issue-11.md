# [P3] 3-panel desktop layout: sidebar, chat list, chat view, info panel

**Phase:** 3 — Core Chat + UI Shell

## Description

Build the main application shell — a multi-panel layout matching the Holio design with brand colors. This is the structural foundation for all chat UI.

### Panel Structure

| Panel | Width | Content |
|-------|-------|---------|
| **Left sidebar** | ~70px fixed | Logo, company switcher, nav icons |
| **Chat list** | ~300px, resizable | Search, folder tabs, chat items |
| **Main chat** | flex-1 | Message list, composer |
| **Info panel** | ~300px, toggleable | Contact/group info, media, members |

### Left Sidebar Contents

- **HOLIO** logo at top.
- Company avatar (switcher trigger).
- Navigation icons with active indicator and badge counts:
  - All Chats
  - Personal
  - Company
  - Channels
  - Bots
  - Favorites
  - Stories
  - Settings
- User avatar at bottom.

### Panel Behavior

- **Resizable**: drag handles between chat list ↔ main chat and main chat ↔ info panel.
- **Info panel**: toggleable via button in chat header; slides in/out.
- **Responsive**: on screens < 768px, collapse to single-panel with back navigation.
- **Min/max widths**: chat list 200–500px, info panel 250–400px.

### Styling

- Holio brand color palette (defined in design tokens).
- Dark sidebar, light content area (or respect theme toggle).
- Smooth transitions on panel open/close/resize.
- Keyboard shortcut to toggle info panel (e.g., `Ctrl+I`).

## Acceptance Criteria

- [ ] 4-panel layout renders correctly on desktop (≥1024px)
- [ ] Left sidebar shows logo, company switcher, all nav icons with badges
- [ ] Chat list panel displays with search bar and folder tabs
- [ ] Main chat panel fills remaining space
- [ ] Info panel toggles open/closed
- [ ] Panels resizable via drag handles with min/max constraints
- [ ] Responsive: collapses to single panel on mobile widths
- [ ] Smooth transitions and animations on panel state changes
- [ ] Keyboard shortcut toggles info panel
