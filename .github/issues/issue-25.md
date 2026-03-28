## Phase 5: AI Bot System

### Overview

Integrate AWS Bedrock SDK to invoke foundation models for bot inference. Support multiple model families with streaming responses and per-company configuration.

### Integration Details

- Use `@aws-sdk/client-bedrock-runtime` package
- **Converse API** for multi-turn conversations — pass message history as conversation turns
- Streaming via `InvokeModelWithResponseStream` for real-time token delivery

### Supported Models

| Model ID | Family | Notes |
|----------|--------|-------|
| `anthropic.claude-sonnet` | Claude | Primary, best quality |
| `amazon.nova-pro` | Nova | Cost-effective |
| `meta.llama3` | Llama 3 | Open-source alternative |
| `mistralai.mistral` | Mistral | European option |

### Per-Company Configuration

Each company can configure:
- Bedrock endpoint URL (for VPC endpoints or cross-account access)
- AWS region for model invocation
- Allowed model list (restrict which models are available)
- Default model selection

### Implementation Requirements

- Abstract model invocation behind a `BedrockService` class
- Map bot `systemPrompt`, `temperature`, `maxTokens` to Bedrock request params
- Handle streaming chunks and emit them over WebSocket to the client
- Graceful error handling for throttling, model errors, and timeout
- Token counting from response metadata

### Acceptance Criteria

- [ ] All four model families invoke successfully via Bedrock
- [ ] Streaming responses deliver tokens incrementally to the client
- [ ] Multi-turn conversation context passed correctly via Converse API
- [ ] Per-company Bedrock region/endpoint config respected
- [ ] Errors (throttle, timeout, invalid model) handled gracefully with clear messages
- [ ] Token usage extracted from response metadata
