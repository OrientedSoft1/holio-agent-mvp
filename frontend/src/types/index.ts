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
  createdAt: string
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
  type: 'private' | 'group' | 'channel' | 'bot'
  name: string | null
  avatarUrl: string | null
  lastMessage: Message | null
  unreadCount: number
  companyId: string
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
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderType?: 'user' | 'bot' | 'system'
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'videoNote' | 'gif' | 'system' | 'botResult'
  fileUrl: string | null
  replyToId: string | null
  metadata: MessageMetadata | null
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
  type: 'cfo' | 'marketing' | 'hr' | 'support' | 'devops' | 'custom'
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
