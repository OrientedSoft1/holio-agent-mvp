# [P4] Link previews, contact sharing, location sharing

**Phase:** 4 — Rich Media

## Description

Enhance messages with auto-generated link previews, contact card sharing, and map-based location sharing.

### Link Previews

- **Detection**: server-side URL regex extraction from message text.
- **Metadata fetching**: fetch `og:title`, `og:description`, `og:image`, `og:site_name` from target URL.
- **Preview card layout**:
  ```
  ┌──────────────────────────────┐
  │ [og:image]                   │
  │ og:site_name                 │
  │ og:title                     │
  │ og:description (truncated)   │
  └──────────────────────────────┘
  ```
- **Caching**: cache preview metadata for 24 hours (keyed by URL).
- **Security**: sanitize URLs, follow redirects (max 3), timeout after 5 seconds.
- **Opt-out**: user can remove preview before sending.
- **Special embeds**: YouTube videos show inline player, Twitter/X show tweet card.

### Contact Sharing

- **Trigger**: attach menu → "Contact" option.
- **Contact picker**: search user's contacts (Holio users and phone contacts if permitted).
- **Contact card message**:
  ```
  ┌──────────────────────────────┐
  │ [Avatar]  John Doe           │
  │           +47 123 45 678     │
  │           [Message] [Add]    │
  └──────────────────────────────┘
  ```
- Actions: "Message" opens DM, "Add to contacts" saves contact.
- Contact card stores name + phone number (not a live reference).

### Location Sharing

- **Trigger**: attach menu → "Location" option.
- **Location picker**:
  - Map view (Leaflet/Mapbox) with pin.
  - "Send current location" button (uses Geolocation API).
  - Search for a place by name.
  - Drag pin to adjust.
- **Location message**:
  ```
  ┌──────────────────────────────┐
  │ [Static map image with pin]  │
  │ 📍 Location Name             │
  │    59.9139° N, 10.7522° E   │
  └──────────────────────────────┘
  ```
- Tap to open in full map view or external maps app.
- Static map image generated via map tile API.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/messages/link-preview` | Fetch OG metadata for a URL |
| POST | `/messages/contact` | Send a contact card message |
| POST | `/messages/location` | Send a location message |

## Acceptance Criteria

- [ ] URLs in messages auto-generate preview cards with OG metadata
- [ ] Preview cards show image, title, description, and site name
- [ ] Preview cache works (same URL doesn't re-fetch within 24h)
- [ ] User can remove link preview before sending
- [ ] Contact sharing sends a card with name and phone number
- [ ] Contact card actions (Message, Add) work
- [ ] Location sharing shows map with pin
- [ ] "Send current location" uses device GPS
- [ ] Location messages render static map image with coordinates
- [ ] Tap location message opens full map view
