import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Copy, Mail, MessageSquare, Link, Check } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function InviteFriendsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedUsername, setCopiedUsername] = useState(false)

  const inviteLink = `https://holio.app/join/${user?.username || 'user'}`
  const username = user?.username ? `@${user.username}` : '@user'

  const copyToClipboard = async (text: string, type: 'link' | 'username') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'link') { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000) }
      else { setCopiedUsername(true); setTimeout(() => setCopiedUsername(false), 2000) }
    } catch { /* silent */ }
  }

  const shareMessage = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join me on Holio', text: `Chat with me on Holio Agent! ${inviteLink}`, url: inviteLink }) } catch { /* silent */ }
    } else {
      copyToClipboard(inviteLink, 'link')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#FCFCF8]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Invite Friends</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 rounded-2xl bg-gradient-to-br from-[#D1CBFB] to-[#FF9220] p-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Share2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Invite Friends to Holio</h2>
          <p className="mt-1 text-sm text-white/80">Share your invite link and connect with your team</p>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">Your Invite Link</p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="flex items-center gap-3">
            <Link className="h-4 w-4 flex-shrink-0 text-[#8E8E93]" />
            <span className="min-w-0 flex-1 truncate text-sm text-[#1A1A1A]">{inviteLink}</span>
            <button onClick={() => copyToClipboard(inviteLink, 'link')} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FF9220]/10 text-[#FF9220] hover:bg-[#FF9220]/20">
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copiedLink && <p className="mt-1 text-right text-xs text-green-600">Copied!</p>}
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">Share Via</p>
        <div className="mx-4 rounded-2xl bg-white">
          <button onClick={() => copyToClipboard(inviteLink, 'link')} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF9220]/10">
              <Copy className="h-4 w-4 text-[#FF9220]" />
            </div>
            <span className="text-sm text-[#1A1A1A]">Copy Link</span>
          </button>
          <div className="mx-4 border-t border-gray-100" />
          <button onClick={shareMessage} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-[#1A1A1A]">Share Message</span>
          </button>
          <div className="mx-4 border-t border-gray-100" />
          <a href={`mailto:?subject=Join me on Holio&body=Chat with me on Holio Agent! ${encodeURIComponent(inviteLink)}`} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Mail className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm text-[#1A1A1A]">Email</span>
          </a>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">Your Username</p>
        <div className="mx-4 rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#1A1A1A]">{username}</span>
            <button onClick={() => copyToClipboard(username, 'username')} className="flex items-center gap-1 text-xs font-medium text-[#FF9220]">
              {copiedUsername ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
