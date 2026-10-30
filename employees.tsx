'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { GoogleCalendarConnection } from '@/components/google-calendar-connection'
import {
  Mail,
  Phone,
  Users,
  ListChecks,
  MapPin,
  DollarSign,
  CalendarDays,
  UserPlus,
  Paperclip,
  Plus,
  ShieldCheck,
  Trash2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'
import {
  EMPLOYEE_RATE_TYPES,
  WORK_JOURNAL_TYPES,
  todayISO,
  monthLabel,
  type Employee,
  type EmployeePermissions,
  type EmployeeRateType,
  type EmployeeStatus,
  type WorkJournalType,
} from '@/lib/data'
import type { TranslationKey } from '@/lib/i18n'

const STATUS_STYLE: Record<EmployeeStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  onLeave: 'bg-amber-100 text-amber-700',
}

const RATE_LABEL: Record<EmployeeRateType, TranslationKey> = {
  hourly: 'emp_rate_hourly',
  monthly: 'emp_rate_monthly',
  project: 'emp_rate_project',
}

const JOURNAL_LABEL: Record<WorkJournalType, TranslationKey> = {
  workHours: 'emp_type_workHours',
  vacation: 'emp_type_vacation',
  sick: 'emp_type_sick',
  dayOff: 'emp_type_dayOff',
}

const JOURNAL_STYLE: Record<WorkJournalType, string> = {
  workHours: 'bg-sky-100 text-sky-700',
  vacation: 'bg-emerald-100 text-emerald-700',
  sick: 'bg-rose-100 text-rose-700',
  dayOff: 'bg-amber-100 text-amber-700',
}

const inputClass =
  'rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'

export function Employees() {
  const { t, role, lang } = useApp()
  const isManager = role === 'ceo'

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-taupe">{t('emp_title')}</h1>
  <p className="mt-1 text-sm text-taupe-light">{isManager ? t('emp_subtitle') : t('emp_selfSubtitle')}</p>
  <div className="mt-3"><GoogleCalendarConnection lang={lang} /></div>
  </header>


      {isManager ? <ManagerRoster /> : <SelfProfile />}

      <WorkJournal />
    </div>
  )
}

/* ---------------- Manager: full roster + add employee + permissions ---------------- */
function ManagerRoster() {
  const { t, employees, addEmployee } = useApp()
  const [showForm, setShowForm] = useState(false)

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-taupe">{t('emp_team')}</h2>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white hover:bg-taupe-light"
        >
          <UserPlus className="h-4 w-4" />
          {t('emp_addEmployee')}
        </button>
      </div>

      {showForm && <AddEmployeeForm onDone={() => setShowForm(false)} onSubmit={addEmployee} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {employees.map((e) => (
          <EmployeeCard key={e.id} employee={e} manager />
        ))}
      </div>
    </section>
  )
}

/* ---------------- Employee: only own profile ---------------- */
function SelfProfile() {
  const { t, employees, currentEmployeeId } = useApp()
  const me = employees.find((e) => e.id === currentEmployeeId)
  if (!me) return null
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-taupe">{t('emp_myProfile')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <EmployeeCard employee={me} manager={false} />
      </div>
    </section>
  )
}

/* ---------------- Employee card ---------------- */
function EmployeeCard({ employee: e, manager }: { employee: Employee; manager: boolean }) {
  const { t, lang, addEmployeeAttachment, setEmployeeStatus, deleteEmployee } = useApp()
  const [showPerms, setShowPerms] = useState(false)

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream text-sm font-semibold text-taupe">
          {e.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </span>
        <div className="min-w-0">
          <div className="truncate font-semibold text-taupe">{e.name}</div>
          <div className="truncate text-xs text-taupe-light">{lang === 'he' ? e.roleHe : e.role}</div>
        </div>
        <span className={`ms-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[e.status]}`}>
          {e.status === 'active' ? t('emp_active') : t('emp_onLeave')}
        </span>
      </div>

      {e.roleDescription && <p className="mt-3 text-xs leading-relaxed text-taupe-light">{e.roleDescription}</p>}

      <div className="mt-4 grid gap-1.5 text-xs text-taupe-light">
        <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{e.email}</span>
        <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{e.phone}</span>
        {e.address && <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{e.address}</span>}
        {e.rateType && (
          <span className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            {e.rateAmount ? `$${e.rateAmount.toLocaleString()}` : '—'} · {t(RATE_LABEL[e.rateType])}
          </span>
        )}
        {e.recruitedFrom && (
          <span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" />{t('emp_recruitedFrom')}: {e.recruitedFrom}</span>
        )}
        <span className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />{t('emp_startDate')}: {e.startDate || e.since}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <Users className="h-4 w-4 text-taupe-light" />
          <div>
            <div className="text-sm font-semibold text-taupe">{e.assignedClients}</div>
            <div className="text-[10px] text-taupe-soft">{t('emp_clients')}</div>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary px-3 py-2">
          <ListChecks className="h-4 w-4 text-taupe-light" />
          <div>
            <div className="text-sm font-semibold text-taupe">{e.openTasks}</div>
            <div className="text-[10px] text-taupe-soft">{t('emp_openTasks')}</div>
          </div>
        </div>
      </div>

      {/* Attachments — contracts & documents */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-taupe-light">{t('emp_attachments')}</span>
          {manager && (
            <label className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-taupe hover:text-taupe-light">
              <Plus className="h-3 w-3" />
              {t('emp_addAttachment')}
              <input
                type="file"
                className="hidden"
                onChange={(ev) => {
                  const file = ev.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => addEmployeeAttachment(e.id, { name: file.name, url: String(reader.result) })
                  reader.readAsDataURL(file)
                }}
              />
            </label>
          )}
        </div>
        {e.attachments && e.attachments.length > 0 ? (
          <div className="space-y-1">
            {e.attachments.map((a) => (
              <a
                key={a.id}
                href={a.url || '#'}
                download={a.name}
                className="flex items-center gap-2 rounded-lg border border-sand-dark bg-secondary px-2.5 py-1.5 text-xs text-taupe hover:bg-sand"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{a.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-taupe-soft">{t('emp_noAttachments')}</p>
        )}
      </div>

      {manager && <div className="mt-4 flex flex-wrap gap-2 border-t border-sand-dark pt-3"><button type="button" onClick={() => setEmployeeStatus(e.id, e.status === 'active' ? 'onLeave' : 'active')} className="rounded-lg border border-sand-dark px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand">{e.status === 'active' ? 'הפוך ללא פעיל' : 'הפעל עובד'}</button><button type="button" onClick={() => { if (window.confirm('למחוק את העובד?')) deleteEmployee(e.id) }} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">מחק עובד</button></div>}

      {/* Access permissions — manager only */}
      {manager && (
        <div className="mt-4 border-t border-sand-dark pt-3">
          <button
            type="button"
            onClick={() => setShowPerms((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-sand-dark px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('emp_manageAccess')}
          </button>
          {showPerms && <PermissionsEditor employee={e} onClose={() => setShowPerms(false)} />}
        </div>
      )}
    </div>
  )
}

/* ---------------- Permissions editor ---------------- */
function PermissionsEditor({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { t, clientFolders, updateEmployeePermissions } = useApp()
  const initial: EmployeePermissions = employee.permissions ?? {
    allClients: false,
    clientIds: [],
    folderTabs: [],
    canSeeContracts: false,
    leadsAccess: 'add',
  }
  const [perms, setPerms] = useState<EmployeePermissions>(initial)

  const toggleClient = (id: string) =>
    setPerms((p) => ({
      ...p,
      clientIds: p.clientIds.includes(id) ? p.clientIds.filter((c) => c !== id) : [...p.clientIds, id],
    }))

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-sand-dark bg-secondary p-3">
      <p className="text-[11px] text-taupe-light">{t('emp_permHint')}</p>

      <label className="flex items-center gap-2 text-xs font-medium text-taupe">
        <input
          type="checkbox"
          checked={perms.allClients}
          onChange={(e) => setPerms((p) => ({ ...p, allClients: e.target.checked }))}
          className="h-4 w-4 rounded border-sand-dark accent-taupe"
        />
        {t('emp_permAllClients')}
      </label>

      {!perms.allClients && (
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-taupe-light">{t('emp_permSpecificClients')}</div>
          <div className="flex flex-wrap gap-1.5">
            {clientFolders.map((c) => {
              const on = perms.clientIds.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClient(c.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    on ? 'bg-taupe text-white' : 'border border-sand-dark text-taupe hover:bg-sand'
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-xs font-medium text-taupe">
        <input
          type="checkbox"
          checked={perms.canSeeContracts}
          onChange={(e) => setPerms((p) => ({ ...p, canSeeContracts: e.target.checked }))}
          className="h-4 w-4 rounded border-sand-dark accent-taupe"
        />
        {t('emp_permContracts')}
      </label>

      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-taupe-light">{t('emp_permLeads')}</div>
        <select
          value={perms.leadsAccess ?? 'add'}
          onChange={(e) => setPerms((p) => ({ ...p, leadsAccess: e.target.value as 'add' | 'full' }))}
          className="w-full rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-taupe"
        >
          <option value="add">{t('emp_permLeads_add')}</option>
          <option value="full">{t('emp_permLeads_full')}</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            updateEmployeePermissions(employee.id, perms)
            onClose()
          }}
          className="rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light"
        >
          {t('save')}
        </button>
        <button type="button" onClick={onClose} className="rounded-lg border border-sand-dark px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand">
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Add employee form ---------------- */
function genEmpUsername(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'staff'
  return `${base}${Math.floor(100 + Math.random() * 900)}`
}
function genEmpPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const sym = '!@#$%&*'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out + sym[Math.floor(Math.random() * sym.length)] + Math.floor(10 + Math.random() * 90)
}

function AddEmployeeForm({
  onDone,
  onSubmit,
}: {
  onDone: () => void
  onSubmit: ReturnType<typeof useApp>['addEmployee']
}) {
  const { t, lang } = useApp()
  const he = lang === 'he'
  const blank = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    roleHe: '',
    roleDescription: '',
    rateType: 'monthly' as EmployeeRateType,
    rateAmount: '',
    recruitedFrom: '',
    startDate: '',
  }
  const [form, setForm] = useState(blank)
  const [username, setUsername] = useState(genEmpUsername(''))
  const [password, setPassword] = useState(genEmpPassword())
  const [showPw, setShowPw] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  }

  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.email.trim() && username.trim() && password.trim()

  const submit = () => {
    if (!canSubmit) return
    onSubmit({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      role: form.role || 'Team Member',
      roleHe: form.roleHe || form.role || 'עובד/ת',
      roleDescription: form.roleDescription,
      rateType: form.rateType,
      rateAmount: Number(form.rateAmount) || 0,
      recruitedFrom: form.recruitedFrom,
      startDate: form.startDate,
      attachments: [],
      permissions: { allClients: false, clientIds: [], folderTabs: [], canSeeContracts: false, leadsAccess: 'add' },
      username: username.trim(),
      password: password.trim(),
    })
    setForm(blank)
    setUsername(genEmpUsername(''))
    setPassword(genEmpPassword())
    onDone()
  }

  return (
    <div className="mb-4 space-y-2 rounded-2xl border border-sand-dark bg-card p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={form.firstName} onChange={(e) => { setForm({ ...form, firstName: e.target.value }); setUsername(genEmpUsername(`${e.target.value}${form.lastName}`)) }} placeholder={t('emp_firstName')} className={inputClass} />
        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder={t('emp_lastName')} className={inputClass} />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('emp_email')} type="email" className={inputClass} />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('emp_phone')} className={inputClass} />
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t('emp_address')} className={`sm:col-span-2 ${inputClass}`} />
        <input value={form.recruitedFrom} onChange={(e) => setForm({ ...form, recruitedFrom: e.target.value })} placeholder={t('emp_recruitedFrom')} className={inputClass} />
        <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="date" className={inputClass} />
        <div className="flex gap-2">
          <select value={form.rateType} onChange={(e) => setForm({ ...form, rateType: e.target.value as EmployeeRateType })} className={`flex-1 ${inputClass}`}>
            {EMPLOYEE_RATE_TYPES.map((r) => <option key={r} value={r}>{t(RATE_LABEL[r])}</option>)}
          </select>
          <input value={form.rateAmount} onChange={(e) => setForm({ ...form, rateAmount: e.target.value })} placeholder={t('emp_rate')} type="number" className={`flex-1 ${inputClass}`} />
        </div>
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder={t('emp_role')} className={inputClass} />
      </div>
      <textarea
        value={form.roleDescription}
        onChange={(e) => setForm({ ...form, roleDescription: e.target.value })}
        placeholder={t('emp_roleDesc')}
        rows={2}
        className={`w-full resize-none ${inputClass}`}
      />

      {/* Generated portal login for the new employee */}
      <div className="rounded-xl border border-sand-dark bg-secondary p-3" dir={he ? 'rtl' : 'ltr'}>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-taupe">
          <KeyRound className="h-3.5 w-3.5" />
          {he ? 'פרטי כניסה לעובד/ת' : 'Employee login'}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={he ? 'שם משתמש' : 'Username'} className={`flex-1 ${inputClass}`} />
            <button type="button" onClick={() => copy('u', username)} className="rounded-md border border-sand-dark p-2 text-taupe hover:bg-sand" title={he ? 'העתק' : 'Copy'}>
              {copied === 'u' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={he ? 'סיסמה' : 'Password'}
              className={`flex-1 font-mono ${inputClass}`}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="rounded-md border border-sand-dark p-2 text-taupe hover:bg-sand" title={showPw ? (he ? 'הסתר' : 'Hide') : (he ? 'הצג' : 'Show')}>
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => copy('p', password)} className="rounded-md border border-sand-dark p-2 text-taupe hover:bg-sand" title={he ? 'העתק' : 'Copy'}>
              {copied === 'p' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => { setUsername(genEmpUsername(`${form.firstName}${form.lastName}`)); setPassword(genEmpPassword()) }} className="rounded-md border border-sand-dark p-2 text-taupe hover:bg-sand" title={he ? 'הפק מחדש' : 'Regenerate'}>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('emp_addEmployee')}
        </button>
        <button type="button" onClick={onDone} className="rounded-lg border border-sand-dark px-4 py-2 text-sm font-medium text-taupe hover:bg-sand">
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Work journal (shared — everyone sees everyone) ---------------- */
function WorkJournal() {
  const { t, lang, employees, workJournal, currentEmployeeId, addWorkJournalEntry, deleteWorkJournalEntry, role } = useApp()
  const nameById = (id: string) => employees.find((e) => e.id === id)?.name ?? '—'

  const today = todayISO()
  const [ty, tm] = today.split('-').map(Number)
  const [cursor, setCursor] = useState({ year: ty, month: tm - 1 })
  const [selected, setSelected] = useState<string>(today)
  const [showForm, setShowForm] = useState(false)

  const iso = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const blankFor = (date: string) => ({
    employeeId: currentEmployeeId ?? employees[0]?.id ?? '',
    type: 'workHours' as WorkJournalType,
    date,
    hours: '',
    note: '',
  })
  const [form, setForm] = useState(blankFor(today))

  const entriesFor = (date: string) => workJournal.filter((w) => w.date === date)

  // Build the month grid (same pattern as the content calendar)
  const first = new Date(cursor.year, cursor.month, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const weekDays = lang === 'he' ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthKey = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`

  const shiftMonth = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const openAdd = (date: string) => {
    setSelected(date)
    setForm(blankFor(date))
    setShowForm(true)
  }

  const submit = () => {
    const employeeId = role === 'employee' ? currentEmployeeId : form.employeeId
    if (!employeeId || !form.date) return
    addWorkJournalEntry({
      employeeId,
      type: form.type,
      date: form.date,
      hours: form.type === 'workHours' ? Number(form.hours) || 0 : undefined,
      note: form.note || undefined,
    })
    setSelected(form.date)
    setForm(blankFor(form.date))
    setShowForm(false)
  }

  const selectedEntries = entriesFor(selected).filter((entry) => role === 'ceo' || entry.employeeId === currentEmployeeId)

  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-taupe">{t('emp_workJournal')}</h2>
      </div>
      <p className="mb-3 text-xs text-taupe-light">{t('emp_workJournalSub')}</p>

      {/* Month calendar */}
      <div className="rounded-2xl border border-sand-dark bg-card p-4">
        <div className="mb-3 flex items-center justify-center gap-1">
          <button type="button" onClick={() => shiftMonth(-1)} className="rounded-md border border-sand-dark p-1.5 text-taupe hover:bg-sand">
            <ChevronLeft className="h-4 w-4 flip-x" />
          </button>
          <span className="min-w-40 text-center text-sm font-semibold text-taupe">{monthLabel(monthKey, lang)}</span>
          <button type="button" onClick={() => shiftMonth(1)} className="rounded-md border border-sand-dark p-1.5 text-taupe hover:bg-sand">
            <ChevronRight className="h-4 w-4 flip-x" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-taupe-light">
          {weekDays.map((d, i) => (
            <div key={i} className="py-1 font-medium">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />
            const dayIso = iso(cursor.year, cursor.month, day)
            const dayEntries = entriesFor(dayIso)
            const isToday = dayIso === today
            const isSel = dayIso === selected
            return (
              <button
                type="button"
                key={dayIso}
                onClick={() => setSelected(dayIso)}
                className={`min-h-[64px] rounded-md border p-1 text-start align-top ${
                  isSel ? 'border-taupe bg-sand' : 'border-sand-dark bg-card'
                } ${isToday ? 'ring-1 ring-taupe' : ''}`}
              >
                <span className="text-[11px] font-medium text-taupe">{day}</span>
                <div className="mt-1 space-y-0.5">
                  {dayEntries.map((w) => (
                    <div
                      key={w.id}
                      title={`${nameById(w.employeeId)}${w.type === 'workHours' && w.hours != null ? ` · ${w.hours}h` : ''}${w.note ? ` · ${w.note}` : ''}`}
                      className={`truncate rounded px-1 py-0.5 text-[9px] font-medium ${JOURNAL_STYLE[w.type]}`}
                    >
                      {w.type === 'workHours' && w.hours != null ? `${w.hours}h ` : ''}
                      {nameById(w.employeeId).split(' ')[0]}
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => openAdd(selected)}
        className="mt-3 flex items-center gap-1.5 rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white hover:bg-taupe-light"
      >
        <Plus className="h-4 w-4" />
        {t('emp_addEntry')}
      </button>

      {/* Add entry form */}
      {showForm && (
        <div className="mt-4 space-y-2 rounded-2xl border border-sand-dark bg-card p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Manager can log for any team member; an employee logs only for themselves */}
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              disabled={role !== 'ceo'}
              className={`${inputClass} disabled:opacity-70`}
            >
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as WorkJournalType })} className={inputClass}>
              {WORK_JOURNAL_TYPES.map((tk) => <option key={tk} value={tk}>{t(JOURNAL_LABEL[tk])}</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
            {form.type === 'workHours' && (
              <input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder={t('emp_hours')} className={inputClass} />
            )}
          </div>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('notes')} className={`w-full ${inputClass}`} />
          <div className="flex gap-2">
            <button type="button" onClick={submit} className="rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light">
              {t('save')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-sand-dark px-4 py-2 text-sm font-medium text-taupe hover:bg-sand">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Selected day entries (with delete) */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-taupe">{selected}</span>
          <button type="button" onClick={() => openAdd(selected)} className="text-xs font-medium text-taupe hover:underline">
            {t('emp_addEntry')}
          </button>
        </div>
        {selectedEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sand-dark py-8 text-center text-xs text-taupe-soft">{t('emp_noEntries')}</div>
        ) : (
          <div className="space-y-2">
            {selectedEntries.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-lg border border-sand-dark bg-card p-3">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${JOURNAL_STYLE[w.type]}`}>
                  {t(JOURNAL_LABEL[w.type])}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {nameById(w.employeeId)}
                  {w.type === 'workHours' && w.hours != null ? ` · ${w.hours}h` : ''}
                  {w.note ? ` · ${w.note}` : ''}
                </span>
                {/* Manager or the entry owner can remove it */}
                {role === 'ceo' && (
                  <button
                    type="button"
                    onClick={() => deleteWorkJournalEntry(w.id)}
                    className="shrink-0 rounded p-1 text-taupe-light hover:bg-rose-50 hover:text-rose-600"
                    aria-label={t('delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
