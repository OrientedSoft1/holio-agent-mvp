## Phase 8: Polish

### Overview

In-chat poll creation supporting both regular polls (multi-vote) and quiz mode (one correct answer).

### Poll Creation

- Accessed from message input attachment menu → "Poll"
- Creation form fields:
  - **Question** — text input (required)
  - **Options** — 2–10 answer choices
  - **Mode toggle**: Regular Poll / Quiz
  - **Anonymous voting** toggle (hide who voted)
  - **Multiple answers** toggle (allow selecting multiple options)
  - **Close timer** — optional auto-close after duration

### Regular Poll

- Users select one or more options (depending on multiple-answers setting)
- Vote can be changed before poll is closed
- Results visible in real-time as votes come in
- Results display: horizontal bars with percentages and vote counts

### Quiz Mode

- One option marked as "correct answer" by the poll creator
- Users get one attempt to answer
- After answering: correct answer highlighted green, wrong answer highlighted red
- Confetti/celebration animation on correct answer
- Explanation text (optional) shown after answering

### Poll Lifecycle

- **Active**: accepting votes
- **Closed**: no more votes, final results shown
- Close manually via creator action or automatically via timer
- Closed polls show final results to all members

### Real-Time Updates

- Votes sync via WebSocket
- Result bars animate as new votes arrive
- Vote count updates in real-time

### Data Model

- `Poll`: question, type, isAnonymous, allowMultiple, closeAt, closedBy
- `PollOption`: pollId, text, isCorrect (quiz only), position
- `PollVote`: pollId, optionId, userId, votedAt

### Acceptance Criteria

- [ ] Polls created with 2–10 options from message input
- [ ] Regular polls accept votes and display real-time results
- [ ] Quiz mode marks correct/incorrect answers with visual feedback
- [ ] Anonymous voting hides voter identities
- [ ] Multiple choice option allows selecting multiple answers
- [ ] Polls close manually or on timer
- [ ] Results update in real-time via WebSocket
