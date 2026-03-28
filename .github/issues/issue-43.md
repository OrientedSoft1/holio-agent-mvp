## Phase 8: Polish

### Overview

Full emoji picker panel integrated into the message input for selecting and searching emoji across all standard categories.

### Emoji Picker Layout

- Trigger: emoji icon button in message input bar
- Panel appears above/below the input area
- Tabbed categories across the top

### Categories

| Tab | Content |
|-----|---------|
| Recently Used | Last 30 emoji used by this user |
| Smileys & People | Faces, gestures, people |
| Animals & Nature | Animals, plants, weather |
| Food & Drink | Food, beverages |
| Activity | Sports, games, activities |
| Travel & Places | Transport, buildings, locations |
| Objects | Tools, household, office items |
| Symbols | Arrows, signs, math, zodiac |
| Flags | Country and regional flags |

### Search

- Search input at the top of the picker
- Search by emoji name (e.g., "thumbs up", "fire", "heart")
- Results update in real-time as user types
- No results state with helpful message

### Skin Tone Selector

- Long-press on a skin-tone-eligible emoji to select tone
- Skin tone preference remembered for future use
- Default shown on first use; selected tone applied thereafter

### Rendering

- Emoji render using native system emoji (no custom sprite sheets)
- Consistent grid layout (8 emoji per row)
- Smooth scrolling between categories
- Click emoji → inserted at cursor position in message input
- Picker stays open for multiple selections; close via click outside or Esc

### Acceptance Criteria

- [ ] Emoji picker opens from message input icon
- [ ] All 9 categories present and navigable via tabs
- [ ] Search finds emoji by name in real-time
- [ ] Recently used tab tracks last 30 emoji
- [ ] Skin tone selector works and remembers preference
- [ ] Emoji renders natively and inserts at cursor position
- [ ] Picker closes on outside click or Esc key
