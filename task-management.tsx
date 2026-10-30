'use client'

import { useRef, useState } from 'react'
import { Plus, Trash2, Check, Clock, ChevronDown, Paperclip, FileText, ImageIcon, Film, Link2, X } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { ASSIGNEES, daysElapsed, type Assignee, type TaskAttachment, type TaskAttachmentKind, type Urgency } from '@/lib/data'
import type { TranslationKey } from '@/lib/i18n'

const ATTACHMENT_ICON: Record<TaskAttachmentKind, typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  video: Film,
  link: Link2,
}

function kindFromFile(f: File): TaskAttachmentKind {
  if (f.type.startsWith('image/')) return 'image'
  if (f.type.startsWith('video/')) return 'video'
  return 'pdf'
}

let attId = 0
const nextAttId = () => `att${Date.now()}_${attId++}`

const URGENCIES: { key: Urgency; label: TranslationKey; dot: string }[] = [
  { key: 'urgentToday', label: 'tasks_urgent_today', dot: 'bg-rose-500' },
  { key: 'urgentWeek', label: 'tasks_urgent_week', dot: 'bg-amber-500' },
  { key: 'duringMonth', label: 'tasks_urgent_month', dot: 'bg-taupe-soft' },
]

const ASSIGNEE_LABELS: Record<Assignee, TranslationKey> = {
  Maya: 'tasks_tab_maya',
  Evelyn: 'tasks_tab_evelyn',
  'New Employee': 'tasks_tab_new',
}

export function TasksCenter() {
  const { t, role, tasks, clientFolders, addTask, toggleTask, deleteTask } = useApp()
  const [tab, setTab] = useState<Assignee>('Maya')
  const [clientFilter, setClientFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignee: 'Maya' as Assignee,
    urgency: 'urgentWeek' as Urgency,
    client: clientFolders[0]?.name ?? '',
  })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files).map((f) => ({
      id: nextAttId(),
      kind: kindFromFile(f),
      name: f.name,
    }))
    setAttachments((prev) => [...prev, ...next])
  }

  const addLink = () => {
    if (!linkUrl.trim()) return
    setAttachments((prev) => [
      ...prev,
      { id: nextAttId(), kind: 'link', name: linkLabel.trim() || linkUrl.trim(), url: linkUrl.trim() },
    ])
    setLinkLabel('')
    setLinkUrl('')
  }

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id))

  const canDelete = role === 'ceo'
  const inputClass =
    'rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'

  // CEO sees every assignee's board. Employees only see the tasks assigned to them.
  const scopedAssignee: Assignee | null = role === 'employee' ? 'Evelyn' : null
  const activeTab: Assignee = role === 'ceo' ? tab : scopedAssignee ?? tab

  const visible = tasks.filter(
    (tk) => tk.assignee === activeTab && (clientFilter === 'all' || tk.client === clientFilter),
  )
  const open = visible.filter((tk) => !tk.done)
  const done = visible.filter((tk) => tk.done)

  const urgencyOrder: Record<Urgency, number> = { urgentToday: 0, urgentWeek: 1, duringMonth: 2 }
  open.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

  const submit = () => {
    if (!form.title.trim()) return
    addTask({
      title: form.title,
      description: form.description,
      assignee: form.assignee,
      urgency: form.urgency,
      client: form.client,
      attachments: attachments.length ? attachments : undefined,
    })
    setForm({ ...form, title: '', description: '' })
    setAttachments([])
    setLinkLabel('')
    setLinkUrl('')
    setShowForm(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-taupe">{t('tasks_center')}</h1>
          <p className="mt-1 text-taupe-light">{t('tasks_subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light"
        >
          <Plus className="h-4 w-4" />
          {t('tasks_newTask')}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {role === 'ceo' && (
          <div className="flex rounded-lg border border-sand-dark bg-card p-1">
            {ASSIGNEES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setTab(a)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  tab === a ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
                }`}
              >
                {t(ASSIGNEE_LABELS[a])}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-taupe-light">{t('tasks_filterClient')}</span>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className={inputClass}
          >
            <option value="all">{t('tasks_allClients')}</option>
            <option value="Leads">{t('tasks_leads')}</option>
            {clientFolders.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-sand-dark bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('tasks_taskTitle')}
              className={`sm:col-span-2 lg:col-span-4 ${inputClass}`}
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('tasks_taskDescription')}
              rows={3}
              className={`resize-none sm:col-span-2 lg:col-span-4 ${inputClass}`}
            />
            <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value as Assignee })} className={inputClass}>
              {ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {t(ASSIGNEE_LABELS[a])}
                </option>
              ))}
            </select>
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as Urgency })} className={inputClass}>
              {URGENCIES.map((u) => (
                <option key={u.key} value={u.key}>
                  {t(u.label)}
                </option>
              ))}
            </select>
            <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className={`sm:col-span-2 ${inputClass}`}>
              {clientFolders.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attachments — file (PDF / image / video) or link */}
          <div className="mt-3 rounded-lg border border-sand-dark bg-secondary p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-taupe">
              <Paperclip className="h-3.5 w-3.5" />
              {t('tasks_addContent')}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-sand-dark bg-card px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand"
              >
                <Paperclip className="h-3.5 w-3.5" />
                {t('tasks_attachFile')}
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder={t('tasks_linkLabel')}
                className={`w-32 grow ${inputClass} py-1.5 text-xs`}
              />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={t('tasks_linkUrl')}
                className={`w-40 grow ${inputClass} py-1.5 text-xs`}
              />
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 rounded-lg border border-sand-dark bg-card px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand"
              >
                <Link2 className="h-3.5 w-3.5" />
                {t('tasks_addLink')}
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {attachments.map((a) => {
                  const Icon = ATTACHMENT_ICON[a.kind]
                  return (
                    <span
                      key={a.id}
                      className="flex items-center gap-1.5 rounded-full border border-sand-dark bg-card px-2.5 py-1 text-[11px] text-taupe"
                    >
                      <Icon className="h-3 w-3 shrink-0 text-taupe-light" />
                      <span className="max-w-40 truncate">{a.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="shrink-0 rounded-full p-0.5 text-taupe-light hover:bg-rose-50 hover:text-rose-600"
                        aria-label={t('delete')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={submit} className="rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light">
              {t('tasks_add')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-sand-dark px-4 py-2 text-sm text-taupe hover:bg-sand">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Open tasks */}
      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-taupe-light">
          {t('tasks_open')} ({open.length})
        </div>
        {open.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sand-dark py-10 text-center text-sm text-taupe-soft">
            {t('tasks_empty')}
          </div>
        ) : (
          <div className="space-y-2">
            {open.map((tk) => {
              const u = URGENCIES.find((x) => x.key === tk.urgency)!
              const elapsed = daysElapsed(tk.createdDate)
              const isOpen = expanded === tk.id
              return (
                <div key={tk.id} className="rounded-xl border border-sand-dark bg-card">
                  <div className="flex items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(tk.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-sand-dark text-transparent hover:border-taupe"
                      aria-label={t('tasks_completed')}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => (tk.description || tk.attachments?.length) && setExpanded(isOpen ? null : tk.id)}
                      className="min-w-0 flex-1 text-start"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">{tk.title}</span>
                        {(tk.description || tk.attachments?.length) && (
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-taupe-light transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-taupe-light">
                        <span className="inline-flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${u.dot}`} />
                          {t(u.label)}
                        </span>
                        <span>· {tk.client}</span>
                        <span className="inline-flex items-center gap-1">
                          · <Clock className="h-3 w-3" />
                          {elapsed} {elapsed === 1 ? t('tasks_dayElapsed') : t('tasks_daysElapsed')}
                        </span>
                        {tk.attachments && tk.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            · <Paperclip className="h-3 w-3" />
                            {tk.attachments.length}
                          </span>
                        )}
                      </div>
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteTask(tk.id)}
                        title={t('tasks_ceoOnlyDelete')}
                        className="shrink-0 rounded-md p-1 text-taupe-light hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {isOpen && (tk.description || tk.attachments?.length) && (
                    <div className="border-t border-sand-dark px-3 py-2.5 ps-11">
                      {tk.description && (
                        <div className="text-sm leading-relaxed text-taupe-light">{tk.description}</div>
                      )}
                      {tk.attachments && tk.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tk.attachments.map((a) => {
                            const Icon = ATTACHMENT_ICON[a.kind]
                            const chip = (
                              <span className="flex items-center gap-1.5 rounded-full border border-sand-dark bg-secondary px-2.5 py-1 text-[11px] text-taupe">
                                <Icon className="h-3 w-3 shrink-0 text-taupe-light" />
                                <span className="max-w-40 truncate">{a.name}</span>
                              </span>
                            )
                            return a.kind === 'link' && a.url ? (
                              <a
                                key={a.id}
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t('tasks_openLink')}
                                className="transition hover:opacity-80"
                              >
                                {chip}
                              </a>
                            ) : (
                              <span key={a.id}>{chip}</span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed history */}
      {done.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-taupe-light">
            {t('tasks_completed')} ({done.length})
          </div>
          <div className="space-y-2">
            {done.map((tk) => (
              <div key={tk.id} className="flex items-center gap-3 rounded-xl border border-sand-dark bg-secondary p-3">
                <button
                  type="button"
                  onClick={() => toggleTask(tk.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-taupe text-white"
                  aria-label={t('tasks_open')}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-taupe-light line-through">{tk.title}</div>
                  <div className="text-[11px] text-taupe-soft">{tk.client}</div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => deleteTask(tk.id)}
                    className="shrink-0 rounded-md p-1 text-taupe-light hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
