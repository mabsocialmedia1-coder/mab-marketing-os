'use client'

import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Plus,
  Trash2,
  X,
  Phone,
  PhoneOff,
  PhoneCall,
  CalendarPlus,
  MapPin,
  Video,
  Archive,
  RotateCcw,
  Check,
  Flame,
  Scale,
  CalendarClock,
  Save,
  FileSpreadsheet,
  Upload,
} from 'lucide-react'
import { useApp } from '@/components/app-provider'
import type { Lead, LeadSource, LeadStatusTag } from '@/lib/data'
import type { TranslationKey } from '@/lib/i18n'

const SOURCES: { key: LeadSource; label: TranslationKey }[] = [
  { key: 'friendReferral', label: 'leads_src_friendReferral' },
  { key: 'recommendation', label: 'leads_src_recommendation' },
  { key: 'facebookGroups', label: 'leads_src_facebookGroups' },
  { key: 'media', label: 'leads_src_media' },
]

function StatusTags({ lead, canEdit }: { lead: Lead; canEdit: boolean }) {
  const { t, setLeadStatus } = useApp()
  const tags: { key: Exclude<LeadStatusTag, null>; label: TranslationKey; icon: typeof Flame }[] = [
    { key: 'hot', label: 'leads_tag_hot', icon: Flame },
    { key: 'deliberating', label: 'leads_tag_deliberating', icon: Scale },
    { key: 'meeting', label: 'leads_tag_meeting', icon: CalendarClock },
  ]
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tg) => {
        const Icon = tg.icon
        const active = lead.statusTag === tg.key
        return (
          <button
            key={tg.key}
            type="button"
            disabled={!canEdit}
            onClick={() => setLeadStatus(lead.id, active ? null : tg.key)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              active ? 'bg-taupe text-white' : 'border border-sand-dark bg-card text-taupe hover:bg-sand'
            }`}
          >
            <Icon className="h-3 w-3" />
            {t(tg.label)}
          </button>
        )
      })}
    </div>
  )
}

function MeetingScheduler({ lead, canEdit }: { lead: Lead; canEdit: boolean }) {
  const { t, scheduleLeadMeeting, addLeadFollowUpTask } = useApp()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  if (lead.statusTag === 'meeting' && lead.meetingDate) {
    return (
      <div className="mt-2 rounded-md bg-emerald-50 px-2.5 py-2 text-[11px] text-emerald-700">
        <div className="flex items-center gap-1.5 font-medium">
          <Check className="h-3 w-3" />
          {t('leads_meetingBooked')}: {lead.meetingDate} · {lead.meetingTime}
        </div>
        {lead.meetingLocation && (
          <div className="mt-0.5 flex items-center gap-1.5 text-emerald-600">
            <MapPin className="h-3 w-3" />
            {lead.meetingLocation}
          </div>
        )}
        <div className="mt-0.5 flex items-center gap-1.5 text-emerald-600">
          <Video className="h-3 w-3" />
          {t('leads_synced')}
        </div>
      </div>
    )
  }

  if (!canEdit) return null

  return (
    <div className="mt-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded-md border border-sand-dark bg-card px-2 py-1 text-[11px] text-taupe hover:bg-sand"
        >
          <CalendarPlus className="h-3 w-3" />
          {t('leads_tag_meeting')}
        </button>
      ) : (
        <div className="rounded-md border border-sand-dark bg-card p-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none"
            />
          </div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('leads_location')}
            className="mt-2 w-full rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none"
          />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('leads_note')} rows={2} className="mt-2 w-full rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />
          <button
            type="button"
            disabled={!date || !time || !location}
            onClick={() => {
              scheduleLeadMeeting(lead.id, date, time, 'https://zoom.us/j/8841250443', location, note)
              addLeadFollowUpTask(lead.id, date, `${note} · ${location} · ${time}`, 'meeting', time)
              setOpen(false)
            }}
            className="mt-2 flex items-center gap-1 rounded-md bg-taupe px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
          >
            <Video className="h-3 w-3" />
            {t('leads_confirmMeeting')}
          </button>
        </div>
      )}
    </div>
  )
}

function CallScheduler({ lead, canEdit }: { lead: Lead; canEdit: boolean }) {
  const { t, scheduleLeadCall, addLeadFollowUpTask } = useApp()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')

  if (lead.callDate) {
    return (
      <div className="mt-2 rounded-md bg-sky-50 px-2.5 py-2 text-[11px] text-sky-700">
        <div className="flex items-center gap-1.5 font-medium">
          <Check className="h-3 w-3" />
          {t('leads_callBooked')}: {lead.callDate} · {lead.callTime}
        </div>
      </div>
    )
  }

  if (!canEdit) return null

  return (
    <div className="mt-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded-md border border-sand-dark bg-card px-2 py-1 text-[11px] text-taupe hover:bg-sand"
        >
          <PhoneCall className="h-3 w-3" />
          {t('leads_scheduleCall')}
        </button>
      ) : (
        <div className="rounded-md border border-sand-dark bg-card p-2">
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none"
            />
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('leads_note')} rows={2} className="mt-2 w-full rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />
          <button
            type="button"
            disabled={!date || !time}
            onClick={() => {
              scheduleLeadCall(lead.id, date, time, note)
              addLeadFollowUpTask(lead.id, date, note, 'call')
              setOpen(false)
            }}
            className="mt-2 flex items-center gap-1 rounded-md bg-taupe px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            {t('leads_confirmCall')}
          </button>
        </div>
      )}
    </div>
  )
}

function AnsweredOptions({ lead, canEdit }: { lead: Lead; canEdit: boolean }) {
  const { t, updateLead, scheduleLeadMeeting, scheduleLeadCall, addLeadFollowUpTask } = useApp()
  const [mode, setMode] = useState<'meeting' | 'call' | 'notInterested' | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  if (!canEdit) return null

  const reset = () => { setMode(null); setDate(''); setTime(''); setLocation(''); setNote('') }
  const confirm = () => {
    if (!note.trim()) return
    if (mode === 'notInterested') {
      updateLead(lead.id, { callOutcome: 'notInterested', archived: true, notes: `${lead.notes}${lead.notes ? '\\n' : ''}${note.trim()}` })
    } else if (mode === 'call' && date && time) {
      scheduleLeadCall(lead.id, date, time, note.trim())
      addLeadFollowUpTask(lead.id, date, note.trim(), 'call')
    } else if (mode === 'meeting' && date && time && location.trim()) {
      scheduleLeadMeeting(lead.id, date, time, 'https://calendar.google.com', location.trim(), note.trim())
      addLeadFollowUpTask(lead.id, date, `${note.trim()} · ${location.trim()}`, 'meeting', time)
    } else return
    reset()
  }

  return (
    <div className="mt-3 border-t border-sand-dark pt-3">
      <div className="mb-2 text-[11px] font-medium text-taupe-light">{t('leads_answeredNext')}</div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setMode('meeting')} className="flex items-center gap-1 rounded-md border border-sand-dark bg-card px-2 py-1 text-[11px] text-taupe hover:bg-sand"><CalendarPlus className="h-3 w-3" />{t('leads_scheduleMeeting')}</button>
        <button type="button" onClick={() => setMode('call')} className="flex items-center gap-1 rounded-md border border-sand-dark bg-card px-2 py-1 text-[11px] text-taupe hover:bg-sand"><PhoneCall className="h-3 w-3" />{t('leads_scheduleCall')}</button>
        <button type="button" onClick={() => setMode('notInterested')} className="flex items-center gap-1 rounded-md border border-sand-dark bg-card px-2 py-1 text-[11px] text-taupe hover:bg-sand"><Archive className="h-3 w-3" />{t('leads_notInterested')}</button>
      </div>
      {mode && (
        <div className="mt-2 rounded-md border border-sand-dark bg-card p-2">
          {mode !== 'notInterested' && <div className="flex flex-wrap gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />
            {mode === 'meeting' && <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('leads_location')} className="min-w-32 flex-1 rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />}
          </div>}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('leads_noteRequired')} rows={2} className="mt-2 w-full rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />
          <div className="mt-2 flex gap-1.5">
            <button type="button" onClick={confirm} disabled={!note.trim() || (mode !== 'notInterested' && (!date || !time || (mode === 'meeting' && !location.trim())))} className="rounded-md bg-taupe px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50">{t('leads_confirm')}</button>
            <button type="button" onClick={reset} className="rounded-md border border-sand-dark px-2 py-1 text-[11px] text-taupe">{t('leads_cancel')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead }: { lead: Lead }) {
  const {
    t,
    answerLead,
    noAnswerLead,
    updateLead,
    archiveLead,
    deleteLead,
    role,
    employees,
    currentEmployeeId,
  } = useApp()
  const [notes, setNotes] = useState(lead.notes)
  const [noAnswerOpen, setNoAnswerOpen] = useState(false)
  const [noAnswerNote, setNoAnswerNote] = useState('')

  // The manager has full control; an employee needs 'full' leads access (otherwise add-only)
  const myLeadsAccess = employees.find((e) => e.id === currentEmployeeId)?.permissions?.leadsAccess
  const canEdit = role === 'ceo' || myLeadsAccess === 'full'

  const outcomes = [
    { key: 'answered', label: 'leads_answered' as TranslationKey, icon: Phone, fn: () => answerLead(lead.id) },
    { key: 'noAnswer', label: 'leads_noAnswer' as TranslationKey, icon: PhoneOff, fn: () => setNoAnswerOpen(true) },
  ]

  return (
    <div className="rounded-xl border border-sand-dark bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-foreground">
            {lead.firstName} {lead.lastName}
          </div>
          <div className="truncate text-sm text-taupe-light">{lead.organization}</div>
        </div>

      </div>

      <div className="mt-2 grid grid-cols-1 gap-0.5 text-xs text-taupe-light">
        <span>{lead.phone}</span>
        {lead.address && <span className="truncate">{lead.address}</span>}
        <span className="truncate">
          {lead.instagram} · {lead.website}
        </span>
        <span className="mt-1 inline-flex w-fit items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-taupe-soft">
          {t(SOURCES.find((s) => s.key === lead.source)?.label ?? 'leads_source')}
          {lead.referralName ? ` · ${lead.referralName}` : ''}
        </span>
      </div>

      {/* Call outcomes — add-only employees cannot log outcomes */}
      {canEdit ? (
        <div className="mt-3">
          <div className="mb-1 text-[11px] font-medium text-taupe-light">{t('leads_logCall')}</div>
          <div className="flex flex-wrap gap-1.5">
            {outcomes.map((o) => {
              const Icon = o.icon
              const active = lead.callOutcome === o.key
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={o.fn}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                    active ? 'bg-taupe text-white' : 'border border-sand-dark bg-card text-taupe hover:bg-sand'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {t(o.label)}
                </button>
              )
            })}
          </div>
          {noAnswerOpen && (
            <div className="mt-2 rounded-md border border-sand-dark bg-card p-2">
              <textarea value={noAnswerNote} onChange={(e) => setNoAnswerNote(e.target.value)} placeholder={t('leads_noteRequired')} rows={2} className="w-full rounded border border-sand-dark bg-secondary px-2 py-1 text-[11px] text-foreground outline-none" />
              <div className="mt-2 flex gap-1.5">
                <button type="button" disabled={!noAnswerNote.trim()} onClick={() => { noAnswerLead(lead.id, noAnswerNote.trim()); setNoAnswerOpen(false); setNoAnswerNote('') }} className="rounded-md bg-taupe px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50">{t('leads_confirm')}</button>
                <button type="button" onClick={() => { setNoAnswerOpen(false); setNoAnswerNote('') }} className="rounded-md border border-sand-dark px-2 py-1 text-[11px] text-taupe">{t('leads_cancel')}</button>
              </div>
            </div>
          )}
          {lead.callOutcome === 'noAnswer' && lead.followUpDate && (
            <div className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
              {t('leads_autoFollowUp')} · {lead.followUpDate}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 rounded bg-secondary px-2 py-1 text-[11px] text-taupe-light">
          {t('leads_addOnlyNote')}
        </div>
      )}

      {lead.callOutcome === 'answered' && <AnsweredOptions lead={lead} canEdit={canEdit} />}
      {lead.archived && (
        <div className="mt-2 rounded bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">{t('leads_movedArchive')}</div>
      )}

      {/* Notes */}
      <div className="mt-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={!canEdit}
          placeholder={t('leads_conversationNotes')}
          rows={2}
          className="w-full resize-none rounded-md border border-sand-dark bg-secondary px-2 py-1.5 text-xs text-foreground outline-none focus:border-taupe read-only:opacity-70"
        />
        {canEdit && notes !== lead.notes && (
          <button
            type="button"
            onClick={() => updateLead(lead.id, { notes })}
            className="mt-1 flex items-center gap-1 rounded-md bg-taupe px-2 py-1 text-[11px] font-medium text-white"
          >
            <Save className="h-3 w-3" />
            {t('leads_saveNotes')}
          </button>
        )}
      </div>

      {/* Footer actions — add-only employees cannot archive; only the manager can delete */}
      {canEdit && (
        <div className="mt-3 flex items-center gap-2 border-t border-sand-dark pt-2">
          <button
            type="button"
            onClick={() => archiveLead(lead.id)}
            className="flex items-center gap-1 rounded-md border border-sand-dark px-2 py-1 text-xs text-taupe hover:bg-sand"
          >
            <Archive className="h-3 w-3" />
            {t('leads_archiveLead')}
          </button>
          {role === 'ceo' && (
            <button
              type="button"
              onClick={() => deleteLead(lead.id)}
              className="flex items-center gap-1 rounded-md border border-sand-dark px-2 py-1 text-xs text-taupe-light hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function LeadQueue({ title, empty, tone, count, children }: { title: string; empty: string; tone: 'emerald' | 'sky'; count: number; children: React.ReactNode }) {
  const border = tone === 'emerald' ? 'border-emerald-200' : 'border-sky-200'
  const background = tone === 'emerald' ? 'bg-emerald-50/60' : 'bg-sky-50/60'
  return <section className={`rounded-xl border ${border} ${background} p-3`}><div className="mb-3 text-sm font-semibold text-taupe">{title}</div>{count > 0 ? <div className="space-y-2">{children}</div> : <div className="text-sm text-taupe-light">{empty}</div>}</section>
}

const emptyForm = {
  firstName: '',
  lastName: '',
  organization: '',
  phone: '',
  address: '',
  instagram: '',
  website: '',
  facebook: '',
  source: 'facebookGroups' as LeadSource,
  referralName: '',
}

type ImportedLead = Partial<Lead> & { importRow: number; importInterest?: string }

const headerAliases: Record<string, keyof Lead | 'importInterest'> = {
  name: 'firstName', 'שם': 'firstName', firstname: 'firstName', 'שם פרטי': 'firstName', lastname: 'lastName', 'שם משפחה': 'lastName', organization: 'organization', company: 'organization', 'ארגון': 'organization', phone: 'phone', 'טלפון': 'phone', address: 'address', 'כתובת': 'address', email: 'email', דואר: 'email', instagram: 'instagram', website: 'website', facebook: 'facebook', source: 'source', 'מקור': 'source', notes: 'notes', 'הערות': 'notes', interested: 'importInterest', 'מעוניין': 'importInterest', 'לא מעוניין': 'importInterest', רצון: 'importInterest',
}

const normalizeHeader = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/[׳׳'"“”]/g, '')

export function LeadsCRM() {
  const { t, leads, addLead, updateLead, restoreLead } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [importRows, setImportRows] = useState<ImportedLead[]>([])
  const [importError, setImportError] = useState('')
  const [showArchive, setShowArchive] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [expandedQueueLead, setExpandedQueueLead] = useState<string | null>(null)

  const submit = () => {
    if (!form.firstName.trim() && !form.organization.trim()) return
    addLead({ ...form })
    setForm(emptyForm)
    setShowForm(false)
  }

  const readImport = async (file: File) => {
    setImportError('')
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      const imported = rows.map((row, index) => {
        const lead: ImportedLead = { importRow: index + 2, firstName: '', lastName: '', organization: '', phone: '', address: '', instagram: '', website: '', facebook: '', source: 'media', notes: '', email: '', callOutcome: null, archived: false }
        for (const [header, value] of Object.entries(row)) {
          const field = headerAliases[normalizeHeader(header)]
          if (field) lead[field] = String(value ?? '').trim() as never
        }
  if (!lead.firstName && lead.organization) lead.firstName = lead.organization
        const interest = String(lead.importInterest ?? '').trim().toLowerCase()
        if (interest.includes('לא') || interest.includes('not')) { lead.callOutcome = 'notInterested'; lead.archived = true }
        else { lead.callOutcome = null; lead.archived = false }
        return lead
      }).filter((lead) => lead.firstName || lead.organization || lead.phone)
      if (!imported.length) throw new Error('לא נמצאו שורות עם נתוני לידים')
      setImportRows(imported)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'לא ניתן לקרוא את הקובץ')
      setImportRows([])
    }
  }

  const confirmImport = () => {
    importRows.forEach(({ importRow: _importRow, importInterest: _importInterest, ...lead }) => {
      const phone = String(lead.phone ?? '').replace(/\D/g, '')
      const email = String(lead.email ?? '').trim().toLowerCase()
      const duplicate = leads.find((existing) => (email && existing.email?.trim().toLowerCase() === email) || (phone && String(existing.phone).replace(/\D/g, '') === phone))
      if (duplicate) updateLead(duplicate.id, lead)
      else addLead(lead)
    })
    setImportRows([])
    setImportError('')
  }

  const active = leads.filter((l) => !l.archived)
  const archived = leads.filter((l) => l.archived)
  const meetings = active.filter((l) => l.meetingDate)
  const callbacks = active.filter((l) => l.callDate || l.callOutcome === 'noAnswer')

  const inputClass =
    'rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-taupe">{t('nav_leadsCrm')}</h1>
          <p className="mt-1 text-taupe-light">{t('leads_subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void readImport(file); event.currentTarget.value = '' }} />
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-4 py-2 text-sm font-medium text-taupe hover:bg-sand"><FileSpreadsheet className="h-4 w-4" />ייבוא Excel / CSV</button>
          <button
            type="button"
            onClick={() => setShowArchive((s) => !s)}
            className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-4 py-2 text-sm font-medium text-taupe hover:bg-sand"
          >
            <Archive className="h-4 w-4" />
            {t('leads_inactiveList')} ({archived.length})
          </button>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white transition hover:bg-taupe-light"
          >
            <Plus className="h-4 w-4" />
            {t('leads_addLead')}
          </button>
        </div>
      </div>

      {importError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{importError}</div>}
      {importRows.length > 0 && (
        <div className="mt-4 rounded-xl border border-sand-dark bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-sm font-semibold text-foreground">תצוגה מקדימה לייבוא</div><div className="text-xs text-taupe-light">נמצאו {importRows.length} לידים. בדקי את הנתונים לפני ההוספה.</div></div><div className="flex gap-2"><button type="button" onClick={confirmImport} className="rounded-lg bg-taupe px-3 py-2 text-sm font-semibold text-white">הוסף לידים</button><button type="button" onClick={() => setImportRows([])} className="rounded-lg border border-sand-dark px-3 py-2 text-sm text-taupe">ביטול</button></div></div>
          <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-sand-dark"><table className="w-full min-w-[720px] text-start text-xs"><thead className="bg-secondary"><tr><th className="p-2">שורה</th><th className="p-2">שם</th><th className="p-2">ארגון</th><th className="p-2">טלפון</th><th className="p-2">מייל</th><th className="p-2">כתובת</th><th className="p-2">עניין</th><th className="p-2">הערות</th></tr></thead><tbody>{importRows.map((lead) => <tr key={lead.importRow} className="border-t border-sand-dark"><td className="p-2">{lead.importRow}</td><td className="p-2">{[lead.firstName, lead.lastName].filter(Boolean).join(' ') || '—'}</td><td className="p-2">{lead.organization || '—'}</td><td className="p-2">{lead.phone || '—'}</td><td className="p-2">{lead.email || '—'}</td><td className="p-2">{lead.address || '—'}</td><td className="p-2">{lead.importInterest || 'פעיל כברירת מחדל'}</td><td className="p-2">{lead.notes || '—'}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-xl border border-sand-dark bg-card p-4">
          <div className="mb-3 text-sm font-semibold text-foreground">{t('leads_newLead')}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder={t('leads_firstName')} className={inputClass} />
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder={t('leads_lastName')} className={inputClass} />
            <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder={t('leads_organization')} className={inputClass} />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('leads_phoneField')} className={inputClass} />
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t('leads_addressField')} className={inputClass} />
            <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder={t('leads_instagram')} className={inputClass} />
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder={t('leads_websiteField')} className={inputClass} />
            <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder={t('leads_facebook')} className={inputClass} />
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })} className={inputClass}>
              {SOURCES.map((s) => (
                <option key={s.key} value={s.key}>
                  {t(s.label)}
                </option>
              ))}
            </select>
            {(form.source === 'friendReferral' || form.source === 'recommendation') && (
              <input value={form.referralName} onChange={(e) => setForm({ ...form, referralName: e.target.value })} placeholder={t('leads_referralName')} className={inputClass} />
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={submit} className="rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light">
              {t('save')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-sand-dark px-4 py-2 text-sm text-taupe hover:bg-sand">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="mt-4 rounded-xl border border-sand-dark bg-secondary p-4">
          <div className="mb-3 text-sm font-semibold text-foreground">{t('leads_inactiveList')}</div>
          {archived.length === 0 ? (
            <div className="text-sm text-taupe-light">{t('leads_empty')}</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {archived.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border border-sand-dark bg-card p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="truncate text-xs text-taupe-light">
                      {lead.organization} · {lead.phone}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreLead(lead.id)}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-sand-dark px-2 py-1 text-xs text-taupe hover:bg-sand"
                  >
                    <RotateCcw className="h-3 w-3 flip-x" />
                    {t('leads_restore')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-taupe-light">
          {t('leads_activeList')} ({active.length})
        </div>
        {active.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sand-dark py-12 text-center text-sm text-taupe-soft">
            {t('leads_empty')}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <LeadQueue count={meetings.length} title={`פגישות שנקבעו (${meetings.length})`} empty="אין פגישות שנקבעו" tone="emerald">
          {meetings.map((lead) => <button type="button" key={lead.id} onClick={() => setExpandedQueueLead((current) => current === lead.id ? null : lead.id)} className="w-full rounded-lg border border-emerald-200 bg-card p-3 text-start text-sm hover:bg-emerald-50"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-medium text-foreground">{lead.firstName} {lead.lastName}</span><span className="ms-2 text-xs text-taupe-light">{lead.organization} · {lead.phone}</span></div><span className="text-xs text-emerald-700">{lead.meetingDate} · {lead.meetingTime}</span></div>{expandedQueueLead === lead.id && <div className="mt-2 grid gap-1 border-t border-emerald-100 pt-2 text-xs text-taupe-light"><span>{lead.phone}</span><span>{lead.address || '��'}</span><span>{lead.notes || 'אין הערה'}</span></div>}</button>)}
        </LeadQueue>
        <LeadQueue count={callbacks.length} title={`צריך לחזור אליהם (${callbacks.length})`} empty="אין כרגע שיחות לחזרה" tone="sky">
          {callbacks.map((lead) => <button type="button" key={lead.id} onClick={() => setExpandedQueueLead((current) => current === lead.id ? null : lead.id)} className="w-full rounded-lg border border-sky-200 bg-card p-3 text-start text-sm hover:bg-sky-50"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-medium text-foreground">{lead.firstName} {lead.lastName}</span><span className="ms-2 text-xs text-taupe-light">{lead.organization} · {lead.phone}</span></div><span className="text-xs text-sky-700">{lead.callOutcome === 'noAnswer' ? `לא ענו · ${lead.followUpDate ?? ''}` : `${lead.callDate ?? ''} · ${lead.callTime ?? ''}`}</span></div>{expandedQueueLead === lead.id && <div className="mt-2 grid gap-1 border-t border-sky-100 pt-2 text-xs text-taupe-light"><span>{lead.phone}</span><span>{lead.address || '—'}</span><span>{lead.notes || 'אין הערה'}</span></div>}</button>)}
        </LeadQueue>
      </div>
    </div>
  )
}
