export enum CompanyRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum InvitationRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ChatType {
  DM = 'dm',
  GROUP = 'group',
  COMPANY_CHANNEL = 'companyChannel',
  CROSS_COMPANY = 'crossCompany',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  VIDEO_NOTE = 'videoNote',
  FILE = 'file',
  GIF = 'gif',
  STICKER = 'sticker',
  POLL = 'poll',
  CONTACT = 'contact',
  LOCATION = 'location',
  BOT_ACTION = 'botAction',
  BOT_RESULT = 'botResult',
  SYSTEM = 'system',
}

export enum SenderType {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export enum ChatMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum BotType {
  CFO = 'cfo',
  MARKETING = 'marketing',
  HR = 'hr',
  SUPPORT = 'support',
  DEVOPS = 'devops',
  ACCOUNTING = 'accounting',
  CUSTOM = 'custom',
}

export enum BotTaskStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum StoryPrivacy {
  EVERYONE = 'everyone',
  CONTACTS = 'contacts',
  CLOSE_FRIENDS = 'closeFriends',
  SELECTED = 'selected',
}
