## Phase 6: Groups + Channels

### Overview

Enable creating groups that span multiple companies. Members from different organizations can communicate in a shared group, governed by a company-level opt-in setting.

### Cross-Company Setting

- Company setting: `allowCrossCompany` (boolean, default `false`)
- Only company admins can toggle this setting
- When disabled, members of that company cannot be added to cross-company groups
- When disabled after being enabled, existing memberships remain but no new additions

### Group Creation Flow

1. User creates a new group
2. Selects "Cross-Company Group" option (only if their company allows it)
3. Sets group name, avatar, description
4. Adds members — search shows contacts from any company (where that company also allows it)
5. Both companies' `allowCrossCompany` must be `true` for a member to be added

### Data Model Considerations

- Group entity needs `isCrossCompany` flag
- GroupMember tracks `userId` and `companyId` for each member
- Messages in cross-company groups visible to all members regardless of company

### Feature Parity

All standard messaging features work in cross-company groups:
- Text, media, file messages
- Typing indicators
- Read receipts (if enabled)
- Message reactions
- @mentions

### Acceptance Criteria

- [ ] Cross-company groups can be created when both companies allow it
- [ ] Members from different companies can chat in the same group
- [ ] `allowCrossCompany` setting respected — cannot add members from companies that disallow it
- [ ] All standard messaging features work in cross-company groups
- [ ] Disabling the setting prevents new cross-company additions but preserves existing ones
