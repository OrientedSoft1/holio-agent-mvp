## Phase 1: Foundation + Phone Auth

### Description
Build the authentication frontend screens matching Telegram's login flow:
- **PhoneInput page**: Country code dropdown picker + phone number input + "Next" button. HOLIO logo and brand styling.
- **VerifyCode page**: 5-digit code input with auto-focus, resend timer (60s), back button
- **TwoFa page**: Password input for 2FA cloud password, forgot password link
- **ProfileSetup page**: First name (required), last name (optional), avatar upload, "Start Messaging" button
- Auto-redirect logic: new user -> ProfileSetup, existing user with 2FA -> TwoFa, otherwise -> CompanySelect
- Store JWT tokens in Zustand authStore + localStorage

### Acceptance Criteria
- [ ] Phone input with working country code picker
- [ ] Code verification screen with auto-advance on 5 digits
- [ ] 2FA screen shown only when backend requires it
- [ ] Profile setup for new users with avatar upload
- [ ] JWT tokens stored and used for subsequent API calls
- [ ] Proper redirect flow between auth screens
