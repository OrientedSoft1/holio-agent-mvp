# [P4] File upload to S3, image messages with photo grid

**Phase:** 4 — Rich Media

## Description

Implement file uploads to AWS S3 and display image messages as a responsive photo grid/collage layout.

### Upload System

- **Endpoint**: `POST /uploads` (multipart/form-data).
- **Max file size**: 2 GB.
- **Flow**: client → presigned URL from server → direct upload to S3 → confirm to server.
- **Storage**: S3 bucket with lifecycle rules (move to Glacier after 1 year).
- **Metadata stored**: filename, mimeType, size, s3Key, uploadedBy, chatId.

### Image Messages

- Images detected by MIME type (`image/jpeg`, `image/png`, `image/gif`, `image/webp`).
- **Thumbnail generation**: server-side resize to 320px wide via Sharp.
- Thumbnails stored alongside originals in S3.
- Blurhash generated for placeholder while loading.

### Photo Grid Layout

| Count | Layout |
|-------|--------|
| 1 image | Full width, max 400px height |
| 2 images | Side by side, equal width |
| 3 images | 1 large left + 2 stacked right |
| 4 images | 2×2 grid |
| 5+ images | 2×2 grid + "+N" overlay on last cell |

### Per-file Captions

- Each image in a group can have its own caption.
- Caption displayed below the image in the grid.
- Caption supports text only (no formatting in Phase 4).

### Full-screen Viewer

- Tap/click any image to open full-screen viewer.
- Swipe/arrow keys to navigate between images in the same message.
- Zoom via pinch (mobile) or scroll (desktop).
- Download button.
- Close via X button or Escape key.

## Acceptance Criteria

- [ ] Files up to 2 GB upload successfully to S3
- [ ] Presigned URL flow works (no file data through server)
- [ ] Thumbnails generated server-side and load fast
- [ ] Photo grid renders correctly for 1, 2, 3, 4, and 5+ images
- [ ] Per-image captions display below images
- [ ] Full-screen viewer opens on tap/click
- [ ] Viewer supports navigation, zoom, and download
- [ ] Blurhash placeholders shown while images load
- [ ] Upload progress indicator visible during upload
