# [P4] GIF search and sticker packs

**Phase:** 4 — Rich Media

## Description

Add inline GIF search and a sticker pack system so users can send expressive media in conversations.

### GIF Picker

- **API integration**: Giphy or Tenor API (configurable).
- **Trigger**: GIF button in composer toolbar or `/gif` command.
- **Picker UI**:
  - Search input with debounced queries (300ms).
  - Trending GIFs shown by default.
  - Grid layout of GIF thumbnails (masonry style).
  - Infinite scroll pagination.
- **GIF messages**:
  - Auto-play in chat (muted, looping).
  - Max width matching image messages.
  - Tap to pause/play.
  - "GIF" badge overlay in corner.
- **Caching**: cache trending results for 15 minutes, search results for 5 minutes.

### Sticker Pack System

#### Data Model — StickerPack

- **id** — UUID
- **name** — pack name
- **author** — creator name
- **thumbnail** — cover sticker image
- **stickers** — array of sticker objects (image URL, emoji association)
- **isAnimated** — boolean (Lottie/WebP animation support)

#### Data Model — UserStickerPack

- **userId** — FK
- **packId** — FK
- **addedAt** — timestamp
- **position** — sort order

### Sticker Picker UI

- **Trigger**: sticker button in composer toolbar (or tab in emoji picker).
- **Tabs**:
  - Recently used stickers (last 50).
  - Each added pack as a tab with pack icon.
  - "Browse packs" tab to discover and add new packs.
- **Sticker grid**: 4–5 columns of sticker thumbnails.
- **Send**: tap sticker to send immediately (no composer preview).

### Sticker Messages

- Displayed at fixed size: 160×160px (non-animated), 200×200px (animated).
- No message bubble — sticker floats in chat.
- Animated stickers play on loop using Lottie or animated WebP.

### Sticker Pack Management

- Browse available packs in a dedicated view.
- Preview pack contents before adding.
- Add/remove packs.
- Reorder packs via drag-and-drop.

## Acceptance Criteria

- [ ] GIF search returns results from Giphy/Tenor API
- [ ] GIF picker shows trending GIFs by default
- [ ] GIF messages auto-play in chat
- [ ] Sticker picker shows recently used and added packs
- [ ] Stickers render at fixed size without message bubble
- [ ] Animated stickers play on loop
- [ ] Users can browse, add, and remove sticker packs
- [ ] Recently used stickers tracked (last 50)
- [ ] Search debounced and results cached
