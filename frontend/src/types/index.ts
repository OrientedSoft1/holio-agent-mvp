export interface User {
  id: string
  phone: string
  username: string | null
  firstName: string
  lastName: string | null
  bio: string | null
  avatarUrl: string | null
  lastSeen: string | null
}

export interface Company {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
  bedrockRegion?: string
  bedrockConfig?: BedrockConfig | null
  memberCount?: number
  myRole?: 'owner' | 'admin' | 'member' | 'guest'
  createdAt: string
}

export interface BedrockConfig {
  accessKeyId?: string
  secretAccessKeyHint?: string
  region: string
  allowedModels?: string[]
  guardrailId?: string
  guardrailVersion?: string
  defaultModelId?: string
  maxTokensBudget?: number
  isConfigured: boolean
}

export interface BedrockModel {
  modelId: string
  modelName: string
  provider: string
  inputModalities: string[]
  outputModalities: string[]
}

export interface OpenAIConfig {
  apiKeyHint?: string
  organizationId?: string
  defaultModelId?: string
  isConfigured: boolean
}

export interface GeminiConfig {
  apiKeyHint?: string
  defaultModelId?: string
  isConfigured: boolean
}

export interface CompanyMember {
  id: string
  userId: string
  companyId: string
  role: 'owner' | 'admin' | 'member'
  user: User
}

export interface Chat {
  id: string
  type: 'private' | 'group' | 'channel' | 'bot' | 'crossCompany' | 'secret'
  name: string | null
  avatarUrl: string | null
  lastMessage: Message | null
  unreadCount: number
  companyId: string | null
  description: string | null
  isPublic: boolean
  slowModeInterval: number
  topics?: string[]
  myRole?: 'owner' | 'admin' | 'member'
  muted?: boolean
  pinned?: boolean
  isFavourite?: boolean
  members?: ChatMember[]
  onlineCount?: number
  pinnedMessage?: string | null
  secretAccepted?: boolean
  verified?: boolean
  selfDestructTimer?: number
  createdAt: string
}

export interface LinkPreviewData {
  url: string
  title: string
  description?: string
  image?: string
  domain: string
}

export interface FileMetadata {
  name: string
  size: number
  mimeType: string
  url: string
}

export interface MessageMetadata {
  files?: FileMetadata[]
  linkPreview?: LinkPreviewData
  duration?: number
  waveform?: number[]
  width?: number
  height?: number
  isViewOnce?: boolean
  botId?: string
  botName?: string
  botType?: Bot['type']
  poll?: PollMetadata
  scheduledAt?: string
}

export interface PollMetadata {
  question: string
  options: { id: string; text: string; votes: number; voters?: string[] }[]
  totalVotes: number
  isAnonymous?: boolean
  isQuiz?: boolean
  correctOptionId?: string
  isClosed?: boolean
  myVote?: string
  creatorId?: string
}

export interface MessageReaction {
  emoji: string
  count: number
  reacted: boolean
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderType?: 'user' | 'bot' | 'system'
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'videoNote' | 'gif' | 'system' | 'botResult' | 'poll'
  fileUrl: string | null
  replyToId: string | null
  metadata: MessageMetadata | null
  reactions?: MessageReaction[]
  scheduledAt?: string | null
  isRead?: boolean
  isEdited?: boolean
  readAt?: string | null
  forwardedFrom?: string | null
  viewCount?: number
  forwardCount?: number
  createdAt: string
  updatedAt: string
  sender: User
}

export interface CompanyInvitation {
  id: string
  companyId: string
  phone: string | null
  email: string | null
  role: 'admin' | 'member' | 'guest'
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: string
  createdAt: string
}

export interface Bot {
  id: string
  companyId: string
  name: string
  avatarUrl: string | null
  description: string | null
  type: 'cfo' | 'marketing' | 'hr' | 'support' | 'devops' | 'accounting' | 'custom'
  systemPrompt: string
  modelId: string
  temperature: number
  maxTokens: number
  isActive: boolean
  createdAt: string
}

export interface BotTemplate {
  id: string
  name: string
  description: string
  category: string
  defaultSystemPrompt: string
  defaultModelId: string
  iconUrl: string | null
}

export interface BotTask {
  id: string
  botId: string
  chatId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  input: string | null
  output: string | null
  tokensUsed: number | null
  durationMs: number | null
  createdAt: string
}

export interface Story {
  id: string
  userId: string
  companyId: string | null
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption: string | null
  privacyLevel: 'everyone' | 'contacts' | 'closeFriends' | 'selected'
  expiresAt: string
  createdAt: string
  user: User
  viewed?: boolean
}

export interface StoryGroup {
  user: User
  stories: Story[]
}

export interface StoryView {
  id: string
  storyId: string
  viewerId: string
  reaction: string | null
  viewedAt: string
  viewer: User
}

export interface SearchResults {
  chats: Chat[]
  users: User[]
  messages: Message[]
}

export interface NotificationSettings {
  id: string
  userId: string
  chatId: string
  muted: boolean
  mutedUntil: string | null
  customSound: string | null
}

export interface PrivacySettings {
  lastSeen: 'everybody' | 'contacts' | 'nobody'
  phone: 'everybody' | 'contacts' | 'nobody'
  profilePhoto: 'everybody' | 'contacts' | 'nobody'
  forwarding: boolean
  readReceipts: boolean
}

export interface ChannelPermissions {
  sendMessages: boolean
  sendMedia: boolean
  pinMessages: boolean
  addMembers: boolean
}

export interface ChatMember {
  id: string
  chatId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  permissions: ChannelPermissions
  user: User
  joinedAt: string
}

export interface InviteLink {
  token: string
  createdBy: string
  expiresAt: string
  createdAt: string
}

export interface GroupReadReceipt {
  id: string
  messageId: string
  userId: string
  user: User
  readAt: string
}

export interface PlaygroundPreset {
  id: string
  name: string
  systemPrompt: string
  modelId: string
  temperature: number
  maxTokens: number
  companyId: string
  createdAt: string
}

export interface PlaygroundMessage {
  role: 'user' | 'assistant'
  content: string
  tokensUsed?: number
  latencyMs?: number
}

export interface KnowledgeBase {
  knowledgeBaseId: string
  name: string
  description: string | null
  status: 'CREATING' | 'ACTIVE' | 'DELETING' | 'UPDATING' | 'FAILED'
  updatedAt: string
}

export interface KBRetrievalResult {
  content: string
  score: number
  sourceUri?: string
  metadata?: Record<string, string>
}

export interface KBRagResult {
  answer: string
  citations: { generatedText: string; references: { sourceUri: string; content: string }[] }[]
}

export interface Guardrail {
  guardrailId: string
  guardrailArn: string
  name: string
  description: string | null
  status: 'READY' | 'CREATING' | 'UPDATING' | 'DELETING' | 'VERSIONING' | 'FAILED'
  version: string
  createdAt: string
  updatedAt: string
}

export interface GuardrailDetail extends Guardrail {
  blockedInputMessaging: string
  blockedOutputsMessaging: string
  contentPolicy?: {
    filters: { type: string; inputStrength: string; outputStrength: string }[]
  }
  topicPolicy?: {
    topics: { name: string; definition: string; type: string }[]
  }
  wordPolicy?: {
    words: { text: string }[]
    managedWordLists: { type: string }[]
  }
  sensitiveInformationPolicy?: {
    piiEntities: { type: string; action: string }[]
    regexes: { name: string; pattern: string; action: string }[]
  }
}

export interface GuardrailTestResult {
  action: 'NONE' | 'GUARDRAIL_INTERVENED'
  outputs: { text: string }[]
  assessments: Record<string, unknown>[]
}

export interface ImageGeneration {
  id: string
  prompt: string
  negativePrompt: string | null
  taskType: 'TEXT_IMAGE' | 'INPAINTING' | 'OUTPAINTING' | 'IMAGE_VARIATION' | 'BACKGROUND_REMOVAL'
  resultUrl: string
  width: number
  height: number
  params: Record<string, unknown>
  companyId: string
  userId: string
  createdAt: string
}

export interface AIUsageSummary {
  totalTokens: number
  totalTasks: number
  completedTasks: number
  failedTasks: number
  avgResponseMs: number
  activeBots: number
  estimatedCost: number
  budgetLimit: number | null
}

export interface AIUsageDaily {
  date: string
  tokens: number
  tasks: number
}

export interface AIUsageByModel {
  modelId: string
  tokens: number
  tasks: number
  avgResponseMs: number
}

export interface AIUsageByBot {
  botId: string
  botName: string
  botType: string
  tokens: number
  tasks: number
}

export interface AgentDefinition {
  id: string
  name: string
  description: string | null
  modelId: string
  instruction: string
  actionGroups: AgentActionGroup[]
  knowledgeBaseIds: string[]
  bedrockAgentId: string | null
  bedrockAliasId: string | null
  status: 'draft' | 'deploying' | 'active' | 'failed'
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface AgentActionGroup {
  name: string
  description: string
  lambdaArn?: string
  apiSchema?: string
}
