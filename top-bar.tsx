'use client'

import { LogOut, Languages, Menu } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { BrandLogo } from '@/components/brand-logo'

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { lang, setLang, t, role, logout } = useApp()

  const roleLabel =
    role === 'ceo' ? t('role_ceo') : role === 'employee' ? t('role_employee') : role === 'client' ? t('role_client') : ''

  return (
    <header className="sticky top-0 z-30 border-b border-taupe/20 bg-taupe text-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {role && onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
              aria-label={t('menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <BrandLogo size="sm" variant="onDark" showText showSlogan={false} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs text-white/60">{t('loggedInAs')}</div>
            <div className="text-sm font-medium text-white">{roleLabel}</div>
          </div>

          <div className="flex overflow-hidden rounded-lg border border-white/20">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition ${
                lang === 'en'
                  ? 'bg-white text-taupe'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('he')}
              className={`px-3 py-1.5 text-sm transition ${
                lang === 'he'
                  ? 'bg-white text-taupe'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              עברית
            </button>
          </div>

          {role && (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 transition hover:bg-white/20 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
