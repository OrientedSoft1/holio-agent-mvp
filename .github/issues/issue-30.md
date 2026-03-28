## Phase 5: AI Bot System

### Overview

Frontend Bot Store page where company admins browse available bot templates, add bots to their company, and configure them.

### Bot Store Page

- Grid layout of bot templates
- Each card shows: icon, name, description, category badge
- Category filter tabs: All, Finance, Marketing, HR, Support, DevOps, General
- "Add to Company" button on each card

### Add Bot Flow

1. Click "Add to Company" on a template card
2. Configuration modal opens, pre-filled with template defaults
3. Editable fields:
   - **Name** — text input
   - **Description** — text area
   - **System Prompt** — expandable text area with syntax highlighting
   - **Model** — dropdown (Claude Sonnet, Nova Pro, Llama 3, Mistral)
   - **Temperature** — slider (0.0–1.0)
   - **Max Tokens** — number input
   - **Tools** — toggle switches for each available tool
4. Click "Create Bot" → POST to API → bot added to company

### Bot Management List

- Accessible from company settings
- Table/list of company bots with: name, type, model, status, created date
- Actions per bot: Edit, Delete, View Tasks (links to audit log #29)
- Edit opens same configuration modal with current values

### UI Components

- Template card component (reusable)
- Configuration modal with form validation
- Category filter tabs
- Bot management table with actions

### Acceptance Criteria

- [ ] Bot Store page renders all templates in a grid
- [ ] Category filters work correctly
- [ ] "Add to Company" opens configuration modal with template defaults
- [ ] All configuration fields editable and validated
- [ ] Bot successfully created via API on submit
- [ ] Bot management list shows all company bots
- [ ] Edit and delete actions work from management list
