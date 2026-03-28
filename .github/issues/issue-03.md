## Phase 1: Foundation + Phone Auth

### Description
Implement Telegram-style phone number authentication backend:
- `POST /auth/send-code` - Accept phone number, generate 5-digit code, send via Twilio SMS (console log in dev)
- `POST /auth/verify-code` - Verify code, create user if new, return JWT tokens
- `POST /auth/verify-2fa` - Verify 2FA cloud password for users who have it enabled
- `POST /auth/refresh` - Refresh JWT access token using refresh token
- Country code list endpoint using `help.getCountriesList` pattern
- Rate limiting: 5 failed attempts = 24h lockout per phone number
- JWT access token (15min) + refresh token (7 days)
- Guards: JwtAuthGuard, CurrentUser decorator

### Acceptance Criteria
- [ ] Phone number accepted with country code validation
- [ ] SMS code sent (or logged in dev mode)
- [ ] Code verification returns JWT tokens
- [ ] New users flagged for profile setup
- [ ] 2FA password verification works for enabled users
- [ ] Rate limiting blocks after 5 failed attempts
- [ ] JwtAuthGuard protects endpoints
