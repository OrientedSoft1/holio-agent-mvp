## Phase 7: Stories + Search + Privacy

### Overview

Comprehensive privacy settings page giving users granular control over who can see their information and how their data is shared.

### Privacy Settings

#### Last Seen & Online Status

- Visibility options: `Everybody` · `My Contacts` · `Nobody`
- Exception lists:
  - **Always Share With**: specific users who can always see last seen
  - **Never Share With**: specific users who are always blocked from seeing it
- If hidden, the user also cannot see others' last seen

#### Phone Number Visibility

- Options: `Everybody` · `My Contacts` · `Nobody`
- Controls who can see the user's phone number on their profile

#### Profile Photo Visibility

- Options: `Everybody` · `My Contacts` · `Nobody`
- Non-permitted users see a default placeholder avatar

#### Forwarded Messages

- Toggle: link back to original sender on/off
- When off, forwarded messages show "Forwarded" without the sender's name/profile link

#### Read Receipts

- Toggle: on/off
- When off, no read receipts sent for this user
- User also loses the ability to see others' read receipts

#### Two-Step Verification (2FA)

- Set a cloud password (required in addition to SMS code on new login)
- Optional recovery email for password reset
- Password hint (displayed when prompted)
- Setup flow: enter password → confirm password → add hint → add recovery email

### Data Sync

- All privacy settings stored server-side
- Settings sync across all active sessions immediately via WebSocket
- Changes take effect in real-time

### Acceptance Criteria

- [ ] Last seen visibility configurable with exception lists
- [ ] Phone number visibility enforced across the app
- [ ] Profile photo visibility enforced (placeholder shown when restricted)
- [ ] Forwarded message link toggle works
- [ ] Read receipts toggle respected in both directions
- [ ] Two-step verification setup flow complete (password + recovery email)
- [ ] All settings sync across sessions in real-time
