import { useState, useEffect } from 'react'
import { Image, Download, Loader2, Sparkles, X } from 'lucide-react'
import AINavTabs from '../components/ai/AINavTabs'
import { useImageGenStore } from '../stores/imageGenStore'
import { useCompanyStore } from '../stores/companyStore'
import { cn } from '../lib/utils'

const DIMENSION_PRESETS = [
  { label: '1024×1024', w: 1024, h: 1024 },
  { label: '1024×768', w: 1024, h: 768 },
  { label: '768×1024', w: 768, h: 1024 },
  { label: '512×512', w: 512, h: 512 },
] as const

export default function ImageGenerationPage() {
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const { generations, currentImage, generating, fetchHistory, generateImage } =
    useImageGenStore()

  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [cfgScale, setCfgScale] = useState(8)
  const [seed, setSeed] = useState(0)
  const [provider, setProvider] = useState<'bedrock' | 'gemini'>('bedrock')

  useEffect(() => {
    if (activeCompany) fetchHistory(activeCompany.id)
  }, [activeCompany, fetchHistory])

  if (!activeCompany) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Select a company to continue
      </div>
    )
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    generateImage(activeCompany.id, {
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      width,
      height,
      cfgScale: provider === 'bedrock' ? cfgScale : undefined,
      seed: provider === 'bedrock' && seed ? seed : undefined,
      provider,
    })
  }

  const handleDownload = () => {
    if (!currentImage) return
    const a = document.createElement('a')
    a.href = currentImage
    a.download = `holio-image-${Date.now()}.png`
    a.click()
  }

  const selectedPreset = `${width}×${height}`

  return (
    <div className="flex h-full flex-col bg-holio-offwhite">
      <AINavTabs />

      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="flex items-center gap-2 text-xl font-bold text-holio-dark">
          <Sparkles className="h-5 w-5 text-holio-orange" />
          Image Generation
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate images with {provider === 'gemini' ? 'Google Gemini Imagen' : 'AWS Bedrock Nova Canvas'}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 gap-6 overflow-hidden p-6">
        <div className="flex w-[360px] shrink-0 flex-col gap-5 overflow-y-auto rounded-xl border border-gray-200 bg-white p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Provider
            </label>
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              <button
                onClick={() => setProvider('bedrock')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  provider === 'bedrock'
                    ? 'bg-holio-orange text-white'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                Nova Canvas
              </button>
              <button
                onClick={() => setProvider('gemini')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  provider === 'gemini'
                    ? 'bg-holio-orange text-white'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                Gemini Imagen
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-holio-orange focus:outline-none focus:ring-1 focus:ring-holio-orange"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Negative Prompt
            </label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid in the image..."
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-holio-orange focus:outline-none focus:ring-1 focus:ring-holio-orange"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Dimensions
            </label>
            <div className="flex flex-wrap gap-2">
              {DIMENSION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setWidth(preset.w)
                    setHeight(preset.h)
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    selectedPreset === preset.label
                      ? 'border-holio-orange bg-holio-orange text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-holio-orange hover:text-holio-orange',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {provider === 'bedrock' && (
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700">
              CFG Scale
              <span className="text-xs font-normal text-gray-400">{cfgScale}</span>
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={cfgScale}
              onChange={(e) => setCfgScale(Number(e.target.value))}
              className="w-full accent-holio-orange"
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>1</span>
              <span>15</span>
            </div>
          </div>
          )}

          {provider === 'bedrock' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Seed
            </label>
            <input
              type="number"
              min={0}
              value={seed}
              onChange={(e) => setSeed(Math.max(0, Number(e.target.value)))}
              placeholder="0 = random"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-holio-orange focus:outline-none focus:ring-1 focus:ring-holio-orange"
            />
          </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className={cn(
              'mt-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors',
              generating || !prompt.trim()
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-holio-orange hover:bg-orange-500',
            )}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
            {generating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-holio-orange" />
                  <span className="text-sm font-medium text-gray-500">
                    Generating your image…
                  </span>
                </div>
              </div>
            )}

            {currentImage ? (
              <div className="relative flex h-full w-full items-center justify-center p-4">
                <img
                  src={currentImage}
                  alt="Generated"
                  className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                />
                <button
                  onClick={() => useImageGenStore.setState({ currentImage: null })}
                  className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-holio-orange px-3 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-orange-500"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <Image className="h-16 w-16" />
                <span className="text-sm text-gray-400">
                  Your generated image will appear here
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {generations.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            History
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {generations.map((gen) => (
              <button
                key={gen.id}
                onClick={() =>
                  useImageGenStore.setState({ currentImage: gen.resultUrl })
                }
                className={cn(
                  'h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                  currentImage === gen.resultUrl
                    ? 'border-holio-orange'
                    : 'border-transparent hover:border-holio-lavender',
                )}
              >
                <img
                  src={gen.resultUrl}
                  alt={gen.prompt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
