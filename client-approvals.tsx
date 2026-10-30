'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, MessageSquare, CheckCircle2, Megaphone, Bell, MapPin, X, ArrowLeft, ChevronRight, ChevronLeft, ChevronDown, RotateCcw, Upload, Link2, CalendarClock, FolderOpen, Plus, Send } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { PlatformBadge } from '@/components/platform-badge'
import {
  NOTIFY_CHANNELS,
  CAMPAIGN_COMMISSION_RATE,
  ALL_PLATFORMS,
  OPTIMAL_TIMES,
  type ContentItem,
  type ContentType,
  type ContentPlatform,
  type CampaignObjective,
  type Marker,
  type NotifyChannel,
  type PaidCampaign,
  type CampaignReport,
} from '@/lib/data'
import type { TranslationKey } from '@/lib/i18n'

const TYPE_STYLE: Record<ContentType, string> = {
  REEL: 'bg-violet-100 text-violet-700',
  POST: 'bg-taupe text-white',
  STORY: 'bg-cream text-taupe',
}

const TYPE_FILTERS: (ContentType | 'ALL')[] = ['ALL', 'REEL', 'POST', 'STORY']

const OBJECTIVE_LABEL: Record<CampaignObjective, TranslationKey> = {
  leadGen: 'paid_obj_leadGen',
  traffic: 'paid_obj_traffic',
  engagement: 'paid_obj_engagement',
  messages: 'paid_obj_messages',
  calls: 'paid_obj_calls',
}

const CHANNEL_LABEL: Record<NotifyChannel, TranslationKey> = {
  sms: 'notify_sms',
  email: 'notify_email',
  whatsapp: 'notify_whatsapp',
  push: 'notify_push',
}

/* ---------------- Content review card with pinpoint markup ---------------- */
function ReviewCard({
  item,
  clientName,
  onApprove,
  }: {
  item: ContentItem
  clientName: string
  onApprove: () => void
  }) {
  const { t, role, addContentComment, clientRequestEdit } = useApp()
  const [markers, setMarkers] = useState<Marker[]>([])
  const [comment, setComment] = useState('')
  const [markupMode, setMarkupMode] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const mediaItems = item.mediaItems?.length ? item.mediaItems : item.mediaUrl ? [{ id: `${item.id}-media`, url: item.mediaUrl, kind: item.mediaKind ?? 'image' as const }] : []
  const [resolvedMedia, setResolvedMedia] = useState(mediaItems)
  const [mediaError, setMediaError] = useState(false)
  useEffect(() => {
    let cancelled = false
    const resolve = async () => {
      const next = await Promise.all(mediaItems.map(async (media) => {
        const isStorageMedia = media.url.startsWith('clients/') || media.url.includes('/storage/v1/object/')
        if (!isStorageMedia) return media
        const response = await fetch(`/api/media?path=${encodeURIComponent(media.url)}`)
        if (!response.ok) throw new Error('media missing')
        const data = await response.json() as { url: string }
        return { ...media, url: data.url }
      }))
      if (!cancelled) { setResolvedMedia(next); setMediaError(false) }
    }
    resolve().catch(() => { if (!cancelled) setMediaError(true) })
    return () => { cancelled = true }
  }, [item.id, item.mediaUrl, item.mediaItems])
  const displayMedia = mediaError ? [] : resolvedMedia
  const safeActiveSlide = displayMedia.length ? Math.min(activeSlide, displayMedia.length - 1) : 0

  const addMarker = (e: React.MouseEvent<HTMLElement>) => {
    if (!markupMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMarkers((prev) => [...prev, { id: `m${Date.now()}`, x, y, note: '', slideIndex: activeSlide }])
  }

  const updateMarker = (id: string, note: string) =>
    setMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, note } : m)))
  const removeMarker = (id: string) => setMarkers((prev) => prev.filter((m) => m.id !== id))

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-dark bg-card">
      <div className="flex items-center gap-2 border-b border-sand-dark px-4 py-3">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[item.type]}`}>{item.type}</span>
        <PlatformBadge platform={item.platform} />
        <span className="text-sm font-medium text-taupe">{item.platform}</span>
        <span className="ms-auto text-xs text-taupe-light">
          {t('appr_for')} {clientName}
        </span>
      </div>

      {/* Preview surface — click to drop pins in markup mode */}
      <div
        onClick={addMarker}
        className={`relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-sand to-sand-dark text-center ${
          markupMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
        role={markupMode ? 'button' : undefined}
        tabIndex={markupMode ? 0 : undefined}
        aria-label={markupMode ? t('appr_markupHint') : undefined}
      >
          {mediaError ? <span className="flex h-full items-center justify-center p-6 text-sm text-rose-700">הקובץ חסר או שלא ניתן לטעון אותו.</span> : displayMedia.length > 0 ? (
            <>
              {displayMedia[safeActiveSlide].kind === 'video' ? <video src={displayMedia[safeActiveSlide].url} className="h-full w-full bg-black object-contain" controls playsInline preload="metadata" onError={() => setMediaError(true)} /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={displayMedia[safeActiveSlide].url} alt={displayMedia[activeSlide].label ?? `${item.type} slide ${activeSlide + 1}`} className="h-full w-full object-contain" onError={() => setMediaError(true)} />}
              {displayMedia.length > 1 && <><button type="button" aria-label="Previous slide" onClick={() => setActiveSlide((slide) => (slide - 1 + displayMedia.length) % displayMedia.length)} className="absolute start-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-taupe shadow"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next slide" onClick={() => setActiveSlide((slide) => (slide + 1) % displayMedia.length)} className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-taupe shadow"><ChevronRight className="h-4 w-4" /></button><div className="absolute bottom-2 start-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-semibold text-background">{safeActiveSlide + 1} / {displayMedia.length}</div></>}
            </>
          ) : <span className="flex h-full items-center justify-center p-6 text-sm leading-relaxed text-foreground">{item.caption}</span>}
          {markers.filter((marker) => (marker.slideIndex ?? 0) === activeSlide).map((m, i) => (
          <span
            key={m.id}
            className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="p-4">
        {item.mediaUrl && item.caption && (
          <p className="mb-2 text-sm leading-relaxed text-foreground">{item.caption}</p>
        )}
        {item.scheduledDate && (
          <div className="mb-2 text-xs text-taupe-light">
            {item.scheduledDate}{item.time ? ` · ${item.time}` : ''}
          </div>
        )}

        {/* Markup toggle */}
        <button
          type="button"
          onClick={() => setMarkupMode((s) => !s)}
          className={`mb-2 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            markupMode ? 'border-transparent bg-rose-500 text-white' : 'border-sand-dark text-taupe hover:bg-sand'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          {markupMode ? t('appr_markupOn') : t('appr_addMarkup')}
        </button>

        {/* Marker notes */}
        {markers.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {markers.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="shrink-0 text-[10px] text-taupe-light">Slide {(m.slideIndex ?? 0) + 1}</span>
                <input
                  value={m.note}
                  onChange={(e) => updateMarker(m.id, e.target.value)}
                  placeholder={t('appr_markerNote')}
                  className="flex-1 rounded-md border border-sand-dark bg-secondary px-2 py-1 text-xs text-foreground outline-none focus:border-taupe"
                />
                <button type="button" onClick={() => removeMarker(m.id)} className="shrink-0 rounded p-1 text-taupe-light hover:bg-rose-50 hover:text-rose-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-3 rounded-lg border border-sand-dark bg-secondary p-3">
          <div className="mb-2 text-xs font-semibold text-taupe">{role === 'client' ? 'Discussion on this content' : 'Content discussion thread'}</div>
          <div className="space-y-2">
            {(item.comments ?? []).length > 0 ? item.comments?.map((entry) => <div key={entry.id} className="rounded-md bg-card px-2.5 py-2 text-xs"><div className="flex items-center justify-between gap-2 font-semibold text-taupe"><span>{entry.author}</span><span className="text-[10px] font-normal text-taupe-light">{new Date(entry.createdAt).toLocaleString()}</span></div><div className="mt-1 text-foreground">{entry.text}</div></div>) : <div className="text-xs text-taupe-light">No comments yet.</div>}
          </div>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment or change request..."
          className="min-h-16 w-full resize-none rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe"
        />
<div className="mt-3 flex flex-wrap gap-2">
  <button type="button" disabled={!comment.trim()} onClick={() => { const slideNotes = markers.length ? `\n\nSlides: ${Array.from(new Set(markers.map((marker) => (marker.slideIndex ?? 0) + 1))).join(', ')}` : ''; addContentComment(item.id, `${comment.trim()}${slideNotes}`); setComment(''); setMarkers([]) }} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sand-dark py-2 text-sm font-semibold text-taupe hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"><MessageSquare className="h-4 w-4" />Send message</button>
  {role === 'client' && <button type="button" disabled={!comment.trim()} onClick={() => { clientRequestEdit(item.id, comment.trim(), markers); setComment(''); setMarkers([]); setMarkupMode(false) }} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"><X className="h-4 w-4" />{t('content_requestChanges')}</button>}
  <button
  type="button"
  onClick={onApprove}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-taupe py-2 text-sm font-semibold text-white hover:bg-taupe-light"
          >
            <Check className="h-4 w-4" />
            {role === 'client' ? t('appr_approved') : t('appr_approve')}
  </button>
  </div>
      </div>
    </div>
  )
}

/* ---------------- Campaign review card (manager or client approval) ---------------- */
function CampaignReviewCard({ c, clientName, managerReview = false }: { c: PaidCampaign; clientName: string; managerReview?: boolean }) {
  const { t, advancePaidCampaign, sendBackPaidCampaign } = useApp()
  const [note, setNote] = useState('')
  const commission = c.budget * CAMPAIGN_COMMISSION_RATE
  const total = c.budget + commission

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream text-taupe">
          <Megaphone className="h-4 w-4" />
        </span>
        <span className="font-medium text-taupe">{c.title}</span>
        <span className="ms-auto text-xs text-taupe-light">
          {t('appr_for')} {clientName}
        </span>
      </div>
      <div className="mt-1 inline-flex rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-taupe">
        {t(OBJECTIVE_LABEL[c.objective])}
      </div>
      <div className="mt-3 grid gap-1 text-xs text-taupe-light">
        <span>{t('paid_audience')}: {c.audience}</span>
        <span>{t('paid_ages')}: {c.ageRange}</span>
        <span>{t('paid_locations')}: {c.locations || '—'}</span>
        <span>{c.budgetType === 'daily' ? t('paid_daily') : t('paid_lifetime')} · {c.startDate} → {c.endDate}</span>
      </div>

      {/* Transparent cost breakdown — media spend + 20% agency commission */}
      <div className="mt-2 grid gap-1 rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-xs">
        <div className="flex items-center justify-between text-taupe-light">
          <span>{t('paid_mediaSpend')}</span>
          <span>${c.budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-taupe-light">
          <span>{t('paid_commission')}</span>
          <span>${commission.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-t border-sand-dark pt-1 font-semibold text-taupe">
          <span>{t('paid_totalCharge')}</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>

      {c.headline && (
        <div className="mt-2 rounded-lg border border-sand-dark bg-secondary p-2 text-xs">
          <div className="font-medium text-taupe">{c.headline}</div>
          {c.primaryText && <div className="text-taupe-light">{c.primaryText}</div>}
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('appr_comment')}
        className="mt-3 min-h-14 w-full resize-none rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => advancePaidCampaign(c.id, managerReview ? 'client' : 'active')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-taupe py-2 text-sm font-semibold text-white hover:bg-taupe-light"
        >
          <Check className="h-4 w-4" />
          {managerReview ? t('paid_approveCeo') : t('paid_approveClient')}
        </button>
        <button
          type="button"
          onClick={() => sendBackPaidCampaign(c.id, note)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sand-dark py-2 text-sm text-taupe hover:bg-sand"
        >
          <RotateCcw className="h-4 w-4" />
          {t('paid_sendBack')}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Manager review card (content awaiting CEO) ---------------- */
function ManagerContentCard({ item, clientName }: { item: ContentItem; clientName: string }) {
  const { t, ceoApproveContent, ceoRequestEdit } = useApp()
  const [note, setNote] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [mediaSrc, setMediaSrc] = useState(item.mediaUrl ?? '')
  const [mediaError, setMediaError] = useState(false)
  useEffect(() => {
    if (!item.mediaUrl || (!item.mediaUrl.startsWith('clients/') && !item.mediaUrl.includes('/storage/v1/object/'))) return
    fetch(`/api/media?path=${encodeURIComponent(item.mediaUrl)}`).then(async (response) => {
      if (!response.ok) throw new Error('media missing')
      const data = await response.json() as { url: string }
      setMediaSrc(data.url)
    }).catch(() => setMediaError(true))
  }, [item.mediaUrl])
  const approvalLink = typeof window === 'undefined' ? '' : `${window.location.origin}/client-approval?type=${encodeURIComponent(item.type)}&client=${encodeURIComponent(clientName)}&caption=${encodeURIComponent(item.caption || '')}`

  const copyApprovalLink = async () => {
    if (!approvalLink) return
    await navigator.clipboard.writeText(approvalLink)
    setLinkCopied(true)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-dark bg-card">
      <div className="flex items-center gap-2 border-b border-sand-dark px-4 py-3">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[item.type]}`}>{item.type}</span>
        <PlatformBadge platform={item.platform} />
        <span className="text-sm font-medium text-taupe">{item.platform}</span>
        <span className="ms-auto text-xs text-taupe-light">{t('appr_by')} {item.createdBy}</span>
      </div>
      {item.mediaUrl && (mediaError ? <div className="flex aspect-square items-center justify-center bg-secondary p-6 text-center text-sm text-rose-700">הקובץ חסר או שלא ניתן לטעון אותו.</div> : item.mediaKind === 'video' ? (
        <video src={mediaSrc} className="aspect-square w-full bg-black object-contain" controls playsInline preload="metadata" onError={() => setMediaError(true)} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaSrc} alt="" className="aspect-square w-full bg-secondary object-contain" onError={() => setMediaError(true)} />
      ))}
      <div className="p-4">
        <p className="text-sm leading-relaxed text-foreground">{item.caption}</p>
        {item.scheduledDate && (
          <div className="mt-2 text-xs text-taupe-light">{item.scheduledDate}{item.time ? ` · ${item.time}` : ''}</div>
        )}
        {!showReview ? (
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={copyApprovalLink} className="flex items-center justify-center gap-2 rounded-lg border border-sand-dark px-3 py-2 text-xs font-semibold text-taupe hover:bg-sand">
              {linkCopied ? 'Link copied' : 'Copy client approval link'}
            </button>
            <button
              type="button"
              onClick={() => ceoApproveContent(item.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-taupe py-2 text-sm font-semibold text-white hover:bg-taupe-light"
            >
              <Check className="h-4 w-4" />
              {t('content_approveToClient')}
            </button>
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sand-dark py-2 text-sm text-taupe hover:bg-sand"
            >
              <MessageSquare className="h-4 w-4" />
              {t('content_requestChanges')}
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2 rounded-lg border border-sand-dark bg-secondary p-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('content_ceoEditPlaceholder')}
              rows={2}
              className="w-full resize-none rounded-md border border-sand-dark bg-card px-2 py-1 text-xs text-foreground outline-none focus:border-taupe"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { ceoRequestEdit(item.id, note); setNote(''); setShowReview(false) }}
                className="flex items-center gap-1 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('content_sendBackToEmployee')}
              </button>
              <button type="button" onClick={() => setShowReview(false)} className="rounded-md border border-sand-dark px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Manager Approval Center (everything comes here first) ---------------- */
const TYPE_ORDER: ContentType[] = ['REEL', 'POST', 'STORY']

  function CampaignReportEditor({ report, clientName, onUpdate, onReview }: { report: CampaignReport; clientName: string; onUpdate: (id: string, patch: Partial<Pick<CampaignReport, 'highlights' | 'metrics' | 'recommendations' | 'periodStart' | 'periodEnd' | 'nextDueDate' | 'recipientEmails'>>) => void; onReview: (id: string, status: CampaignReport['status']) => void }) {
    const editable = report.status === 'internalReview' || report.status === 'draft'
    const [newEmail, setNewEmail] = useState('')
    const emails = report.recipientEmails ?? []
    const addEmail = () => { const email = newEmail.trim(); if (!email || emails.includes(email)) return; onUpdate(report.id, { recipientEmails: [...emails, email] }); setNewEmail('') }
    const month = (report.periodStart ?? report.createdDate).slice(0, 7)
    return <article className="rounded-xl border border-sand-dark bg-background p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-taupe">{report.title}</h3><p className="text-xs text-taupe-light">{clientName} · {month}</p></div><span className="rounded-full bg-secondary px-2 py-1 text-[11px] text-taupe">{report.status === 'clientVisible' ? 'מוצג ללקוח' : report.status === 'approved' ? 'אושר לשליחה' : 'ממתין לאישור פנימי'}</span></div><div className="mt-3 grid gap-3 md:grid-cols-3">{([['highlights', 'הנתונים הטובים והנכונים'], ['metrics', 'מדדים ותוצאות'], ['recommendations', 'המלצות']] as const).map(([key, label]) => <label key={key} className="text-xs font-semibold text-taupe">{label}<textarea disabled={!editable} value={report[key]} onChange={(event) => onUpdate(report.id, { [key]: event.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-sand-dark bg-card p-2 text-sm font-normal text-taupe disabled:opacity-70" /></label>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-taupe">תקופת הדוח<input disabled={!editable} type="date" value={report.periodStart ?? ''} onChange={(event) => onUpdate(report.id, { periodStart: event.target.value })} className="mt-1 w-full rounded-lg border border-sand-dark bg-card px-2 py-2 text-sm font-normal text-taupe" /></label><label className="text-xs font-semibold text-taupe">עד<input disabled={!editable} type="date" value={report.periodEnd ?? ''} onChange={(event) => onUpdate(report.id, { periodEnd: event.target.value })} className="mt-1 w-full rounded-lg border border-sand-dark bg-card px-2 py-2 text-sm font-normal text-taupe" /></label></div><div className="mt-3 rounded-lg border border-sand-dark bg-card p-3"><p className="text-xs font-semibold text-taupe">נמעני מייל ללקוח</p><div className="mt-2 flex flex-wrap gap-2">{emails.map((email) => <span key={email} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-taupe">{email}{editable && <button type="button" aria-label={`הסר ${email}`} onClick={() => onUpdate(report.id, { recipientEmails: emails.filter((item) => item !== email) })}>×</button>}</span>)}</div>{editable && <div className="mt-2 flex gap-2"><input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="��וסף מי��ל" className="min-w-0 flex-1 rounded-lg border border-sand-dark px-2 py-2 text-sm text-taupe" /><button type="button" onClick={addEmail} className="rounded-lg border border-sand-dark px-3 py-2 text-xs font-semibold text-taupe">הוסף</button></div>}</div>{editable && <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onReview(report.id, 'approved')} className="rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white">אשר ושלח לעובד/מנהל</button><button type="button" onClick={() => onReview(report.id, 'draft')} className="rounded-lg border border-sand-dark px-3 py-2 text-xs font-semibold text-taupe">שמור לעריכה</button></div>}{report.status === 'approved' && <button type="button" onClick={() => onReview(report.id, 'clientVisible')} className="mt-3 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">שלח ללקוח</button>}</article>
  }

  function ManagerApprovals() {
  const { t, lang, clientFolders, contentItems, paidCampaigns, campaignReports, createCampaignReport, updateCampaignReport, reviewCampaignReport } = useApp()
  const he = lang === 'he'
  const clientName = (id: string) => clientFolders.find((c) => c.id === id)?.name ?? 'Client'
  const [openClientId, setOpenClientId] = useState<string | null>(null)

  const monthKeyOf = (d?: string) => (d && d.length >= 7 ? d.slice(0, 7) : 'unscheduled')
  const monthLabelOf = (key: string) => {
    if (key === 'unscheduled') return he ? 'ללא תאריך' : 'Unscheduled'
    const [y, m] = key.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' })
  }

  // Grouped by client → month → type (REEL/POST/STORY/Other) + campaigns — active clients only
  const groups = clientFolders
    .filter((c) => c.active)
    .map((c) => {
      const content = contentItems.filter((x) => x.stage === 'manager_review' && x.clientId === c.id)
      const campaigns = paidCampaigns.filter((x) => x.status === 'ceo' && x.clientId === c.id)
      const monthKeys = Array.from(
        new Set([...content.map((x) => monthKeyOf(x.scheduledDate)), ...campaigns.map((x) => monthKeyOf(x.startDate))]),
      ).sort()
      const months = monthKeys.map((mk) => ({
        key: mk,
        content: content.filter((x) => monthKeyOf(x.scheduledDate) === mk),
        campaigns: campaigns.filter((x) => monthKeyOf(x.startDate) === mk),
      }))
      return { client: c, count: content.length + campaigns.length, months }
    })
    .filter((g) => g.count > 0)

  const openGroup = groups.find((g) => g.client.id === openClientId) ?? null
  const reportGroups = clientFolders.filter((client) => campaignReports.some((report) => report.clientId === client.id)).map((client) => ({ client, months: Array.from(new Set(campaignReports.filter((report) => report.clientId === client.id).map((report) => (report.periodStart ?? report.createdDate).slice(0, 7)))).sort().map((month) => ({ month, reports: campaignReports.filter((report) => report.clientId === client.id && (report.periodStart ?? report.createdDate).slice(0, 7) === month) })) }))

  // ---- Folder detail: months → materials by type ----
  if (openGroup) {
    const g = openGroup
    return (
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => setOpenClientId(null)}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-4 py-2 text-sm font-semibold text-taupe shadow-sm transition hover:bg-sand hover:shadow"
        >
          <ArrowLeft className="h-4 w-4 flip-x" />
          {t('appr_backToClients')}
        </button>

        <h1 className="flex items-center gap-3 text-2xl font-semibold text-taupe">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-cream text-xs font-semibold text-taupe">
            {g.client.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.client.logo || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
            ) : (
              g.client.name.slice(0, 2)
            )}
          </span>
          {g.client.name}
        </h1>
        <p className="mt-1 text-taupe-light">{t('appr_mgrSubtitle')}</p>

        <div className="mt-6 space-y-6">
          {g.months.map((month) => {
            const other = month.content.filter((x) => !TYPE_ORDER.includes(x.type))
            return (
              <section key={month.key} className="rounded-2xl border border-sand-dark bg-card p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-sand-dark pb-2 text-sm font-semibold uppercase tracking-wide text-taupe">
                  <CalendarClock className="h-4 w-4 text-taupe-light" />
                  {monthLabelOf(month.key)}
                </div>

                <div className="space-y-4">
                  {TYPE_ORDER.map((type) => {
                    const items = month.content.filter((x) => x.type === type)
                    if (items.length === 0) return null
                    return (
                      <div key={type}>
                        <div className="mb-2 text-[11px] font-semibold text-taupe">
                          {type} ({items.length})
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          {items.map((c) => (
                            <ManagerContentCard key={c.id} item={c} clientName={clientName(c.clientId)} />
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {month.campaigns.length > 0 && (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold text-taupe">
                        {t('appr_campaigns')} ({month.campaigns.length})
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {month.campaigns.map((c) => (
                          <CampaignReviewCard key={c.id} c={c} clientName={clientName(c.clientId)} managerReview />
                        ))}
                      </div>
                    </div>
                  )}

                  {other.length > 0 && (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold text-taupe">
                        {t('appr_other')} ({other.length})
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {other.map((c) => (
                          <ManagerContentCard key={c.id} item={c} clientName={clientName(c.clientId)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    )
  }

  // ---- Folder grid: active clients with pending items ----
  return (
  <div className="mx-auto max-w-5xl">
  <h1 className="text-2xl font-semibold text-taupe">{t('appr_mgrTitle')}</h1>
  <p className="mt-1 text-taupe-light">{t('appr_mgrSubtitle')}</p>
  <div className="mt-5"><ContentComposer manager /></div>

      <section className="mt-6 rounded-2xl border border-sand-dark bg-card p-5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-taupe">דוחות סיום קמפיין</h2><p className="text-xs text-taupe-light">הנתונים נכנסים כמשימה, נערכים פנימית, ורק לאחר אישור נשלחים ללקוח.</p></div><Megaphone className="h-5 w-5 text-taupe-light" /></div>
        <div className="mt-4 grid gap-4">
          {reportGroups.map(({ client, months }) => <section key={client.id} className="rounded-xl border border-sand-dark bg-background p-3"><h3 className="font-semibold text-taupe">{client.name}</h3>{months.map(({ month, reports }) => <div key={month} className="mt-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-taupe-light">{month}</p><div className="grid gap-3">{reports.map((report) => <CampaignReportEditor key={report.id} report={report} clientName={client.name} onUpdate={updateCampaignReport} onReview={reviewCampaignReport} />)}</div></div>)}</section>)}
          {paidCampaigns.filter((campaign) => new Date(campaign.endDate) <= new Date() && !campaignReports.some((report) => report.campaignId === campaign.id)).map((campaign) => <button key={campaign.id} type="button" onClick={() => createCampaignReport({ campaignId: campaign.id, clientId: campaign.clientId, title: `דוח סיום — ${campaign.title}`, highlights: 'הנתונים הטובים והנכונים מהקמפיין', metrics: 'תוצאות, לידים, חשיפות, עלות ומדדים מרכזיים', recommendations: 'המלצות להמשך', periodStart: campaign.startDate, periodEnd: campaign.endDate, recipientEmails: clientFolders.find((client) => client.id === campaign.clientId)?.contactEmail ? [clientFolders.find((client) => client.id === campaign.clientId)!.contactEmail] : [] })} className="rounded-xl border border-dashed border-sand-dark p-4 text-start text-sm font-semibold text-taupe hover:bg-secondary">+ צור דוח עבור {campaign.title}</button>)}
          {campaignReports.length === 0 && paidCampaigns.every((campaign) => new Date(campaign.endDate) > new Date()) && <p className="text-sm text-taupe-light">יופיע כאן דוח ברגע שקמפיין יסתיים.</p>}
        </div>
      </section>

      {groups.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-dark bg-card p-10 text-center text-taupe-light">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500/60" />
          {t('appr_empty')}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <button
              key={g.client.id}
              type="button"
              onClick={() => setOpenClientId(g.client.id)}
              className="flex flex-col rounded-2xl border border-sand-dark bg-card p-5 text-start transition hover:border-taupe-soft hover:shadow"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream text-sm font-semibold text-taupe">
                  {g.client.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.client.logo || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
                  ) : (
                    g.client.name.slice(0, 2)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-taupe">{g.client.name}</div>
                  <div className="truncate text-xs text-taupe-light">
                    {g.count} {t('appr_pendingItems')} · {g.months.length} {g.months.length === 1 ? t('appr_month') : t('appr_months')}
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 text-taupe-light ${he ? 'flip-x' : ''}`} />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-taupe px-3 py-2 text-white">
                <span className="text-xs">{t('appr_pendingReview')}</span>
                <span className="text-lg font-semibold">{g.count}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------- Employee Approval Center (my submissions) ---------------- */
const EMP_TYPES: ContentType[] = ['REEL', 'POST', 'STORY']

/* ---------------- Employee content composer: create and send to manager for approval ---------------- */
function ContentComposer({ manager = false }: { manager?: boolean }) {
  const { lang, clientFolders, addContent } = useApp()
  const he = lang === 'he'
  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState(clientFolders[0]?.id ?? '')
  const [type, setType] = useState<ContentType>('POST')
  const [platform, setPlatform] = useState<ContentPlatform>('Instagram')
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaKind, setMediaKind] = useState<'image' | 'video' | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setCaption(''); setLink(''); setMediaUrl(''); setMediaKind(undefined)
    if (fileRef.current) fileRef.current.value = ''
  }

  const onFile = async (f: File) => {
  const form = new FormData()
  form.append('file', f)
  form.append('clientId', clientId)
  const response = await fetch('/api/media', { method: 'POST', body: form })
  const data = await response.json() as { path?: string; kind?: 'image' | 'video'; error?: string }
  if (!response.ok || !data.path) { setMediaUrl(''); setMediaKind(undefined); return }
  setMediaUrl(data.path)
  setMediaKind(data.kind)
  }

  const canSend = !!clientId && (!!caption.trim() || !!mediaUrl || !!link.trim())

  const submit = () => {
    if (!canSend) return
    const body = link.trim() ? `${caption.trim()}${caption.trim() ? '\n' : ''}${link.trim()}` : caption.trim()
    // Sent to manager for review; on approval it moves to the client, then back to the employee to schedule
    addContent({ clientId, type, platform, caption: body, mediaUrl: mediaUrl || undefined, mediaKind, createdBy: manager ? 'Manager' : 'Employee', stage: 'manager_review' })
    reset()
    setOpen(false)
  }

  return (
    <div className="mb-6 rounded-2xl border border-sand-dark bg-card" dir={he ? 'rtl' : 'ltr'}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-taupe">
        <Plus className="h-4 w-4" />
        {he ? 'תוכן חדש — שליחה למנהל לאישור' : 'New content — send to manager'}
      </button>

      {open && (
        <div className="space-y-3 border-t border-sand-dark p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-taupe-light">
              {he ? 'לקוח' : 'Client'}
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe">
                {clientFolders.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-taupe-light">
              {he ? 'סוג' : 'Type'}
              <select value={type} onChange={(e) => setType(e.target.value as ContentType)} className="mt-1 w-full rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe">
                {EMP_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-taupe-light">
              {he ? 'פלטפורמה' : 'Platform'}
              <select value={platform} onChange={(e) => setPlatform(e.target.value as ContentPlatform)} className="mt-1 w-full rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe">
                {ALL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Media upload or link */}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-sand-dark px-3 py-2 text-xs font-medium text-taupe hover:bg-sand">
              <Upload className="h-3.5 w-3.5" />
              {he ? 'תמונה / סרטון' : 'Image / video'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
            <span className="text-xs text-taupe-light">{he ? 'או' : 'or'}</span>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-sand-dark bg-secondary px-2.5">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-taupe-light" />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={he ? 'הדבק לינק' : 'Paste link'} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none" />
            </div>
          </div>

          {mediaUrl && (
            mediaKind === 'video' ? (
              <video src={mediaUrl} className="max-h-48 w-full rounded-lg bg-black object-contain" controls />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl || '/placeholder.svg'} alt="" className="max-h-48 w-full rounded-lg bg-secondary object-contain" />
            )
          )}

          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder={he ? 'כיתוב הפוסט / הערה' : 'Caption / note'} className="w-full resize-none rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe" />

          <button type="button" disabled={!canSend} onClick={submit} className="flex items-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light disabled:opacity-40">
            <Send className={`h-4 w-4 ${he ? 'flip-x' : ''}`} />
            {he ? 'שלח למנהל' : 'Send to manager'}
          </button>
        </div>
      )}
    </div>
  )
}

  /* ---------------- Approval review continues in the central Calendar ---------------- */
  function ScheduleCardRemoved({ item, clientName }: { item: ContentItem; clientName: string }) {
  const { lang, scheduleContent } = useApp()
  const he = lang === 'he'
  const [date, setDate] = useState(item.scheduledDate ?? '')
  const [time, setTime] = useState(item.time ?? '')
  const matrix = OPTIMAL_TIMES[item.platform] ?? []

  return (
    <div className="rounded-xl border border-sand-dark bg-card p-3" dir={he ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[item.type]}`}>{item.type}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.caption}</span>
        <span className="shrink-0 text-xs text-taupe-light">{clientName}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-sand-dark bg-secondary px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-taupe" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-sand-dark bg-secondary px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-taupe" />
        <button
          type="button"
          disabled={!date || !time}
          onClick={() => scheduleContent(item.id, date, time)}
          className="flex items-center gap-1.5 rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light disabled:opacity-40"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {he ? 'תזמן ללוח' : 'Schedule'}
        </button>
      </div>
      {/* Matrix: optimal publishing windows for the platform */}
      {matrix.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-taupe-light">{he ? 'שעות מומלצות:' : 'Optimal:'}</span>
          {matrix.map((mt) => (
            <button key={mt} type="button" onClick={() => setTime(mt)} className={`rounded-full border px-2 py-0.5 text-[10px] ${time === mt ? 'border-taupe bg-taupe text-white' : 'border-sand-dark text-taupe hover:bg-sand'}`}>
              {mt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------- Fix card: re-upload media / link / caption after a change request ---------------- */
function FixCard({ item, clientName }: { item: ContentItem; clientName: string }) {
  const { t, lang, resolveEdit } = useApp()
  const he = lang === 'he'
  const [caption, setCaption] = useState(item.caption)
  const [link, setLink] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(item.mediaUrl)
  const [mediaKind, setMediaKind] = useState<'image' | 'video' | undefined>(item.mediaKind)
  const [replaced, setReplaced] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f: File) => {
    setMediaUrl(URL.createObjectURL(f))
    setMediaKind(f.type.startsWith('video') ? 'video' : 'image')
    setReplaced(true)
  }

  const resubmit = () => {
    const body = link.trim() ? `${caption.trim()}${caption.trim() ? '\n' : ''}${link.trim()}` : caption
    resolveEdit(item.id, { mediaUrl, mediaKind, caption: body })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-card" dir={he ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 border-b border-sand-dark px-4 py-3">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[item.type]}`}>{item.type}</span>
        <PlatformBadge platform={item.platform} />
        <span className="text-sm font-medium text-taupe">{item.platform}</span>
        <span className="ms-auto text-xs text-taupe-light">{t('appr_for')} {clientName}</span>
      </div>

      {mediaUrl && (
        mediaKind === 'video' ? (
          <video src={mediaUrl} className="aspect-square w-full bg-black object-contain" controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl || '/placeholder.svg'} alt="" className="aspect-square w-full bg-secondary object-contain" />
        )
      )}

      <div className="p-4">
        {/* Change request note from manager / client */}
        {item.comment && (
          <div className="mb-3 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-700">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-semibold">
                {item.editSource === 'ceo' ? t('appr_empFromManager') : t('appr_empFromClient')}:{' '}
              </span>
              {item.comment}
            </span>
          </div>
        )}

        {/* Re-upload media or paste a new link */}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-sand-dark px-3 py-2 text-xs font-medium text-taupe hover:bg-sand">
            <Upload className="h-3.5 w-3.5" />
            {replaced ? (he ? 'הוחלף' : 'Replaced') : (he ? 'העלה תיקון' : 'Upload fix')}
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
          <span className="text-xs text-taupe-light">{he ? 'או' : 'or'}</span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-sand-dark bg-secondary px-2.5">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-taupe-light" />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={he ? 'לינק חדש' : 'New link'} className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground outline-none" />
          </div>
        </div>

        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder={he ? 'כיתוב / הערה' : 'Caption / note'} className="mt-2 w-full resize-none rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe" />

        <button
          type="button"
          onClick={resubmit}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-taupe py-2 text-sm font-semibold text-white hover:bg-taupe-light"
        >
          <RotateCcw className="h-4 w-4" />
          {item.editSource === 'ceo' ? t('appr_empResubmitManager') : t('appr_empResubmitClient')}
        </button>
      </div>
    </div>
  )
}

function EmployeeApprovals() {
  const { t, lang, clientFolders, contentItems, employees, currentEmployeeId } = useApp()
  const he = lang === 'he'
  const clientName = (id: string) => clientFolders.find((c) => c.id === id)?.name ?? 'Client'

  // Only clients this employee is permitted to manage (allClients, or explicitly assigned ids)
  const me = employees.find((e) => e.id === currentEmployeeId) ?? employees.find((e) => e.name.toLowerCase().includes('evelyn'))
  const canSee = (clientId: string) =>
    !!clientFolders.find((folder) => folder.id === clientId) && (!!me?.permissions?.allClients || (me?.permissions?.clientIds ?? []).includes(clientId))
  const mine = contentItems.filter((c) => canSee(c.clientId))
  const rejected = mine.filter((c) => c.stage === 'needs_fix')
  const workflowItems = mine.filter((c) => c.stage !== 'draft')
  const monthKeyOf = (date?: string) => date?.slice(0, 7) ?? 'unscheduled'
  const monthLabelOf = (key: string) => {
    if (key === 'unscheduled') return he ? 'ללא חודש' : 'Unscheduled'
    const [year, month] = key.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString(he ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' })
  }
  const stageBadge = (item: ContentItem) => {
    if (item.stage === 'approved') return { label: he ? 'אושר על ידי מנהל ולקוח · מוכן לתזמון' : 'Approved by manager and client · ready to schedule', style: 'bg-emerald-100 text-emerald-700' }
    if (item.stage === 'client_review') return { label: he ? 'נשלח ללקוח · ממתין לאישור' : 'Sent to client · awaiting approval', style: 'bg-sky-100 text-sky-700' }
    if (item.stage === 'manager_review') return { label: he ? 'נשלח למנהל · ממתין לאישור' : 'Sent to manager · awaiting approval', style: 'bg-amber-100 text-amber-700' }
    return { label: he ? 'חזר לתיקונים' : 'Returned for edits', style: 'bg-rose-100 text-rose-700' }
  }
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const folderGroups = clientFolders
    .filter((folder) => canSee(folder.id))
    .map((folder) => {
      const items = workflowItems.filter((item) => item.clientId === folder.id)
      const months = Array.from(new Set(items.map((item) => monthKeyOf(item.scheduledDate)))).sort().map((month) => ({ month, items: items.filter((item) => monthKeyOf(item.scheduledDate) === month) }))
      return { folder, months, count: items.length }
    })
    .filter((group) => group.count > 0)

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-taupe">{t('appr_empTitle')}</h1>
      <p className="mt-1 text-taupe-light">{he ? 'כל לקוח מופיע כתיקייה, ובתוכה החומרים מסודרים לפי חודש וסטטוס אישור.' : 'Each client has a folder with monthly submissions and approval status.'}</p>

      <div className="mt-6">
        <ContentComposer />
      </div>

      <div className="mt-6 rounded-xl border border-sand-dark bg-secondary px-4 py-3 text-xs text-taupe-light">{he ? 'תוכן עובר ללוח התכנון רק לאחר אישור כפול: מנהל וגם לקוח. רק שם ניתן לתזמן.' : 'Content moves to the planning board only after both manager and client approve it. Scheduling happens there.'}</div>

      {rejected.length > 0 && <>
        <h2 className="mt-6 mb-3 text-sm font-semibold text-taupe">{t('appr_empNeedsFix')} ({rejected.length})</h2>
        <div className="grid gap-4 md:grid-cols-2">{rejected.map((item) => <FixCard key={item.id} item={item} clientName={clientName(item.clientId)} />)}</div>
      </>}

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-taupe">{he ? 'תיקיות אישורים לפי לקוח וחודש' : 'Approval folders by client and month'}</h2>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-taupe-light">{workflowItems.length}</span>
      </div>
      {folderGroups.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-sand-dark py-8 text-center text-xs text-taupe-soft">{he ? 'עדיין לא נשלח תוכן לאישור.' : 'No content has been submitted for approval yet.'}</div>
      ) : (
        <div className="mt-3 space-y-4">
          {folderGroups.map(({ folder, months, count }) => (
            <section key={folder.id} className="rounded-2xl border border-sand-dark bg-card p-4">
              <div className="flex items-center justify-between gap-3 border-b border-sand-dark pb-3">
                <div><h3 className="font-semibold text-taupe">{folder.name}</h3><p className="text-xs text-taupe-light">{count} {he ? 'פריטי עבודה' : 'workflow items'}</p></div>
                <FolderOpen className="h-5 w-5 text-taupe-light" />
              </div>
              <div className="mt-4 space-y-4">
                {months.map(({ month, items }) => (
                  <div key={month}>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-taupe-light"><CalendarClock className="h-3.5 w-3.5" />{monthLabelOf(month)}</div>
                    <div className="space-y-2">
                      {items.map((item) => { const badge = stageBadge(item); const open = openItemId === item.id; return <div key={item.id} className="rounded-lg border border-sand-dark bg-background p-3"><button type="button" onClick={() => setOpenItemId(open ? null : item.id)} className="flex w-full flex-wrap items-center gap-3 text-start"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[item.type]}`}>{item.type}</span><span className="min-w-0 flex-1 text-sm text-foreground">{item.caption || (he ? 'ללא תיאור' : 'No caption')}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.style}`}>{badge.label}</span><ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="mt-3 border-t border-sand-dark pt-3"><p className="text-sm leading-6 text-foreground">{item.caption || (he ? 'ללא כיתוב' : 'No caption')}</p>{item.mediaUrl && (item.mediaKind === 'video' ? <video src={item.mediaUrl} controls playsInline preload="metadata" className="mt-3 max-h-72 w-full rounded-lg bg-black object-contain" /> : <img src={item.mediaUrl} alt="" className="mt-3 max-h-72 w-full rounded-lg bg-secondary object-contain" />)}{item.comment && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{item.comment}</p>}</div>}</div> })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export function ApprovalCenter() {
  const {
    t,
    role,
    clientFolders,
    contentItems,
    paidCampaigns,
    clientApproveContent,
    clientRequestEdit,
    toggleNotifyChannel,
    currentClientId,
  } = useApp()

  // Manager reviews everything first (content in CEO review + campaigns awaiting CEO).
  if (role === 'ceo') return <ManagerApprovals />
  // Employees track their submissions: approved, sent to client, and bounced-back edits.
  if (role === 'employee') return <EmployeeApprovals />
  const [tab, setTab] = useState<'content' | 'campaigns'>('content')
  const [typeFilter, setTypeFilter] = useState<ContentType | 'ALL'>('ALL')
  const [showPrefs, setShowPrefs] = useState(false)

  const clientName = (id: string) => clientFolders.find((c) => c.id === id)?.name ?? 'Client'

  // A client only ever sees their own content — everything is scoped to their folder.
  const inScope = (clientId: string) => clientId === currentClientId
  const myFolder = clientFolders.find((c) => c.id === currentClientId)

  const pendingContent = contentItems
    .filter((c) => c.stage === 'client_review')
    .filter((c) => inScope(c.clientId))
    .filter((c) => typeFilter === 'ALL' || c.type === typeFilter)
  const pendingCampaigns = paidCampaigns.filter((c) => c.status === 'client').filter((c) => inScope(c.clientId))
  const scheduled = contentItems.filter((c) => c.stage === 'approved').filter((c) => inScope(c.clientId))

  const empty = pendingContent.length === 0 && pendingCampaigns.length === 0

  // Notification prefs operate on the client's own folder
  const activeChannels = new Set<NotifyChannel>(myFolder?.notifyChannels ?? [])
  const toggleChannelAll = (channel: NotifyChannel) => {
    if (myFolder) toggleNotifyChannel(myFolder.id, channel)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-taupe">{t('appr_title')}</h1>
          <p className="mt-1 text-taupe-light">{t('appr_subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPrefs((s) => !s)}
          className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm font-medium text-taupe hover:bg-sand"
        >
          <Bell className="h-4 w-4" />
          {t('appr_notifyPrefs')}
        </button>
      </div>

      {/* Notification preferences */}
      {showPrefs && (
        <div className="mt-4 rounded-xl border border-sand-dark bg-card p-4">
          <div className="mb-1 text-sm font-semibold text-taupe">{t('appr_notifyTitle')}</div>
          <p className="mb-3 text-xs text-taupe-light">{t('appr_notifyDesc')}</p>
          <div className="flex flex-wrap gap-2">
            {NOTIFY_CHANNELS.map((ch) => {
              const on = activeChannels.has(ch)
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannelAll(ch)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    on ? 'bg-taupe text-white' : 'border border-sand-dark text-taupe hover:bg-sand'
                  }`}
                >
                  {t(CHANNEL_LABEL[ch])}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* The client's own approval queues */}
      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-lg border border-sand-dark bg-card p-1">
        <button
          type="button"
          onClick={() => setTab('content')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            tab === 'content' ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
          }`}
        >
          {t('appr_content')} ({contentItems.filter((c) => c.stage === 'client_review' && inScope(c.clientId)).length})
        </button>
        <button
          type="button"
          onClick={() => setTab('campaigns')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
            tab === 'campaigns' ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
          }`}
        >
          {t('appr_campaigns')} ({pendingCampaigns.length})
        </button>
      </div>

      {/* Type carousel filter */}
      {tab === 'content' && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTypeFilter(tf)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                typeFilter === tf ? 'bg-taupe text-white' : 'border border-sand-dark text-taupe hover:bg-sand'
              }`}
            >
              {tf === 'ALL' ? t('content_allTypes') : tf}
            </button>
          ))}
        </div>
      )}

      {empty && (
        <div className="mt-8 rounded-2xl border border-dashed border-sand-dark bg-card p-10 text-center text-taupe-light">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500/60" />
          {t('appr_empty')}
        </div>
      )}

      {/* Content queue */}
      {tab === 'content' && pendingContent.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pendingContent.map((c) => (
            <ReviewCard
              key={c.id}
              item={c}
              clientName={clientName(c.clientId)}
  onApprove={() => clientApproveContent(c.id)}
  />
          ))}
        </div>
      )}

      {/* Campaign queue */}
      {tab === 'campaigns' && pendingCampaigns.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pendingCampaigns.map((c) => (
            <CampaignReviewCard key={c.id} c={c} clientName={clientName(c.clientId)} />
          ))}
        </div>
      )}

      {/* Scheduled confirmation */}
      {tab === 'content' && scheduled.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-taupe-light">{t('appr_clientApproved')}</h2>
          <div className="flex flex-wrap gap-2">
            {scheduled.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
              >
                <Check className="h-3 w-3" />
                {c.type} · {clientName(c.clientId)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
