'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { TopBar } from '@/components/top-bar'
import { SiteFooter } from '@/components/site-footer'
import { Overview } from '@/components/views/overview'
import { LeadsCRM } from '@/components/views/leads-crm'
import { TasksCenter } from '@/components/views/task-management'
import { ActiveClients } from '@/components/views/client-folders'
import { ApprovalCenter } from '@/components/views/client-approvals'
import { Employees } from '@/components/views/employees'
import { Finances } from '@/components/views/finances'
import { Invoices } from '@/components/views/invoices'
import { Reports } from '@/components/views/reports'
import { TeamChat } from '@/components/views/team-chat'
import { CalendarView } from '@/components/views/calendar-view'
import type { Role } from '@/lib/data'
import type { TranslationKey } from '@/lib/i18n'
import { LayoutDashboard, Users, ListChecks, FolderOpen, CheckSquare, UserCog, DollarSign, MessagesSquare, CalendarDays, FileText, BarChart3, X } from 'lucide-react'

type NavKey = 'overview' | 'leads' | 'tasks' | 'clients' | 'approvals' | 'employees' | 'finances' | 'invoices' | 'reports' | 'chat' | 'calendar'

type NavItem = {
  key: NavKey
  labelKey?: TranslationKey
  label?: string
  clientLabelKey?: TranslationKey // shown to clients when set
  icon: typeof LayoutDashboard
  roles: Role[]
}

const NAV: NavItem[] = [
  { key: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard, roles: ['ceo', 'client'] },
  { key: 'leads', labelKey: 'nav_leadsCrm', icon: Users, roles: ['ceo', 'employee'] },
  { key: 'tasks', labelKey: 'nav_tasksCenter', icon: ListChecks, roles: ['ceo'] },
  { key: 'calendar', labelKey: 'nav_calendar', icon: CalendarDays, roles: ['ceo', 'employee', 'client'] },
  { key: 'clients', labelKey: 'nav_clients', clientLabelKey: 'nav_myFolder', icon: FolderOpen, roles: ['ceo', 'employee', 'client'] },
  { key: 'approvals', labelKey: 'nav_approvalCenter', icon: CheckSquare, roles: ['ceo', 'employee', 'client'] },
  { key: 'employees', labelKey: 'nav_employees', icon: UserCog, roles: ['ceo', 'employee'] },
  { key: 'finances', labelKey: 'nav_finances', icon: DollarSign, roles: ['ceo'] },
  { key: 'invoices', label: 'חשבוניות', icon: FileText, roles: ['ceo'] },
  { key: 'reports', label: 'דוחות', icon: BarChart3, roles: ['ceo', 'employee'] },
  { key: 'chat', labelKey: 'nav_chat', icon: MessagesSquare, roles: ['ceo', 'employee', 'client'] },
]

export function DashboardShell() {
  const { t, role, dir } = useApp()
  const [active, setActive] = useState<NavKey>(role === 'client' ? 'clients' : 'overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = role === 'client'
    ? NAV.filter((item) => ['clients', 'calendar', 'approvals', 'chat'].includes(item.key))
    : NAV.filter((item) => role && item.roles.includes(role))

  function renderView() {
    switch (active) {
      case 'overview':
        return <Overview onNavigate={(k) => setActive(k)} />
      case 'leads':
        return <LeadsCRM />
      case 'tasks':
        return <TasksCenter />
      case 'clients':
        return <ActiveClients />
      case 'approvals':
        return <ApprovalCenter />
      case 'employees':
        return <Employees />
      case 'finances':
        return <Finances />
      case 'invoices':
        return <Invoices />
      case 'reports':
        return <Reports />
      case 'chat':
        return <TeamChat />
      case 'calendar':
        return <CalendarView />
      default:
        return <Overview onNavigate={(k) => setActive(k)} />
    }
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => {
              setActive(item.key)
              setMobileOpen(false)
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              item.key === 'chat' ? 'mt-auto border-t border-sand-dark pt-3' : ''
            } ${isActive ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'}`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{role === 'client' ? ({ clients: 'התיקייה שלי', calendar: 'לוח שנה ותכנון', approvals: 'מרכז אישורים', chat: 'צ׳אט צוות' } as Record<string, string>)[item.key] : item.label ?? (item.labelKey ? t(item.labelKey) : '')}</span>
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopBar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-sand-dark bg-card md:block border-e">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">{sidebar}</div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-taupe/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div
              className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full w-72 bg-card shadow-2xl`}
            >
              <div className="flex items-center justify-between border-b border-sand-dark p-4">
                <span className="text-sm font-semibold text-taupe">{t('menu')}</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-1 text-taupe-light hover:bg-secondary"
                  aria-label={t('close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{renderView()}</main>
      </div>
      <SiteFooter />
    </div>
  )
}

export type { NavKey }
