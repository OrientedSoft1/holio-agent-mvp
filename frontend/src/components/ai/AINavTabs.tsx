import { useLocation, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Database,
  Shield,
  Image,
  BarChart3,
  Workflow,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const AI_TABS = [
  { path: '/ai/playground', label: 'Playground', icon: MessageSquare },
  { path: '/ai/knowledge-bases', label: 'Knowledge Bases', icon: Database },
  { path: '/ai/guardrails', label: 'Guardrails', icon: Shield },
  { path: '/ai/image-generation', label: 'Image Gen', icon: Image },
  { path: '/ai/usage', label: 'Usage', icon: BarChart3 },
  { path: '/ai/agents', label: 'Agents', icon: Workflow },
]

export default function AINavTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4">
      {AI_TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-holio-orange text-holio-orange'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
