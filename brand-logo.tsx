import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  size = 'md',
  showText = true,
  showSlogan = false,
  variant = 'onLight',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showSlogan?: boolean
  variant?: 'onLight' | 'onDark'
  className?: string
}) {
  const box = size === 'lg' ? 'h-32 w-56' : size === 'sm' ? 'h-9 w-16' : 'h-24 w-40'
  const titleSize = size === 'lg' ? 'text-xl' : 'text-base'
  const onDark = variant === 'onDark'

  return (
    <div className={cn(size === 'sm' ? 'flex items-center gap-2' : 'flex flex-col items-center justify-center gap-3 text-center', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-xl border',
          onDark ? 'border-white/20 bg-white' : 'border-sand-dark bg-cream',
          box,
        )}
        aria-hidden="true"
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%2B941-250-4430%20%283%29-84sILu7krc4r0DnIEE4yiYuWzVpnzX.jpg"
          alt="M.A.B Marketing logo"
          width={1050}
          height={600}
          priority
          className="h-full w-full object-contain object-center"
        />
      </div>
      {showText && (
        <div className="min-w-0 text-center leading-tight">
          <div className={cn('font-semibold', titleSize, onDark ? 'text-white' : 'text-taupe')}>
            M.A.B Marketing
          </div>
          {showSlogan ? (
            <div
              className={cn(
                'font-script text-lg leading-none',
                onDark ? 'text-white/80' : 'text-taupe-light',
              )}
            >
              Your success is my success!
            </div>
          ) : (
            <div
              className={cn(
                'font-script text-lg leading-none',
                onDark ? 'text-white/80' : 'text-taupe-light',
              )}
            >
              Your success is my success!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
