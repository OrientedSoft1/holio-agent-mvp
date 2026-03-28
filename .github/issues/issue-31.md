## Phase 5: AI Bot System

### Overview

Distinct visual treatment for bot messages in chat, including rich result cards, markdown rendering, source citations, and streaming indicators.

### Bot Message Styling

- Bot avatar with an "AI" badge overlay (small chip in corner)
- Brand color left border on bot message bubbles
- Bot name label above the message (e.g., "CFO Bot")
- Subtle background tint to differentiate from user messages

### Rich Result Cards

- Structured data responses rendered as collapsible cards
- Markdown rendering inside bot messages:
  - Headings, bold, italic, lists, code blocks
  - Tables rendered as styled HTML tables
  - Code blocks with syntax highlighting
- Collapsible sections for long responses (expand/collapse toggle)

### Source Citations

- Citations displayed as numbered references `[1]`, `[2]`, etc.
- Citation links rendered at the bottom of the message
- Clicking a citation opens the source (URL or document reference)
- Visual distinction for citation links (muted style, small font)

### Streaming Indicator

- Typing dots animation when bot starts processing (`bot:stream:start`)
- Dots replaced by first streamed content chunk
- Cursor/caret animation at the end of streaming text
- Smooth transition from streaming to final message

### Acceptance Criteria

- [ ] Bot messages visually distinct from user messages (avatar badge, border, label)
- [ ] Markdown renders correctly in bot messages (headings, lists, code, tables)
- [ ] Rich result cards display with collapse/expand functionality
- [ ] Source citations render as clickable links
- [ ] Streaming typing indicator shows during bot processing
- [ ] Smooth transition from streaming to complete message
