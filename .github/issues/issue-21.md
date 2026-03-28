# [P4] Video notes (round bubbles), file attachments

**Phase:** 4 — Rich Media

## Description

Implement Telegram-style round video notes recorded from the camera, and a general file attachment system with progress indicators.

### Video Notes

- Record short video from device camera (front-facing default).
- Max duration: 60 seconds.
- Circular crop during recording and playback.
- **Recording UI**: circular viewfinder, tap to start/stop, timer overlay.
- **Playback UI**:
  - Circular bubble in chat (no message box).
  - Auto-play (muted) when scrolled into view.
  - Tap to unmute and view fullscreen (still circular).
  - Progress ring around the circle during playback.
- Compressed to 360p circular for small file size.

### File Attachments

- Attach any file type via:
  - Paperclip button in composer → file picker.
  - Drag and drop onto chat area.
  - Paste from clipboard.

### File Message Display

```
┌──────────────────────────────┐
│ 📄  filename.pdf             │
│     12.3 MB • PDF document   │
│     [████████░░] 80%         │
│     [Download]               │
└──────────────────────────────┘
```

- File type icon (document, spreadsheet, archive, code, etc.).
- Filename (truncated with tooltip for long names).
- File size (human-readable: KB, MB, GB).
- Upload progress bar (during send).
- Download button (click to download via presigned S3 URL).

### Supported File Categories

| Category | Extensions | Icon |
|----------|-----------|------|
| Document | pdf, doc, docx, txt | 📄 |
| Spreadsheet | xls, xlsx, csv | 📊 |
| Presentation | ppt, pptx | 📽️ |
| Archive | zip, rar, 7z, tar.gz | 🗜️ |
| Code | js, ts, py, java, etc. | 💻 |
| Other | anything else | 📎 |

### Upload/Download

- Uses the same S3 presigned URL system from issue-19.
- Upload progress tracked and displayed in real-time.
- Download via presigned URL (expires after 1 hour).
- File size limit: 2 GB (same as image uploads).

## Acceptance Criteria

- [ ] Video notes record from camera with circular viewfinder
- [ ] Video notes display as circular bubbles in chat
- [ ] Auto-play (muted) when scrolled into view
- [ ] File attachments work via file picker, drag-and-drop, and paste
- [ ] File messages show icon, filename, size, and download button
- [ ] Upload progress indicator visible during send
- [ ] Download via presigned S3 URL works
- [ ] File type icons render correctly for all categories
- [ ] Video notes limited to 60 seconds
