'use client'

import { AppProvider, useApp } from '@/components/app-provider'
import { TopBar } from '@/components/top-bar'
import { LoginModal } from '@/components/login-modal'
import { DashboardShell } from '@/components/dashboard-shell'
import { SiteFooter } from '@/components/site-footer'

function AppRoot() {
  const { role } = useApp()

  if (!role) {
    return (
      <div className="flex min-h-screen flex-col bg-sand text-taupe">
        <TopBar />
        <LoginModal />
        <SiteFooter />
      </div>
    )
  }

  return <DashboardShell />
}

export default function Page() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  )
}
