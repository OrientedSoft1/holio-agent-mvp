## Phase 8: Polish

### Overview

Dark mode theme, keyboard shortcuts for power users, and responsive/resizable panel layout.

### Dark Mode

- Toggle in settings and/or sidebar header
- Uses Holio dark palette:
  - Primary background: `#152022`
  - Secondary background: `#1a2a2d`
  - Surface/card: `#1f3336`
  - Text primary: `#e8eded`
  - Text secondary: `#8a9fa2`
  - Accent: existing brand color
- All UI components must support both light and dark themes
- Preference stored in user settings and synced across sessions
- Respect OS-level `prefers-color-scheme` as default

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close open panels (info, search, settings) |
| `Enter` | Send message |
| `Shift + Enter` | New line in message input |
| `Ctrl/Cmd + K` | Open global search |
| `Ctrl/Cmd + N` | New chat |
| `Ctrl/Cmd + Shift + M` | Toggle mute on current chat |
| `Alt + ↑/↓` | Navigate between chats |

- Shortcuts configurable in settings (stretch goal)
- Shortcut hints shown in tooltips

### Resizable Panels

- Three-panel layout: Sidebar | Chat | Info Panel
- Drag handles between panels for resizing
- Minimum widths: Sidebar 240px, Chat 400px, Info 280px
- Maximum widths: Sidebar 400px, Info 450px
- Double-click drag handle to reset to default widths
- Panel collapse: click arrow to collapse sidebar or info panel
- Collapsed state remembered per session
- Responsive breakpoints:
  - Desktop (>1200px): all three panels
  - Tablet (768–1200px): sidebar + chat, info as overlay
  - Mobile (<768px): single panel with navigation

### Acceptance Criteria

- [ ] Dark mode applies consistently to all UI components
- [ ] Dark palette uses specified Holio colors
- [ ] Theme preference synced across sessions and respects OS default
- [ ] All keyboard shortcuts functional
- [ ] Panels resizable via drag handles with min/max constraints
- [ ] Panels collapse/expand with remembered state
- [ ] Responsive layout adapts to desktop, tablet, and mobile breakpoints
