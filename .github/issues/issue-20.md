# [P4] Voice messages: record, pause, resume, waveform, view-once

**Phase:** 4 — Rich Media

## Description

Implement voice message recording, playback with waveform visualization, and a view-once option for ephemeral audio.

### Recording

- **MediaRecorder API** in the browser (Opus codec in WebM container).
- Two recording modes:
  - **Hold-to-record**: hold mic button, release to send.
  - **Toggle mode**: tap to start, tap to stop.
- **Pause / resume**: button to pause recording mid-stream.
- **Cancel**: slide left (mobile) or press Escape to discard.
- Max recording duration: 15 minutes.
- Waveform visualization during recording (real-time amplitude bars).

### Playback

- Inline player in message bubble with:
  - Play/pause button.
  - Waveform visualization (pre-computed on upload).
  - Current time / total duration.
  - Playback speed toggle: 1×, 1.5×, 2×.
- Progressive playback (stream from S3, don't wait for full download).

### Waveform Data

- On upload, server extracts amplitude samples (128 data points) using FFmpeg.
- Stored as JSON array alongside the audio file.
- Client renders waveform from data points using Canvas or SVG.

### View-once Mode

- Sender can toggle "view once" before sending.
- View-once voice messages:
  - Play only once; cannot replay, seek, or forward.
  - After playback, replaced with "Voice message played" placeholder.
  - Server deletes file after confirmation of playback.
  - Cannot be forwarded or saved.

### Storage

- Audio files uploaded to S3 via presigned URL (same as file upload system).
- Compressed Opus format keeps file sizes small (~1 MB/minute).

## Acceptance Criteria

- [ ] Voice recording works in Chrome, Firefox, Safari, and Edge
- [ ] Hold-to-record and toggle recording modes both function
- [ ] Pause and resume recording works
- [ ] Waveform visualization renders during recording and playback
- [ ] Playback speed control (1×, 1.5×, 2×) works
- [ ] View-once voice messages play only once then are deleted
- [ ] View-once messages cannot be forwarded or saved
- [ ] Cancel recording discards the audio
- [ ] Max 15-minute recording limit enforced
