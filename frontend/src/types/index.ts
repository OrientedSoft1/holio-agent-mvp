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
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'videoNote' | 'gif' | 'system'
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
  name: string
  description: string | null
  avatarUrl: string | null
  modelId: string
  systemPrompt: string | null
  isPublic: boolean
  companyId: string
  createdAt: string
}
