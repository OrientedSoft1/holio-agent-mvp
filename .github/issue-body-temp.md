## Description

Implement the bottom navigation bar component exactly as designed in the Figma file, adapted with Holio brand colors and logo.

## Figma Reference

- **File key:** `gvle7vj2YV8Ishh7deH6RX`
- **Node ID:** `182:2192` (Components > navigation-bar)
- Run `get_design_context(fileKey="gvle7vj2YV8Ishh7deH6RX", nodeId="37:4644")` to extract specs

## Design Specs

- 4 tabs: **Chats**, **Contacts**, **Settings**, **AI Agents** (replaces "Premium")
- Each tab has an icon + label
- Active state: Holio Orange (`#FF9220`) icon and label, with filled icon variant
- Inactive state: muted gray icon and label
- Chats tab shows unread badge (red circle with count)
- Background: white (`#FFFFFF`) with subtle top border
- Height and padding must match Figma exactly

## Brand Adaptations

- Replace "Premium" tab with "AI Agents"
- Replace star icon with bot/AI icon
- Active color: `#FF9220` (Holio Orange) instead of Telegram blue
- All other colors per Holio palette

## Responsive Requirements

- Mobile-first: 320px to 428px width
- Equal-width tab distribution
- Touch targets minimum 44x44px
- Fixed to bottom of viewport

## Acceptance Criteria

- [ ] 4 tabs render with correct icons and labels
- [ ] Active/inactive states match Figma design
- [ ] Unread badge displays on Chats tab
- [ ] Holio Orange used for active state
- [ ] Touch targets are accessible (44px minimum)
- [ ] Responsive from 320px to 428px
- [ ] Component placed in `frontend/src/components/layout/`
