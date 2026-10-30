'use client'

import { useState } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { BrandLogo } from '@/components/brand-logo'

export function LoginModal() {
  const { t, login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-taupe/10 bg-card p-8 shadow-xl shadow-taupe/10">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BrandLogo size="lg" showText={false} />
          <div>
            <h1 className="text-2xl font-bold text-taupe">M.A.B Marketing</h1>
            <p className="mt-1 font-script text-2xl leading-none text-taupe-light">
              Your success is my success!
            </p>
            <p className="mt-2 text-sm text-taupe-light">{t('tagline')}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-border bg-cream/50 px-3 py-2.5 text-sm text-taupe outline-none placeholder:text-taupe-soft focus:border-taupe"
            placeholder={t('email')}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-cream/50 px-3 py-2.5 pe-11 text-sm text-taupe outline-none placeholder:text-taupe-soft focus:border-taupe"
              placeholder={t('password')}
              aria-label={t('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-taupe-light hover:bg-secondary hover:text-taupe focus:outline-none focus:ring-2 focus:ring-taupe/30"
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="button"
            disabled={busy || !email || !password}
            onClick={async () => { setBusy(true); setError(''); const result = await login(email, password); if (result.error) setError(result.error); setBusy(false) }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-taupe px-4 py-2.5 font-semibold text-white transition hover:bg-taupe-light"
          >
            {t('enter')}
            <ArrowRight className="h-4 w-4 flip-x" />
          </button>
        </div>
      </div>
    </div>
  )
}
