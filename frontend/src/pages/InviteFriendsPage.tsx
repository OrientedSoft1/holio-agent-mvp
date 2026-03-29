import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, Copy, Mail, MessageCircle, Link, Check } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function InviteFriendsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const username = user?.username ?? 'user'
  const inviteLink = `https://holio.app/invite/${username}`

  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedUsername, setCopiedUsername] = useState(false)

  const copyToClipboard = (text: string, type: 'link' | 'username') => {
    navigator.clipboard.writeText(text)
    if (type === 'link') {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else {
      setCopiedUsername(true)
      setTimeout(() => setCopiedUsername(false), 2000)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on Holio')
    const body = encodeURIComponent(`Hey! Join me on Holio Agent: ${inviteLink}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareMessage = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join me on Holio', text: `Hey! Join me on Holio Agent: ${inviteLink}`, url: inviteLink })
    } else {
      copyToClipboard(inviteLink, 'link')
    }
  }

  return (
    <div className="flex h-screen flex-col bg-holio-offwhite">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/contacts')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeft className="h-5 w-5 text-holio-text" />
        </button>
        <h1 className="text-lg font-bold text-holio-text">Invite Friends</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 rounded-2xl bg-gradient-to-br from-holio-orange to-orange-400 p-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Share2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Invite Friends to Holio</h2>
          <p className="mt-1 text-sm text-white/80">Share your link and connect instantly</p>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Your Invite Link</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="mb-3 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3">
            <p className="truncate text-sm text-holio-muted">{inviteLink}</p>
          </div>
          <button
            onClick={() => copyToClipboard(inviteLink, 'link')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-holio-orange py-3 text-sm font-semibold text-white hover:bg-orange-500"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Invite Link
              </>
            )}
          </button>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Share Via</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900">
          <button onClick={() => copyToClipboard(inviteLink, 'link')} className="flex w-full items-center gap-3 px-4 py-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-holio-orange/10">
              <Link className="h-5 w-5 text-holio-orange" />
            </div>
            <span className="text-sm font-medium text-holio-text">Copy Link</span>
          </button>
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <button onClick={shareMessage} className="flex w-full items-center gap-3 px-4 py-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-holio-lavender/30">
              <MessageCircle className="h-5 w-5 text-holio-lavender" />
            </div>
            <span className="text-sm font-medium text-holio-text">Share Message</span>
          </button>
          <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
          <button onClick={shareViaEmail} className="flex w-full items-center gap-3 px-4 py-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-holio-sage/30">
              <Mail className="h-5 w-5 text-holio-sage" />
            </div>
            <span className="text-sm font-medium text-holio-text">Email</span>
          </button>
        </div>

        <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-holio-muted">Your Username</p>
        <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-holio-text">@{username}</p>
            <button
              onClick={() => copyToClipboard(`@${username}`, 'username')}
              className="flex items-center gap-1.5 rounded-lg bg-holio-orange/10 px-3 py-1.5 text-xs font-semibold text-holio-orange hover:bg-holio-orange/20"
            >
              {copiedUsername ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
