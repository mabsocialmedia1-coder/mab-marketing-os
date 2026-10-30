'use client'

import { Users, ListChecks, FolderOpen, CheckSquare } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import type { NavKey } from '@/components/dashboard-shell'

export function Overview({ onNavigate }: { onNavigate: (k: NavKey) => void }) {
  const { t, lang, role, leads, tasks, clientFolders, contentItems, paidCampaigns, planEntries } = useApp()

  const activeClients = clientFolders.filter((client) => client.active).length
  const activeLeads = leads.filter((l) => !l.archived).length
  const openTasks = tasks.filter((tk) => !tk.done).length
  const pendingApprovals =
    contentItems.filter((c) => c.stage === 'client_review').length +
    paidCampaigns.filter((c) => c.status === 'client').length
  const waitingDates = Object.values(planEntries).filter((entry) => entry.sentAt && !entry.decision).length

  const stats =
    role === 'client'
      ? [
          { key: 'calendar' as NavKey, label: 'Dates waiting for client', value: waitingDates, icon: CheckSquare, accent: true },
        ]
      : [
          { key: 'calendar' as NavKey, label: lang === 'he' ? 'לוח שנה ותכנון' : 'Calendar & Planning', value: waitingDates, icon: CheckSquare, accent: true },
          { key: 'leads' as NavKey, label: t('ov_leadsActive'), value: activeLeads, icon: Users, accent: false },
          { key: 'tasks' as NavKey, label: t('ov_openTasks'), value: openTasks, icon: ListChecks, accent: false },
          { key: 'clients' as NavKey, label: t('ov_clients'), value: activeClients, icon: FolderOpen, accent: false },
          { key: 'approvals' as NavKey, label: t('ov_pendingApprovals'), value: pendingApprovals, icon: CheckSquare, accent: false },
        ]

  const roleLabel =
    role === 'ceo' ? t('role_ceo') : role === 'employee' ? t('role_employee') : t('role_client')

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-sm text-taupe-light">
          {t('welcome')} · {roleLabel}
        </p>
        <h1 className="mt-1 text-pretty text-3xl font-semibold text-taupe">M.A.B Marketing</h1>
        <p className="mt-1 font-script text-2xl text-taupe-light">{t('slogan')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <button
              key={`${s.key}-${i}`}
              onClick={() => onNavigate(s.key)}
              className={`flex flex-col gap-3 rounded-2xl border p-5 text-start transition-colors ${
                s.accent
                  ? 'border-transparent bg-taupe text-white'
                  : 'border-sand-dark bg-card text-taupe hover:border-taupe-soft'
              }`}
            >
              <Icon className={`h-6 w-6 ${s.accent ? 'text-white' : 'text-taupe-light'}`} />
              <span className="text-3xl font-semibold">{s.value}</span>
              <span className={`text-sm ${s.accent ? 'text-white/80' : 'text-taupe-light'}`}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
