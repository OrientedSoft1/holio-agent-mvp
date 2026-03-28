import { useState, useCallback } from 'react'
import { Bot, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BotMessageProps {
  content: string
  botName: string
  botType?: string
  timestamp: string
  isStreaming?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  cfo: 'bg-emerald-500',
  marketing: 'bg-purple-500',
  hr: 'bg-blue-500',
  support: 'bg-holio-orange',
  devops: 'bg-gray-500',
  custom: 'bg-holio-dark',
}

const COLLAPSE_THRESHOLD = 300

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="group relative my-2 rounded-lg bg-gray-900 text-sm">
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-1.5">
        <span className="text-xs text-gray-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-xs leading-relaxed text-gray-100">
          {code}
        </code>
      </pre>
    </div>
  )
}

function renderMarkdown(text: string) {
  const blocks: React.ReactNode[] = []
  const lines = text.split('\n')
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(
        <CodeBlock key={key++} code={codeLines.join('\n')} language={lang} />,
      )
      i++
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (
        i < lines.length &&
        (lines[i].startsWith('- ') || lines[i].startsWith('* '))
      ) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={key++} className="my-1 list-disc pl-5 text-sm">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push(
        <ol key={key++} className="my-1 list-decimal pl-5 text-sm">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    blocks.push(
      <p key={key++} className="text-sm leading-relaxed">
        {renderInline(line)}
      </p>,
    )
    i++
  }

  return blocks
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>,
      )
    } else if (match[3]) {
      parts.push(
        <em key={match.index} className="italic">
          {match[4]}
        </em>,
      )
    } else if (match[5]) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-holio-dark"
        >
          {match[6]}
        </code>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length === 1 ? parts[0] : parts
}

function extractCitations(text: string): { url: string; label: string }[] {
  const citations: { url: string; label: string }[] = []
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    citations.push({ label: match[1], url: match[2] })
  }
  return citations
}

export default function BotMessage({
  content,
  botName,
  botType = 'custom',
  timestamp,
}: BotMessageProps) {
  const [expanded, setExpanded] = useState(false)
  const color = TYPE_COLORS[botType] ?? TYPE_COLORS.custom
  const isLong = content.length > COLLAPSE_THRESHOLD
  const displayContent =
    isLong && !expanded ? content.slice(0, COLLAPSE_THRESHOLD) + '…' : content
  const citations = extractCitations(content)

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2.5 max-w-[70%]">
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              color,
            )}
          >
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 rounded-full bg-holio-lavender px-1 text-[9px] font-bold leading-tight text-holio-dark">
            AI
          </span>
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-holio-orange">
            {botName}
          </p>
          <div className="rounded-xl rounded-bl-sm border-l-4 border-holio-lavender bg-white px-4 py-3 shadow-sm">
            <div className="space-y-1 text-holio-text">
              {renderMarkdown(displayContent)}
            </div>

            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-holio-orange transition-colors hover:text-holio-orange/80"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}

            {citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
                {citations.map((c, idx) => (
                  <a
                    key={idx}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-holio-lavender/30 px-2 py-0.5 text-[10px] font-medium text-holio-dark transition-colors hover:bg-holio-lavender/50"
                  >
                    {c.label}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-1 flex items-center justify-end">
              <span className="text-[11px] text-holio-muted">{timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
