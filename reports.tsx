'use client'

import { useMemo, useState } from 'react'
import { BarChart3, ChevronDown, Lightbulb } from 'lucide-react'
import { useApp } from '@/components/app-provider'

export function Reports() {
  const { campaignReports, clientFolders, role } = useApp()
  const [open, setOpen] = useState<string | null>(null)
  const visibleReports = useMemo(() => campaignReports.filter((report) => role === 'ceo' || clientFolders.some((client) => client.id === report.clientId)), [campaignReports, clientFolders, role])
  const grouped = clientFolders.map((client) => ({ client, reports: visibleReports.filter((report) => report.clientId === client.id) })).filter((group) => group.reports.length)

  return (
    <div className="mx-auto max-w-5xl">
      <header><p className="text-sm font-medium text-taupe-light">ביצועים ותובנות</p><h1 className="mt-1 text-2xl font-semibold text-taupe">דוחות לפי לקוח וחודש</h1><p className="mt-2 text-sm leading-6 text-taupe-light">דוחות קמפיינים, מדדים והמלצות מסודרים בתוך תיק הלקוח.</p></header>
      <div className="mt-6 space-y-4">
        {grouped.length ? grouped.map(({ client, reports }) => { const isOpen = open === client.id; return <section key={client.id} className="overflow-hidden rounded-2xl border border-sand-dark bg-card"><button type="button" onClick={() => setOpen(isOpen ? null : client.id)} className="flex w-full items-center gap-3 p-5 text-start hover:bg-secondary"><BarChart3 className="h-5 w-5 text-taupe-light" /><span className="min-w-0 flex-1"><span className="block font-semibold text-taupe">{client.name}</span><span className="text-xs text-taupe-light">{reports.length} דוחות</span></span><ChevronDown className={`h-5 w-5 text-taupe-light transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="space-y-3 border-t border-sand-dark p-4">{reports.map((report) => <article key={report.id} className="rounded-xl border border-sand-dark bg-background p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold text-taupe">{report.title}</h2><p className="mt-1 text-xs text-taupe-light">{formatMonth(report.periodStart ?? report.createdDate)} · {statusLabel(report.status)}</p></div><span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-taupe">{formatMonth(report.periodStart ?? report.createdDate)}</span></div><p className="mt-3 text-sm leading-6 text-foreground">{report.highlights}</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="rounded-lg bg-secondary p-3"><p className="text-xs font-semibold text-taupe">מדדים</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-taupe-light">{report.metrics}</p></div><div className="rounded-lg bg-secondary p-3"><p className="flex items-center gap-1 text-xs font-semibold text-taupe"><Lightbulb className="h-3.5 w-3.5" /> המלצות</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-taupe-light">{report.recommendations}</p></div></div></article>)}</div>}</section> }) : <div className="rounded-2xl border border-dashed border-sand-dark bg-card p-10 text-center text-sm text-taupe-light">אין עדיין דוחות להצגה.</div>}
      </div>
    </div>
  )
}

function formatMonth(value: string) { return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) }
function statusLabel(status: string) { return status === 'approved' || status === 'clientVisible' ? 'מאושר' : status === 'internalReview' ? 'בבדיקת מנהל' : 'טיוטה' }
