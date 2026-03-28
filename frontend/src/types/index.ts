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

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  replyToId: string | null
  createdAt: string
  updatedAt: string
  sender: User
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
