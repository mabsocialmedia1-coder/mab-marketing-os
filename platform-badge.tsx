import type { ContentPlatform } from '@/lib/data'

const styles: Record<ContentPlatform, { bg: string; label: string }> = {
  Instagram: { bg: 'bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white', label: 'IG' },
  Facebook: { bg: 'bg-blue-600 text-white', label: 'FB' },
  LinkedIn: { bg: 'bg-sky-700 text-white', label: 'in' },
  TikTok: { bg: 'bg-neutral-900 text-white', label: 'TT' },
  YouTube: { bg: 'bg-red-600 text-white', label: 'YT' },
}

export function PlatformBadge({
  platform,
  className = '',
}: {
  platform: ContentPlatform
  className?: string
}) {
  const s = styles[platform]
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold ${s.bg} ${className}`}
      aria-label={platform}
    >
      {s.label}
    </span>
  )
}
