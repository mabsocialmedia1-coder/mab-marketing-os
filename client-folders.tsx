'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Folder,
  FolderOpen,
  ArrowLeft,
  KeyRound,
  FileText,
  Camera,
  Images,
  Megaphone,
  ListChecks,
  ScrollText,
  Upload,
  FileUp,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Lock,
  Printer,
  X,
  Send,
  Film,
  ImageIcon,
  Power,
  RotateCcw,
  Download,
  Palette,
  MessageSquare,
  Pencil,
  Link2,
} from 'lucide-react'
import { useApp } from '@/components/app-provider'
import {
  formatLogTime,
  getPackage,
  getPackageMonthlyQuota,
  packages,
  monthsSince,
  monthLabel,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_COMMISSION_RATE,
  type ActivityCategory,
  type CampaignObjective,
  type BudgetType,
  type ClientFolder,
  type ClientProject,
  type ClientProjectType,
  type MediaCategory,
  type PackageId,
  type ClientServiceType,
  type PaidCampaign,
  type Role,
} from '@/lib/data'
import type { TranslationKey } from '@/lib/i18n'

type Tab = 'passwords' | 'contracts' | 'photoshoot' | 'clientAssets' | 'brandAssets' | 'canva' | 'inbox' | 'campaigns' | 'operative' | 'logs'

const TABS: { key: Tab; label: TranslationKey | 'CANVA' | 'INBOX'; icon: typeof Folder; roles: Role[] }[] = [
  { key: 'passwords', label: 'folder_tab_passwords', icon: KeyRound, roles: ['ceo'] },
  { key: 'contracts', label: 'folder_tab_contracts', icon: FileText, roles: ['ceo'] },
  { key: 'photoshoot', label: 'folder_tab_photoshoot', icon: Camera, roles: ['ceo', 'employee'] },
  { key: 'clientAssets', label: 'folder_tab_clientAssets', icon: Images, roles: ['ceo', 'employee', 'client'] },
  { key: 'brandAssets', label: 'folder_tab_brandAssets', icon: Palette, roles: ['ceo', 'employee', 'client'] },
  { key: 'canva', label: 'CANVA', icon: Link2, roles: ['ceo', 'employee', 'client'] },
  { key: 'inbox', label: 'INBOX', icon: MessageSquare, roles: ['ceo', 'employee', 'client'] },
  { key: 'campaigns', label: 'folder_tab_campaigns', icon: Megaphone, roles: ['ceo', 'employee', 'client'] },
  { key: 'operative', label: 'folder_tab_operative', icon: ListChecks, roles: ['ceo', 'employee', 'client'] },
  { key: 'logs', label: 'folder_tab_logs', icon: ScrollText, roles: ['ceo', 'employee', 'client'] },
]

export function ActiveClients() {
  const { t, lang, role, clientFolders, setClientLogo, toggleClientActive, deleteClientFolder, employees, currentEmployeeId, currentClientId } = useApp()
  const [openId, setOpenId] = useState<string | null>(null)
  const [segment, setSegment] = useState<'active' | 'inactive'>('active')
  const [adding, setAdding] = useState(false)
  const folder = clientFolders.find((c) => c.id === openId) ?? null

  // A client only ever sees their own folder — open it directly, no list.
  if (role === 'client') {
    const own = clientFolders.find((c) => c.id === currentClientId)
    if (!own) {
      return (
        <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-sand-dark py-12 text-center text-sm text-taupe-soft">
          {t('clients_activeEmpty')}
        </div>
      )
    }
    return <FolderDetail folder={own} onBack={() => {}} />
  }

  const isCeo = role === 'ceo'
  // Non-CEO roles can never reach the inactive segment
  const effectiveSegment = isCeo ? segment : 'active'
  // Employees only see the client folders the manager granted them (nothing until granted).
  const myPerms = employees.find((e) => e.id === currentEmployeeId)?.permissions
  const visible = clientFolders
    .filter((c) => (effectiveSegment === 'active' ? c.active : !c.active))
    .filter((c) => {
      if (role !== 'employee') return true
      if (!myPerms) return false
      return myPerms.allClients || myPerms.clientIds.includes(c.id)
    })

  if (folder) return <FolderDetail folder={folder} onBack={() => setOpenId(null)} />

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-taupe">
            {effectiveSegment === 'active' ? t('clients_activeTitle') : t('clients_inactiveTitle')}
          </h1>
          <p className="mt-1 text-sm text-taupe-light">
            {effectiveSegment === 'active' ? t('clients_activeSubtitle') : t('clients_inactiveSubtitle')}
          </p>
        </div>
        {isCeo && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white transition hover:bg-taupe-light"
          >
            <Plus className="h-4 w-4" />
            {lang === 'he' ? 'הוסף לקוח' : 'Add client'}
          </button>
        )}
      </header>

      {adding && isCeo && <AddClientForm onClose={() => setAdding(false)} />}

      {/* Active / Inactive segmented control — Inactive is CEO-only */}
      {isCeo && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-sand-dark bg-card p-1">
            {(['active', 'inactive'] as const).map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => setSegment(seg)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  segment === seg ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
                }`}
              >
                {seg === 'active' ? t('clients_segActive') : t('clients_segInactive')}
                <span className="ms-1.5 opacity-70">
                  ({clientFolders.filter((c) => (seg === 'active' ? c.active : !c.active)).length})
                </span>
              </button>
            ))}
          </div>
          {segment === 'inactive' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-[11px] font-medium text-taupe">
              <Lock className="h-3 w-3" />
              {t('clients_inactiveCeoOnly')}
            </span>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-dark py-12 text-center text-sm text-taupe-soft">
          {effectiveSegment === 'active' ? t('clients_activeEmpty') : t('clients_inactiveEmpty')}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => {
            const pkg = getPackage(c.packageId)
            return (
              <div
                key={c.id}
                className={`flex flex-col rounded-2xl border border-sand-dark bg-card p-5 ${
                  c.active ? '' : 'opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClientLogo folder={c} onUpload={(url) => setClientLogo(c.id, url)} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-taupe">{c.name}</span>
                      {!c.active && (
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-taupe-light">
                          {t('clients_statusInactive')}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-taupe-light">
                      {lang === 'he' ? c.businessTypeHe : c.businessType}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-taupe px-2.5 py-0.5 text-xs font-medium text-white">
                    {t(pkg.nameKey)}
                  </span>
                  <span className="text-xs text-taupe-light">{c.since}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(c.id)}
                  className="mt-4 rounded-lg border border-sand-dark py-2 text-sm font-medium text-taupe transition hover:bg-sand"
                >
                  {t('clients_openFolder')}
                </button>
                {/* CEO-only activate / deactivate control */}
                {isCeo && (
                  <button
                    type="button"
                    onClick={() => toggleClientActive(c.id)}
                    className={`mt-2 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition ${
                      c.active
                        ? 'text-taupe-light hover:bg-rose-50 hover:text-rose-600'
                        : 'text-taupe-light hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {c.active ? <Power className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    {c.active ? t('clients_deactivate') : t('clients_reactivate')}
                  </button>
                )}
                {isCeo && (
                  <button
                    type="button"
                    onClick={() => {
                      const message = lang === 'he'
                        ? `האם את/ה בטוח/ה שברצונך למחוק את הלקוח "${c.name}"? המחיקה אינה ניתנת לביטול.`
                        : `Are you sure you want to permanently delete "${c.name}"? This cannot be undone.`
                      if (window.confirm(message)) void deleteClientFolder(c.id)
                    }}
                    className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {lang === 'he' ? 'מחיקת לקוח' : 'Delete client'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------------- Add Client (manager creates login + picks package) ---------------- */
function genUsername(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'client'
  return `${base}${Math.floor(100 + Math.random() * 900)}`
}
function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const sym = '!@#$%&*'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out + sym[Math.floor(Math.random() * sym.length)] + Math.floor(10 + Math.random() * 90)
}

function AddClientForm({ onClose, initial, clientId }: { onClose: () => void; initial?: ClientFolder; clientId?: string }) {
  const { t, lang, addClientFolder, updateClientFolder } = useApp()
  const he = lang === 'he'
  const portalCredential = initial?.credentials.find((item) => item.platform === 'Client Portal')
  const [name, setName] = useState(initial?.name ?? '')
  const [businessType, setBusinessType] = useState(initial?.businessType ?? '')
  const [businessTypeHe, setBusinessTypeHe] = useState(initial?.businessTypeHe ?? '')
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '')
  const [businessAddress, setBusinessAddress] = useState(initial?.businessAddress ?? '')
  const [businessPhone, setBusinessPhone] = useState(initial?.businessPhone ?? '')
  const [importantEmails, setImportantEmails] = useState((initial?.importantEmails ?? []).join(', '))
  const [serviceType, setServiceType] = useState<ClientServiceType>(initial?.serviceType ?? 'socialMedia')
  const [packageId, setPackageId] = useState<PackageId>(initial?.packageId ?? 'gold')
  const [contractStartDate, setContractStartDate] = useState(initial?.contractStartDate ?? '')
  const [publishingStartDate, setPublishingStartDate] = useState(initial?.publishingStartDate ?? '')
  const [username, setUsername] = useState(portalCredential?.username ?? genUsername(''))
  const [password, setPassword] = useState(clientId ? '' : genPassword())
  const [changePassword, setChangePassword] = useState(false)
  const [showPw, setShowPw] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metaConnected, setMetaConnected] = useState(false)
  const [metaPages, setMetaPages] = useState<Array<{ id: string; name: string; instagram_business_account?: { id?: string; username?: string } }>>([])
  const [metaPermissions, setMetaPermissions] = useState<Array<{ permission: string; status: string }>>([])
  const [metaPageId, setMetaPageId] = useState(initial?.metaPageId ?? '')
  const [metaInstagramId, setMetaInstagramId] = useState(initial?.metaInstagramId ?? '')
  const [metaApproved, setMetaApproved] = useState(Boolean(initial?.metaPageId))
  const [metaApproving, setMetaApproving] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    const message = new URLSearchParams(window.location.search).get('metaMessage')
    if (message) setMetaError(message)
    let cancelled = false
    void fetch(`/api/meta/status?clientId=${encodeURIComponent(clientId)}`)
      .then(async (response) => {
        const result = await response.json() as { connected?: boolean; pages?: typeof metaPages; permissions?: Array<{ permission: string; status: string }>; error?: string }
        if (cancelled) return
        if (!response.ok) { setMetaError(result.error ?? 'לא ניתן לקרוא את חיבור Meta כרגע.'); return }
        setMetaConnected(Boolean(result.connected))
        setMetaPages(result.pages ?? [])
        setMetaPermissions(result.permissions ?? [])
      })
      .catch(() => { if (!cancelled) setMetaError('לא ניתן לבדוק את חיבור Meta כרגע.') })
    return () => { cancelled = true }
  }, [clientId])

  const selectedMetaPage = metaPages.find((page) => page.id === metaPageId)
  const connectMeta = () => { if (clientId) window.location.href = `/api/meta/connect?clientId=${encodeURIComponent(clientId)}` }
  const approveMetaConnection = async () => {
    if (!clientId || !metaPageId || !metaInstagramId || !selectedMetaPage) return
    setMetaApproving(true)
    setMetaError(null)
    try {
      await updateClientFolder(clientId, { metaPageId, metaPageName: selectedMetaPage.name, metaInstagramId, metaInstagramUsername: selectedMetaPage.instagram_business_account?.username })
      setMetaApproved(true)
    } catch (cause) {
      setMetaError(cause instanceof Error ? cause.message : (he ? 'אישור החיבור נכשל' : 'Could not approve the connection'))
    } finally {
      setMetaApproving(false)
    }
  }

  const copy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  }

  const inputClass = 'w-full rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'
  const canSave = !!name.trim() && !!contactEmail.trim() && !!username.trim() && (!changePassword && clientId || !!password.trim()) && !saving

  const submit = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
const contactFields = { name, businessType, businessTypeHe, contactEmail, businessAddress, businessPhone, importantEmails: importantEmails.split(',').map((email) => email.trim()).filter(Boolean), packageId, serviceType, contractStartDate: contractStartDate || undefined, publishingStartDate: publishingStartDate || undefined, portalUsername: username, ...(password.trim() && changePassword || !clientId ? { portalPassword: password } : {}), metaPageId: metaPageId || undefined, metaPageName: selectedMetaPage?.name, metaInstagramId: metaInstagramId || undefined, metaInstagramUsername: selectedMetaPage?.instagram_business_account?.username }
  if (clientId) await updateClientFolder(clientId, contactFields)
  else await addClientFolder(contactFields)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (he ? 'שמירת הלקוח נכשלה' : 'Could not save the client'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-taupe/30 p-4">
      <div
        dir={he ? 'rtl' : 'ltr'}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-sand-dark bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-taupe">{clientId ? (he ? 'עריכת פרטי לקוח' : 'Edit client details') : (he ? 'הוספת לקוח חדש' : 'Add new client')}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-taupe-light hover:bg-sand hover:text-taupe">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-taupe-light">
            {he ? 'שם העסק' : 'Business name'}
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setUsername(genUsername(e.target.value)) }}
              placeholder={he ? 'שם הלקוח' : 'Client name'}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-taupe-light">
              {he ? 'תחום (אנגלית)' : 'Business type (EN)'}
              <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Real Estate" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="block text-xs font-medium text-taupe-light">
              {he ? 'תחום (עברית)' : 'Business type (HE)'}
              <input value={businessTypeHe} onChange={(e) => setBusinessTypeHe(e.target.value)} placeholder="נדל״ן" className={`mt-1 ${inputClass}`} />
            </label>
          </div>

          <label className="block text-xs font-medium text-taupe-light">
            {he ? 'אימייל ליצירת קשר' : 'Contact email'}
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@client.com" className={`mt-1 ${inputClass}`} />
  </label>

  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block text-xs font-medium text-taupe-light">{he ? 'טלפון העסק' : 'Business phone'}<input dir="ltr" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+1 305 555 0100" className={`mt-1 ${inputClass}`} /></label>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="block text-xs font-medium text-taupe-light">{he ? 'תחילת חוזה' : 'Contract start'}<input dir="ltr" type="date" value={contractStartDate} onChange={(e) => setContractStartDate(e.target.value)} className={`mt-1 ${inputClass}`} /></label>
  <label className="block text-xs font-medium text-taupe-light">{he ? 'תחילת פרסום' : 'Publishing start'}<input dir="ltr" type="date" value={publishingStartDate} onChange={(e) => setPublishingStartDate(e.target.value)} className={`mt-1 ${inputClass}`} /></label>
  </div>
  {clientId && <div className="rounded-xl border border-sand-dark bg-secondary p-3"><div className="flex items-center justify-between gap-3"><div><div className="text-sm font-semibold text-taupe">{he ? 'חיבור Meta' : 'Meta connection'}</div><p className="mt-1 text-[11px] text-taupe-light">{metaConnected ? (he ? 'מחובר ✓' : 'Connected ✓') : (he ? 'חיבור Facebook ו־Instagram Business לפרסום לאחר אישור.' : 'Connect Facebook and Instagram Business for publishing after approval.')}</p></div>{!metaConnected && <button type="button" onClick={connectMeta} className="shrink-0 rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-card hover:bg-taupe/90">{he ? 'חיבור Meta' : 'Connect Meta'}</button>}{metaConnected && <button type="button" onClick={() => { if (clientId) window.location.href = `/api/meta/disconnect?clientId=${encodeURIComponent(clientId)}` }} className="shrink-0 rounded-lg border border-taupe/30 px-3 py-2 text-xs font-semibold text-taupe hover:bg-card">{he ? 'נתק וחבר מחדש' : 'Disconnect and reconnect'}</button>}</div>{metaError && <p className="mt-2 text-xs text-rose-600">{metaError}</p>}{metaConnected && metaPermissions.length > 0 && <details className="mt-3 rounded-lg border border-sand-dark bg-card p-3"><summary className="cursor-pointer text-xs font-semibold text-taupe">{he ? 'הרשאות Meta שניתנו' : 'Granted Meta permissions'}</summary><ul className="mt-2 grid gap-1 text-[11px] text-taupe-light">{metaPermissions.map(({ permission, status }) => <li key={permission}><span className="font-medium text-taupe">{({ pages_show_list: 'רשימת דפי Facebook', pages_read_engagement: 'קריאת פעילות בדפים', pages_manage_metadata: 'ניהול הגדרות דפים', pages_manage_posts: 'ניהול פוסטים בדפים', instagram_basic: 'גישה בסיסית ל־Instagram', instagram_content_publish: 'פרסום ב־Instagram', business_management: 'ניהול Business Portfolio' } as Record<string, string>)[permission] ?? permission}</span>: {status === 'granted' ? (he ? 'אושרה' : 'granted') : status}</li>)}</ul></details>}{metaConnected && metaPages.length === 0 && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{he ? 'החיבור הצליח, אבל Meta לא החזיר דפי Facebook. ודאי שהמשתמש הזה מנהל את הדף ואשרי הרשאות Pages בחלון החיבור, ואז התחברי מחדש.' : 'Meta is connected, but no Facebook Pages were returned. Make sure this user manages the Page and approve Pages permissions, then reconnect.'}</p>}{metaConnected && metaPages.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-medium text-taupe-light">{he ? 'דף Facebook' : 'Facebook Page'}<select value={metaPageId} onChange={(event) => { setMetaPageId(event.target.value); setMetaInstagramId('') }} className={`mt-1 ${inputClass}`}><option value="">{he ? 'בחר דף' : 'Select a Page'}</option>{metaPages.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}</select></label><label className="block text-xs font-medium text-taupe-light">{he ? 'חשבון Instagram Business' : 'Instagram Business account'}<select value={metaInstagramId} onChange={(event) => setMetaInstagramId(event.target.value)} disabled={!selectedMetaPage?.instagram_business_account?.id} className={`mt-1 ${inputClass}`}><option value="">{selectedMetaPage?.instagram_business_account ? (he ? 'בחר חשבון' : 'Select an account') : (he ? 'אין חשבון מקושר' : 'No linked account')}</option>{selectedMetaPage?.instagram_business_account?.id && <option value={selectedMetaPage.instagram_business_account.id}>{selectedMetaPage.instagram_business_account.username ?? selectedMetaPage.instagram_business_account.id}</option>}</select></label></div>}{metaConnected && metaPages.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" disabled={!metaPageId || !metaInstagramId || metaApproving} onClick={() => void approveMetaConnection()} className="rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-card disabled:cursor-not-allowed disabled:opacity-50">{metaApproving ? (he ? 'שומר...' : 'Saving...') : (he ? 'אישור וחיבור לתיקייה וללוח שנה' : 'Approve and connect to folder and calendar')}</button>{metaApproved && <span className="text-xs font-semibold text-emerald-700">{he ? 'החיבור אושר ונשמר ✓' : 'Connection approved and saved ✓'}</span>}</div>}</div>}
  <label className="block text-xs font-medium text-taupe-light">{he ? 'מיילים ח��ובים' : 'Important emails'}<input type="text" value={importantEmails} onChange={(e) => setImportantEmails(e.target.value)} placeholder={he ? 'הפרד בין כתובות בפסיק' : 'Separate addresses with commas'} className={`mt-1 ${inputClass}`} /><span className="mt-1 block text-[11px] font-normal text-taupe-light">{he ? 'אפשר להוסיף כמה כתובות, מופרדות בפסיקים' : 'Add multiple addresses separated by commas'}</span></label>
  
          {/* Package selection */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-taupe-light">{he ? 'שירות / Package' : 'Service / Package'}</span>
            <div className="grid gap-2 sm:grid-cols-4">
              {([
                ['website', he ? 'אתר אינטרנט' : 'Website'],
                ['socialMedia', he ? 'סושיאל מדיה' : 'Social Media'],
                ['google', 'Google'],
                ['ads', he ? 'מודעות' : 'Ads'],
              ] as const).map(([type, label]) => (
                <button key={type} type="button" onClick={() => setServiceType(type)} className={`rounded-xl border p-3 text-start transition ${serviceType === type ? 'border-taupe bg-cream' : 'border-sand-dark hover:bg-secondary'}`}>
                  <div className="text-sm font-semibold text-taupe">{label}</div>
                  <div className="text-xs text-taupe-light">{he ? 'סכום ידני' : 'Custom amount'}</div>
                </button>
              ))}
            </div>
            {serviceType === 'socialMedia' && <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {packages.map((p) => <button key={p.id} type="button" onClick={() => setPackageId(p.id)} className={`rounded-xl border p-3 text-start transition ${packageId === p.id ? 'border-taupe bg-cream' : 'border-sand-dark hover:bg-secondary'}`}><div className="text-sm font-semibold text-taupe">{t(p.nameKey)}</div></button>)}
            </div>}
          
          </div>

          {/* Generated portal login */}
          <div className="rounded-xl border border-sand-dark bg-secondary p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-taupe">
              <KeyRound className="h-3.5 w-3.5" />
              {he ? 'פרטי כניסה ללקוח' : 'Client login'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={he ? 'שם משתמש' : 'Username'} className={`flex-1 ${inputClass}`} />
                <button type="button" onClick={() => copy('u', username)} className="rounded-md border border-sand-dark p-2 text-taupe hover:bg-sand" title={he ? 'העתק' : 'Copy'}>
                  {copied === 'u' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              {(!clientId || changePassword) && <div className="flex items-center gap-2">
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
                <button type="button" onClick={() => { setUsername(genUsername(name)); setPassword(genPassword()) }} className="rounded-md border border-sand-dark p-2 text-taupe hover:bg-sand" title={he ? 'הפק מחדש' : 'Regenerate'}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>}
              {clientId && !changePassword && <button type="button" onClick={() => { setChangePassword(true); setPassword('') }} className="text-start text-xs font-semibold text-taupe underline underline-offset-2">{he ? 'שנה סיסמה' : 'Change password'}</button>}
            </div>
          </div>
        </div>

        {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="sticky bottom-0 mt-5 flex justify-end gap-2 border-t border-sand-dark bg-card pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-sand-dark px-4 py-2 text-sm font-medium text-taupe hover:bg-sand">
            {he ? 'ביטול' : 'Cancel'}
          </button>
          <button type="button" disabled={!canSave} onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-taupe px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-taupe-light disabled:cursor-not-allowed disabled:opacity-40">
            <Check className="h-4 w-4" />
            {saving ? (he ? 'שומר...' : 'Saving...') : clientId ? (he ? 'אישור ושמירת שינויים' : 'Confirm and save changes') : (he ? 'אישור ויצירת לקוח' : 'Confirm and create client')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ClientLogo({
  folder,
  onUpload,
  size = 'md',
}: {
  folder: ClientFolder
  onUpload: (dataUrl: string) => void
  size?: 'md' | 'lg'
}) {
  const { t, role } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const dim = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'
  const canUpload = role !== 'client'

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => onUpload(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative shrink-0">
      <span className={`flex ${dim} items-center justify-center overflow-hidden rounded-xl bg-cream text-taupe`}>
        {folder.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={folder.logo || '/placeholder.svg'} alt={`${folder.name} logo`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <Folder className="h-5 w-5" />
        )}
      </span>
      {canUpload && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            title={folder.logo ? t('clients_changeLogo') : t('clients_uploadLogo')}
            className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-taupe text-white shadow"
          >
            <Upload className="h-2.5 w-2.5" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </>
      )}
    </div>
  )
}

function ProjectManager({ folder }: { folder: ClientFolder }) {
  const { lang, role, employees, updateClientFolder } = useApp()
  const canManage = role === 'ceo' || role === 'employee'
  const [projects, setProjects] = useState<ClientProject[]>(folder.projects ?? [{ id: 'social-default', name: 'Social Media', type: 'socialMedia', notes: '', tasks: [], employeeIds: [], folders: ['Passwords', 'Contracts', 'Photoshoot', 'Client Assets', 'Brand Assets', 'Canva', 'Campaigns', 'Tasks'] }])
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')
  const [newType, setNewType] = useState<ClientProjectType>('custom')
  const [newName, setNewName] = useState('')
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0]
  const save = async (nextProjects: ClientProject[]) => { setProjects(nextProjects); await updateClientFolder(folder.id, { projects: nextProjects }) }
  const addProject = () => { const name = newName.trim() || (newType === 'google' ? 'Google' : newType === 'campaigns' ? 'Campaigns' : newType === 'website' ? 'Website' : newType === 'socialMedia' ? 'Social Media' : 'New Project'); const project: ClientProject = { id: `project-${Date.now()}`, name, type: newType, notes: '', tasks: [], employeeIds: [], folders: ['Notes', 'Tasks', 'Files'] }; void save([...projects, project]); setSelectedId(project.id); setNewName('') }
  if (!canManage || !selected) return null
  return <section className="mb-5 rounded-2xl border border-sand-dark bg-secondary p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-taupe-light">{lang === 'he' ? 'פרויקטים של הלקוח' : 'Client projects'}</p><h2 className="mt-1 text-lg font-semibold text-taupe">{lang === 'he' ? 'בחירת מבנה תיקייה' : 'Choose the client workspace'}</h2></div><div className="flex flex-wrap gap-2"><select value={newType} onChange={(event) => setNewType(event.target.value as ClientProjectType)} className="rounded-lg border border-sand-dark bg-card px-2 py-2 text-xs text-taupe"><option value="socialMedia">Social Media</option><option value="google">Google</option><option value="campaigns">Campaigns</option><option value="website">Website</option><option value="custom">Custom</option></select><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={lang === 'he' ? 'שם פרויקט' : 'Project name'} className="w-32 rounded-lg border border-sand-dark bg-card px-2 py-2 text-xs text-taupe" /><button type="button" onClick={addProject} className="inline-flex items-center gap-1 rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />{lang === 'he' ? 'הוסף' : 'Add'}</button></div></div><div className="mt-4 flex flex-wrap gap-2">{projects.map((project) => <button type="button" key={project.id} onClick={() => setSelectedId(project.id)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selected.id === project.id ? 'border-taupe bg-card text-taupe' : 'border-sand-dark text-taupe-light'}`}>{project.name}</button>)}</div><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold text-taupe">{lang === 'he' ? 'הערות לפרויקט' : 'Project notes'}<textarea value={selected.notes} onChange={(event) => void save(projects.map((project) => project.id === selected.id ? { ...project, notes: event.target.value } : project))} className="mt-1 min-h-20 w-full rounded-lg border border-sand-dark bg-card p-2 text-sm font-normal text-taupe" /></label><label className="text-xs font-semibold text-taupe">{lang === 'he' ? 'משימות לפרויקט' : 'Project tasks'}<textarea value={selected.tasks.join('\n')} onChange={(event) => void save(projects.map((project) => project.id === selected.id ? { ...project, tasks: event.target.value.split('\n').map((task) => task.trim()).filter(Boolean) } : project))} placeholder={lang === 'he' ? 'משימה בכל שורה' : 'One task per line'} className="mt-1 min-h-20 w-full rounded-lg border border-sand-dark bg-card p-2 text-sm font-normal text-taupe" /></label></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-taupe">{lang === 'he' ? 'עובדים בפרויקט' : 'Assigned employees'}</span>{employees.map((employee) => <label key={employee.id} className="inline-flex items-center gap-1 rounded-full border border-sand-dark bg-card px-2 py-1 text-xs text-taupe"><input type="checkbox" checked={selected.employeeIds.includes(employee.id)} onChange={(event) => void save(projects.map((project) => project.id === selected.id ? { ...project, employeeIds: event.target.checked ? [...project.employeeIds, employee.id] : project.employeeIds.filter((id) => id !== employee.id) } : project))} />{employee.name}</label>)}</div><p className="mt-3 text-[11px] text-taupe-light">{lang === 'he' ? 'כל פרויקט יכול לכלול תיקיות משלו; Social Media הוא המבנה הראשי לברירת מחדל.' : 'Each project can have its own folders; Social Media is the default workspace.'}</p></section>
}

function FolderDetail({ folder, onBack }: { folder: ClientFolder; onBack: () => void }) {
  const { t, lang, role, setClientLogo, employees, currentEmployeeId, updateClientFolder, updateClientSocialSettings } = useApp()
  const [editingDetails, setEditingDetails] = useState(false)
  const [strategyIdeas, setStrategyIdeas] = useState(folder.strategyIdeas ?? '')
  const [savingStrategy, setSavingStrategy] = useState(false)
  const [newHashtagSet, setNewHashtagSet] = useState({ name: '', tags: '' })
  const [newCollab, setNewCollab] = useState('')
  const pkg = getPackage(folder.packageId)
  // An employee only sees the contracts & pricing tab when the manager has granted it.
  const myPerms = employees.find((e) => e.id === currentEmployeeId)?.permissions
  const tabs = TABS.filter((tb) => {
    if (!role) return false
    if (tb.roles.includes(role)) return true
    if (role === 'employee' && tb.key === 'contracts' && myPerms?.canSeeContracts) return true
    return false
  })
  const [tab, setTab] = useState<Tab>(tabs[0]?.key ?? 'clientAssets')

  useEffect(() => {
    if (!tabs.some((item) => item.key === tab)) setTab(tabs[0]?.key ?? 'clientAssets')
  }, [folder.id, role, tab, tabs])

  return (
    <div className="mx-auto max-w-5xl">
      {role !== 'client' && (
        <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-4 py-2 text-sm font-semibold text-taupe shadow-sm transition hover:bg-sand hover:shadow">
          <ArrowLeft className="h-4 w-4 flip-x" />
          {t('clients_backFolders')}
        </button>
      )}

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-sand-dark bg-card p-5">
        <ClientLogo folder={folder} onUpload={(url) => setClientLogo(folder.id, url)} size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-taupe">{folder.name}</h1>
          <div className="text-sm text-taupe-light">
            {lang === 'he' ? folder.businessTypeHe : folder.businessType} · {t(pkg.nameKey)}
          </div>
        </div>
        {role === 'ceo' && <button type="button" onClick={() => setEditingDetails(true)} className="ms-auto inline-flex items-center gap-2 rounded-lg border border-sand-dark px-3 py-2 text-sm font-semibold text-taupe hover:bg-secondary"><Pencil className="h-4 w-4" />{lang === 'he' ? 'עריכת חבילה ופרטי לקוח' : 'Edit package and client details'}</button>}
      </div>
      {editingDetails && role === 'ceo' && <AddClientForm clientId={folder.id} initial={folder} onClose={() => setEditingDetails(false)} />}
  <section className="mb-5 grid gap-3 rounded-2xl border border-sand-dark bg-card p-4 sm:grid-cols-3">
  <div><div className="text-xs font-semibold text-taupe-light">{lang === 'he' ? 'תחילת חוזה' : 'Contract start'}</div><div className="mt-1 text-sm text-taupe">{folder.contractStartDate || (lang === 'he' ? 'לא הוזן' : 'Not set')}</div></div>
  <div><div className="text-xs font-semibold text-taupe-light">{lang === 'he' ? 'תחילת פרסום' : 'Publishing start'}</div><div className="mt-1 text-sm text-taupe">{folder.publishingStartDate || (lang === 'he' ? 'לא הוזן' : 'Not set')}</div></div>
  <div><div className="text-xs font-semibold text-taupe-light">{lang === 'he' ? 'מכסת פוסטים ורילסים לחודש' : 'Monthly posts and reels quota'}</div><div className="mt-1 text-sm text-taupe">{(() => { const quota = getPackageMonthlyQuota(folder.packageId); return `${quota.posts} פוסטים · ${quota.reels} רילסים` })()}</div></div>
  </section>

  <section className="mb-5 grid gap-3 rounded-2xl border border-sand-dark bg-card p-4 sm:grid-cols-3">
  <div><div className="text-xs font-semibold text-taupe-light">{lang === 'he' ? 'כתובת העסק' : 'Business address'}</div><div dir="ltr" className="mt-1 text-start text-sm text-taupe" style={{ unicodeBidi: 'plaintext' }}>{folder.businessAddress || (lang === 'he' ? 'לא הוזנה כתובת' : 'No address added')}</div></div>
  <div><div className="text-xs font-semibold text-taupe-light">{lang === 'he' ? 'טלפון העסק' : 'Business phone'}</div><div dir="ltr" className="mt-1 text-start text-sm text-taupe" style={{ unicodeBidi: 'plaintext' }}>{folder.businessPhone || (lang === 'he' ? 'לא הוזן טלפון' : 'No phone added')}</div></div>
  <div><div className="text-xs font-semibold text-taupe-light">{lang === 'he' ? 'מיילים חשובים' : 'Important emails'}</div><div className="mt-1 space-y-1 text-sm text-taupe">{folder.importantEmails?.length ? folder.importantEmails.map((email) => <div key={email}>{email}</div>) : <div>{lang === 'he' ? 'לא הוזנו מיילים' : 'No emails added'}</div>}</div></div>
  </section>

  <section className="mb-5 rounded-2xl border border-sand-dark bg-card p-4">
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-taupe">{lang === 'he' ? 'אסטרטגיה ורעיונות לתכנון' : 'Strategy and planning ideas'}</h2>
      <p className="mt-1 text-xs text-taupe-light">{lang === 'he' ? 'התוכן נשמר בתיקייה של הלקוח הזה בלבד.' : 'These notes are saved only inside this client folder.'}</p>
    </div>
    {role === 'ceo' || role === 'employee' ? <>
      <textarea value={strategyIdeas} onChange={(event) => setStrategyIdeas(event.target.value)} rows={5} placeholder={lang === 'he' ? 'רעיונות, כיוונים, קהלים ותכנון תוכן...' : 'Ideas, directions, audiences, and content planning...'} className="w-full rounded-lg border border-sand-dark bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-taupe" />
      <button type="button" disabled={savingStrategy} onClick={async () => { setSavingStrategy(true); try { await updateClientFolder(folder.id, { strategyIdeas }) } finally { setSavingStrategy(false) } }} className="mt-3 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light disabled:opacity-50">{savingStrategy ? (lang === 'he' ? 'שומר...' : 'Saving...') : (lang === 'he' ? 'שמירת אסטרטגיה ורעיונות' : 'Save strategy and ideas')}</button>
    </> : <p className="whitespace-pre-wrap text-sm leading-6 text-taupe">{strategyIdeas || (lang === 'he' ? 'עדיין לא נשמרו רעיונות.' : 'No ideas saved yet.')}</p>}
  </section>

  <ProjectManager folder={folder} />

  {/* Tabs */}
  <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-sand-dark bg-card p-1">
        {tabs.map((tb) => {
          const Icon = tb.icon
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === tb.key ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tb.label === 'CANVA' || tb.label === 'INBOX' ? tb.label : t(tb.label)}
            </button>
          )
        })}
      </div>

      {tab === 'passwords' && <PasswordsVault folder={folder} />}
      {tab === 'contracts' && <ContractsScope folder={folder} />}
  {tab === 'photoshoot' && <MonthlyMedia key={`${folder.id}-photoshoot`} folder={folder} category="photoshoot" />}
  {tab === 'clientAssets' && <MonthlyMedia key={`${folder.id}-client-assets`} folder={folder} category="clientProvided" />}
  {tab === 'brandAssets' && <MonthlyMedia key={`${folder.id}-brand-assets`} folder={folder} category="brandAssets" />}
          {tab === 'canva' && <CanvaFolder folder={folder} />}
      {tab === 'inbox' && <ClientInbox folder={folder} />}
      {tab === 'campaigns' && <PaidCampaigns folder={folder} />}
      {tab === 'operative' && <OperativeTasks folder={folder} />}
      {tab === 'logs' && <ActivityLogs folder={folder} />}
    </div>
  )
}

function CanvaFolder({ folder }: { folder: ClientFolder }) {
  const { role, addCanvaLink, approveCanvaLink } = useApp()
  const normalizeCanvaUrl = (value: string) => {
    const cleaned = value.trim().replace(/^['"]|['"]$/g, '')
    return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`
  }
  const canManage = role === 'ceo' || role === 'employee'
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ month: new Date().toISOString().slice(0, 7), type: 'story' as 'story' | 'post' | 'reel', note: '', url: '' })
  const links = folder.canvaLinks ?? []
  const grouped = links.reduce<Record<string, typeof links>>((acc, link) => { (acc[link.month] ??= []).push(link); return acc }, {})
  const label = (type: string) => type === 'story' ? 'סטורי' : type === 'post' ? 'פוסט' : 'רילס'
  const monthName = (month: string) => new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`))

  return <div className="rounded-2xl border border-sand-dark bg-card p-5"><div className="mb-5 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-taupe" /><h2 className="text-sm font-semibold text-taupe">CANVA</h2></div><p className="mt-1 text-xs text-taupe-light">קישורי עיצוב לפי חודשים, זמינים ללקוח לצפייה ואישור.</p></div>{canManage && <button type="button" onClick={() => setAdding((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" />הוספת קישור</button>}</div>
    {adding && <div className="mb-5 grid gap-2 rounded-xl border border-sand-dark bg-secondary p-4 md:grid-cols-5"><input type="month" value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })} className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground" /><select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as typeof draft.type })} className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground"><option value="story">סטורי</option><option value="post">פוסט</option><option value="reel">רילס</option></select><input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="שם / הערה" className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground" /><input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://www.canva.com/design/..." type="text" className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground md:col-span-2" /><button type="button" disabled={!draft.url.trim()} onClick={() => { addCanvaLink(folder.id, { ...draft, note: draft.note.trim(), url: draft.url.trim(), approved: false }); setDraft({ ...draft, note: '', url: '' }); setAdding(false) }} className="rounded-lg bg-taupe px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">הוספה</button></div>}
    {Object.keys(grouped).length === 0 ? <div className="rounded-xl border border-dashed border-sand-dark py-10 text-center text-sm text-taupe-light">עדיין לא נוספו קישורי CANVA.</div> : <div className="space-y-5">{Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, monthLinks]) => <section key={month}><h3 className="mb-2 border-b border-sand-dark pb-2 text-sm font-semibold text-taupe">{monthName(month)}</h3><div className="space-y-2">{monthLinks.map((link) => <div key={link.id} className="flex flex-col gap-3 rounded-xl border border-sand-dark bg-secondary p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="rounded-full bg-card px-2 py-1 text-[10px] font-semibold text-taupe">{label(link.type)}</span><span className="text-sm font-semibold text-foreground">{link.note || 'ללא הערה'}</span></div><div className="mt-1 text-[11px] text-taupe-light">{new Date(link.createdAt).toLocaleDateString('he-IL')}</div></div><div className="flex items-center gap-2"><button type="button" onClick={() => window.open(normalizeCanvaUrl(link.url), '_blank', 'noopener,noreferrer')} className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs font-semibold text-taupe hover:bg-sand">פתיחת Canva</button>{role === 'client' && !link.approved && <button type="button" onClick={() => approveCanvaLink(folder.id, link.id)} className="rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white">אישור</button>}{link.approved && <span className="text-xs font-semibold text-emerald-700">אושר</span>}</div></div>)}</div></section>)}</div>}</div>
}

function ClientInbox({ folder }: { folder: ClientFolder }) {
  const { role, employees, replyToInbox, updateInboxMessage } = useApp()
  const [filter, setFilter] = useState<'all' | 'Instagram' | 'Facebook'>('all')
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const messages = (folder.inboxMessages ?? []).filter((message) => filter === 'all' || message.platform === filter)
  const canManage = role === 'ceo' || role === 'employee'
  return <div className="rounded-2xl border border-sand-dark bg-card p-5"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-taupe" /><h2 className="text-sm font-semibold text-taupe">Inbox</h2></div><p className="mt-1 text-xs text-taupe-light">כל התגובות וההודעות הפרטיות של {folder.name} במקום אחד.</p></div><div className="flex gap-1.5">{(['all', 'Instagram', 'Facebook'] as const).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === item ? 'bg-taupe text-white' : 'border border-sand-dark text-taupe'}`}>{item === 'all' ? 'הכול' : item}</button>)}</div></div>{messages.length === 0 ? <div className="rounded-xl border border-dashed border-sand-dark py-10 text-center text-sm text-taupe-light">אין עדיין הודעות. לאחר חיבור לרשתות הן יופיע�� כאן.</div> : <div className="space-y-3">{messages.map((message) => <article key={message.id} className={`rounded-xl border p-4 ${message.handled ? 'border-sand-dark bg-secondary/60' : 'border-taupe/40 bg-card'}`}><div className="flex flex-wrap items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-taupe">{message.platform}</span><span className="rounded-full bg-secondary px-2 py-1 text-[10px] text-taupe-light">{message.channel === 'private' ? 'הודעה פרטית' : 'תגובה'}</span><span className="text-sm font-semibold text-foreground">{message.sender}</span></div><span className={`text-xs font-semibold ${message.handled ? 'text-emerald-700' : 'text-amber-700'}`}>{message.handled ? 'טופל' : 'ממתין לטיפול'}</span></div><p className="mt-3 text-sm leading-6 text-foreground">{message.text}</p>{message.reply && <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-taupe"><b>תשובת הצוות:</b> {message.reply}</div>}{canManage && <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto]"><input value={message.assignedTo ?? ''} onChange={(e) => updateInboxMessage(folder.id, message.id, { assignedTo: e.target.value || undefined })} placeholder="שיוך לעובדת" list={`employees-${folder.id}`} className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs text-foreground" /><datalist id={`employees-${folder.id}`}>{employees.map((employee) => <option key={employee.id} value={employee.name} />)}</datalist><input value={replyDraft[message.id] ?? ''} onChange={(e) => setReplyDraft({ ...replyDraft, [message.id]: e.target.value })} placeholder="כתיבת תשובה..." className="rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs text-foreground" /><button type="button" disabled={!replyDraft[message.id]?.trim()} onClick={() => { replyToInbox(folder.id, message.id, replyDraft[message.id]); setReplyDraft({ ...replyDraft, [message.id]: '' }) }} className="rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">שליחה</button><button type="button" onClick={() => updateInboxMessage(folder.id, message.id, { handled: !message.handled })} className="rounded-lg border border-sand-dark px-3 py-2 text-xs font-semibold text-taupe">{message.handled ? 'סמן כממתין' : 'סמן טופל'}</button></div>}</article>)}</div>}</div>
}

/* ---------------- Client Activity Logs ---------------- */
function ActivityLogs({ folder }: { folder: ClientFolder }) {
  const { t, lang, activityLogs } = useApp()
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all')

  const logs = activityLogs
    .filter((l) => l.clientId === folder.id)
    .filter((l) => filter === 'all' || l.category === filter)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))

  const categories: { key: ActivityCategory | 'all'; label: TranslationKey }[] = [
    { key: 'all', label: 'logs_all' },
    { key: 'content', label: 'logs_cat_content' },
    { key: 'media', label: 'logs_cat_media' },
    { key: 'campaign', label: 'logs_cat_campaign' },
    { key: 'credential', label: 'logs_cat_credential' },
  ]

  const catStyle: Record<ActivityCategory, string> = {
    content: 'bg-emerald-50 text-emerald-700',
    media: 'bg-sky-50 text-sky-700',
    campaign: 'bg-amber-50 text-amber-700',
    credential: 'bg-violet-50 text-violet-700',
    system: 'bg-secondary text-taupe-light',
  }
  const catLabel: Record<ActivityCategory, TranslationKey> = {
    content: 'logs_cat_content',
    media: 'logs_cat_media',
    campaign: 'logs_cat_campaign',
    credential: 'logs_cat_credential',
    system: 'logs_cat_system',
  }

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-taupe" />
        <h3 className="text-sm font-semibold text-taupe">{t('logs_title')}</h3>
      </div>
      <p className="mb-4 text-xs text-taupe-light">{t('logs_subtitle')}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter(c.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === c.key ? 'bg-taupe text-white' : 'border border-sand-dark text-taupe hover:bg-sand'
            }`}
          >
            {t(c.label)}
          </button>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-sand-dark py-10 text-center text-xs text-taupe-soft">
          {t('logs_empty')}
        </div>
      ) : (
        <ol className="relative space-y-0 border-s border-sand-dark ps-4">
          {logs.map((l) => (
            <li key={l.id} className="relative pb-4 last:pb-0">
              <span className="absolute -start-[1.28rem] top-1 h-2.5 w-2.5 rounded-full bg-taupe ring-4 ring-card" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${catStyle[l.category]}`}>
                  {t(catLabel[l.category])}
                </span>
                <span className="text-xs text-taupe-soft">{formatLogTime(l.timestamp, lang)}</span>
              </div>
              <div className="mt-1 text-sm text-taupe">{lang === 'he' ? l.actionHe : l.action}</div>
              <div className="text-xs text-taupe-light">{l.actor}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/* ---------------- Passwords Vault ---------------- */
function PasswordsVault({ folder }: { folder: ClientFolder }) {
  const { t, addCredential, updateCredential, deleteCredential } = useApp()
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ platform: '', username: '', password: '' })

  const copy = (id: string, value: string) => {
    navigator.clipboard?.writeText(value)
    setCopied(id)
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500)
  }

  const inputClass = 'rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-taupe">{t('vault_title')}</h3>
        <button type="button" onClick={() => setAdding((s) => !s)} className="flex items-center gap-1 rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light">
          <Plus className="h-3.5 w-3.5" />
          {t('vault_add')}
        </button>
      </div>

      {adding && (
        <div className="mb-4 grid gap-2 rounded-xl border border-sand-dark bg-secondary p-3 sm:grid-cols-3">
          <input value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} placeholder={t('vault_platform')} className={inputClass} />
          <input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} placeholder={t('vault_username')} className={inputClass} />
          <div className="flex gap-2">
            <input value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder={t('vault_password')} className={`flex-1 ${inputClass}`} />
            <button
              type="button"
              onClick={() => {
                if (!draft.platform.trim()) return
                addCredential(folder.id, draft)
                setDraft({ platform: '', username: '', password: '' })
                setAdding(false)
              }}
              className="rounded-lg bg-taupe px-3 text-xs font-semibold text-white"
            >
              {t('vault_save')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(Array.isArray(folder.credentials) ? folder.credentials : []).map((c) => (
          <div key={c.id} className="rounded-xl border border-sand-dark bg-secondary p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-taupe-light">{c.platform}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))} className="rounded-md p-1 text-taupe hover:bg-sand" title={revealed[c.id] ? t('vault_hide') : t('vault_reveal')}>
                  {revealed[c.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button type="button" onClick={() => deleteCredential(folder.id, c.id)} className="rounded-md p-1 text-taupe-light hover:bg-rose-50 hover:text-rose-600" title={t('vault_delete')}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <VaultRow label={t('vault_username')} value={c.username} onCopy={() => copy(`${c.id}-u`, c.username)} copied={copied === `${c.id}-u`} copyLabel={t('vault_copy')} copiedLabel={t('vault_copied')} />
              <VaultRow label={t('vault_password')} value={revealed[c.id] ? c.password : '••••••••••'} mono onCopy={() => copy(`${c.id}-p`, c.password)} copied={copied === `${c.id}-p`} copyLabel={t('vault_copy')} copiedLabel={t('vault_copied')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VaultRow({ label, value, mono, onCopy, copied, copyLabel, copiedLabel }: { label: string; value: string; mono?: boolean; onCopy: () => void; copied: boolean; copyLabel: string; copiedLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-taupe-soft">{label}</div>
        <div className={`truncate text-sm text-taupe ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
      <button type="button" onClick={onCopy} className="flex shrink-0 items-center gap-1 rounded-md border border-sand-dark px-2 py-1 text-[11px] text-taupe hover:bg-sand">
        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  )
}

/* ---------------- Contracts & Scope ---------------- */
function ContractsScope({ folder }: { folder: ClientFolder }) {
  const { t, lang, role, setContractFile, addContractAppendix, removeContractAppendix, addInvoiceFile, removeInvoiceFile } = useApp()
  const pkg = getPackage(folder.packageId)
  const deliverables = lang === 'he' ? pkg.deliverablesHe : pkg.deliverables
  const isClient = role === 'client'
  const isManager = role === 'ceo' // only the manager can edit contracts & invoices
  const isEmployee = !isManager && !isClient // employees see the package type only
  const [doc, setDoc] = useState<'contract' | 'invoice' | null>(null)
  const pdfRef = useRef<HTMLInputElement>(null)
  const appendixRef = useRef<HTMLInputElement>(null)
  const invoiceRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-taupe">{t('scope_title')}</h3>
        <span className="rounded-full bg-taupe px-2.5 py-0.5 text-xs font-medium text-white">{t(pkg.nameKey)}</span>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-taupe-light">{t('scope_deliverables')}</div>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {deliverables.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-taupe-light">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-taupe" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Contract, appendices & invoices — hidden from employees; manager edits, client views */}
      {!isEmployee && (
      <>
      {/* Signed contract repository */}
      <div className="mt-5 rounded-xl border border-sand-dark bg-secondary p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-taupe-light">{t('scope_signedRepo')}</span>
          {/* Only the manager can upload / replace the signed contract */}
          {isManager && (
            <button type="button" onClick={() => pdfRef.current?.click()} className="flex items-center gap-1 rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light">
              <FileUp className="h-3.5 w-3.5" />
              {folder.contractFileName ? t('scope_replacePdf') : t('scope_uploadPdf')}
            </button>
          )}
          <input
            ref={pdfRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setContractFile(folder.id, f.name)
              if (pdfRef.current) pdfRef.current.value = ''
            }}
          />
        </div>
        {folder.contractFileName ? (
          <div className="flex items-center gap-3 rounded-lg border border-sand-dark bg-card p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-taupe">{folder.contractFileName}</div>
              <div className="text-[11px] text-taupe-soft">{t('scope_signedPdf')}</div>
            </div>
            <button type="button" onClick={() => setDoc('contract')} className="rounded-md border border-sand-dark px-2.5 py-1 text-[11px] font-medium text-taupe hover:bg-sand">
              {t('scope_view')}
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-sand-dark py-6 text-center text-xs text-taupe-soft">{t('scope_noPdf')}</div>
        )}

        {/* Contract appendices — additional relevant files */}
        <div className="mt-4 border-t border-sand-dark pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-taupe-light">{t('scope_appendices')}</span>
            {!isClient && (
              <button
                type="button"
                onClick={() => appendixRef.current?.click()}
                className="flex items-center gap-1 rounded-lg border border-sand-dark px-2.5 py-1 text-[11px] font-medium text-taupe hover:bg-sand"
              >
                <Plus className="h-3 w-3" />
                {t('scope_addAppendix')}
              </button>
            )}
            <input
              ref={appendixRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) addContractAppendix(folder.id, f.name)
                if (appendixRef.current) appendixRef.current.value = ''
              }}
            />
          </div>
          {folder.contractAppendices && folder.contractAppendices.length > 0 ? (
            <ul className="grid gap-1.5">
              {folder.contractAppendices.map((file) => (
                <li key={file} className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-3 py-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-taupe-light" />
                  <span className="min-w-0 flex-1 truncate text-xs text-taupe">{file}</span>
                  {!isClient && (
                    <button
                      type="button"
                      onClick={() => removeContractAppendix(folder.id, file)}
                      className="shrink-0 rounded-md p-1 text-taupe-soft hover:bg-rose-50 hover:text-rose-600"
                      aria-label={t('delete')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-[11px] text-taupe-soft">{t('scope_noAppendices')}</div>
          )}
        </div>
      </div>

      {/* Invoice repository — manager uploads/removes, client views */}
      <div className="mt-4 rounded-xl border border-sand-dark bg-secondary p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-taupe-light">{t('scope_invoiceRepo')}</span>
          {isManager && (
            <button type="button" onClick={() => invoiceRef.current?.click()} className="flex items-center gap-1 rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light">
              <FileUp className="h-3.5 w-3.5" />
              {t('scope_uploadInvoice')}
            </button>
          )}
          <input
            ref={invoiceRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) addInvoiceFile(folder.id, f.name)
              if (invoiceRef.current) invoiceRef.current.value = ''
            }}
          />
        </div>
        {folder.invoiceFiles && folder.invoiceFiles.length > 0 ? (
          <ul className="grid gap-1.5">
            {folder.invoiceFiles.map((file) => (
              <li key={file} className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-3 py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-taupe">{file}</span>
                {isManager && (
                  <button
                    type="button"
                    onClick={() => removeInvoiceFile(folder.id, file)}
                    className="shrink-0 rounded-md p-1 text-taupe-soft hover:bg-rose-50 hover:text-rose-600"
                    aria-label={t('delete')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-sand-dark py-6 text-center text-xs text-taupe-soft">{t('scope_noInvoices')}</div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setDoc('contract')} className="flex items-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light">
          <FileText className="h-4 w-4" />
          {t('scope_renderContract')}
        </button>
        {/* Invoices carry amounts — manager only */}
        {role === 'ceo' && (
          <button type="button" onClick={() => setDoc('invoice')} className="flex items-center gap-2 rounded-lg border border-sand-dark px-4 py-2 text-sm font-medium text-taupe hover:bg-sand">
            <FileText className="h-4 w-4" />
            {t('scope_renderInvoice')}
          </button>
        )}
      </div>
      </>
      )}

      {doc && <DocumentModal folder={folder} kind={doc} onClose={() => setDoc(null)} />}
    </div>
  )
}

function DocumentModal({ folder, kind, onClose }: { folder: ClientFolder; kind: 'contract' | 'invoice'; onClose: () => void }) {
  const { t, lang, role } = useApp()
  const pkg = getPackage(folder.packageId)
  const deliverables = lang === 'he' ? pkg.deliverablesHe : pkg.deliverables
  // Only the manager sees amounts on rendered documents
  const showPrice = role === 'ceo' && kind === 'invoice'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-taupe/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-sand-dark p-4 print:hidden">
          <span className="text-sm font-semibold text-taupe">
            {kind === 'contract' ? t('scope_contract') : t('scope_invoice')}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={() => window.print()} className="flex items-center gap-1 rounded-md bg-taupe px-3 py-1.5 text-xs font-medium text-white">
              <Printer className="h-3.5 w-3.5" />
              {t('scope_print')}
            </button>
            <button type="button" onClick={onClose} className="rounded-md p-1.5 text-taupe-light hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between border-b-2 border-taupe pb-4">
            <div>
              <div className="text-2xl font-semibold text-taupe">M.A.B Marketing</div>
              <div className="font-script text-lg text-taupe-light">{t('slogan')}</div>
            </div>
            <div className="text-end text-xs text-taupe-light">
              <div>{t('footer_phone')}</div>
              <div>{t('footer_email')}</div>
              <div>{t('footer_address')}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-lg font-semibold text-taupe">
              {kind === 'contract' ? t('scope_contract') : t('scope_invoice')} — {folder.name}
            </div>
            <div className="text-sm text-taupe-light">{t(pkg.nameKey)}</div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {deliverables.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-taupe" />
                {d}
              </li>
            ))}
          </ul>

          {showPrice && (
            <div className="mt-6 flex items-center justify-between border-t border-sand-dark pt-4">
              <span className="text-sm font-medium text-taupe">
                {kind === 'invoice' ? t('scope_invoiceStatus') : ''}
                {kind === 'invoice' ? `: ${t(`finance_${folder.invoiceStatus}`)}` : ''}
              </span>
              <span className="text-xl font-semibold text-taupe">${pkg.price.toLocaleString()}{t('pkg_perMonth')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Monthly Media (Photoshoot + Client Assets) ---------------- */
function MonthlyMedia({ folder, category }: { folder: ClientFolder; category: MediaCategory }) {
  const { t, lang, role, mediaAssets, addMediaAsset, updateMediaAsset, deleteMediaAsset } = useApp()
  const isPhotoshoot = category === 'photoshoot'
  const isBrandAssets = category === 'brandAssets'

  // Brand Assets uses fixed named folders (logo / design / before) instead of monthly folders.
  const BRAND_FOLDERS = ['logo', 'design', 'before']
  const months = monthsSince(folder.sinceMonth)
  const folders = isBrandAssets ? BRAND_FOLDERS : months.length > 0 ? months : [new Date().toISOString().slice(0, 7)]
  const folderLabel = (k: string) =>
    isBrandAssets
      ? k === 'logo'
        ? t('brand_folder_logo')
        : k === 'design'
          ? t('brand_folder_design')
          : t('brand_folder_before')
      : monthLabel(k, lang)

  const [openMonth, setOpenMonth] = useState<string>(folders[0])
  useEffect(() => {
    const firstFolder = folders[0] ?? new Date().toISOString().slice(0, 7)
    setOpenMonth(firstFolder)
  }, [folder.id, category, folders[0]])
  const [preview, setPreview] = useState<{ name: string; kind: 'image' | 'video'; url?: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Photoshoot = CEO uploads only. Brand Assets = CEO + employee (client view-only).
  // Client-provided = client, CEO, employee can upload.
  const canUpload =
    category === 'photoshoot' ? role === 'ceo' : category === 'brandAssets' ? role !== 'client' : true

  // Keep image previews small enough for the client record and fast enough to load.
  const handleFiles = (files: FileList | null) => {
    Array.from(files ?? []).forEach((file) => {
      const kind = file.type.startsWith('video') ? 'video' : 'image'
      if (kind === 'video') {
        const reader = new FileReader()
        reader.onload = () => addMediaAsset(folder.id, category, openMonth, file.name, kind, reader.result as string)
        reader.readAsDataURL(file)
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const image = new Image()
        image.onload = () => {
          const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
          canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
          addMediaAsset(folder.id, category, openMonth, file.name, kind, canvas.toDataURL('image/jpeg', 0.65))
        }
        image.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Download available to all roles.
  const download = (m: { name: string; url?: string }) => {
    if (!m.url) return
    const a = document.createElement('a')
    a.href = m.url
    a.download = m.name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const items = mediaAssets.filter(
    (m) => m.clientId === folder.id && m.category === category && m.monthKey === openMonth,
  )
  const countFor = (mk: string) =>
    mediaAssets.filter((m) => m.clientId === folder.id && m.category === category && m.monthKey === mk).length
  const mediaSource = (media: (typeof items)[number]) => media.url?.startsWith('data:') ? `/api/media/${encodeURIComponent(media.id)}` : media.url
  const repairImage = (media: (typeof items)[number], element: HTMLImageElement) => {
    if (!media.url || media.url.length < 2_000_000 || media.url.startsWith('data:image/jpeg')) return
    const scale = Math.min(1, 1200 / Math.max(element.naturalWidth, element.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(element.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(element.naturalHeight * scale))
    canvas.getContext('2d')?.drawImage(element, 0, 0, canvas.width, canvas.height)
    updateMediaAsset(media.id, canvas.toDataURL('image/jpeg', 0.65))
  }

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPhotoshoot ? <Camera className="h-4 w-4 text-taupe" /> : isBrandAssets ? <Palette className="h-4 w-4 text-taupe" /> : <Images className="h-4 w-4 text-taupe" />}
          <h3 className="text-sm font-semibold text-taupe">
            {isPhotoshoot ? t('photoshoot_title') : isBrandAssets ? t('brand_title') : t('assets_title')}
          </h3>
          {isBrandAssets && role === 'client' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-taupe-light">
              <Eye className="h-3 w-3" />
              {t('brand_viewOnly')}
            </span>
          )}
        </div>
        {canUpload && (
          <>
            <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1 rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light">
              <Upload className="h-3.5 w-3.5" />
              {t('media_upload')} · {folderLabel(openMonth)}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                if (inputRef.current) inputRef.current.value = ''
              }}
            />
          </>
        )}
      </div>
      <p className="mb-4 text-xs text-taupe-light">
        {isPhotoshoot ? t('photoshoot_subtitle') : isBrandAssets ? t('brand_subtitle') : t('assets_subtitle')}
      </p>

      {/* Folder rail — monthly for media, fixed named folders for brand assets */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {folders.map((mk) => {
          const active = mk === openMonth
          const n = countFor(mk)
          return (
            <button
              key={mk}
              type="button"
              onClick={() => setOpenMonth(mk)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                active ? 'border-transparent bg-taupe text-white' : 'border-sand-dark text-taupe hover:bg-sand'
              }`}
            >
              {active ? <FolderOpen className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
              {folderLabel(mk)}
              <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/20' : 'bg-secondary text-taupe-light'}`}>{n}</span>
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-sand-dark py-10 text-center text-xs text-taupe-soft">{t('media_empty')}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-xl border border-sand-dark bg-secondary p-3">
              <button
                type="button"
                onClick={() => m.url && setPreview({ name: m.name, kind: m.kind, url: m.url })}
                className={`flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-cream text-taupe ${m.url ? 'cursor-zoom-in' : 'cursor-default'}`}
                title={m.url ? t('media_preview') : undefined}
              >
                {m.url && m.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaSource(m) || '/placeholder.svg'} alt={m.name} loading="lazy" decoding="async" onLoad={(event) => repairImage(m, event.currentTarget)} onError={(event) => { event.currentTarget.style.display = 'none' }} className="h-full w-full object-cover" />
                ) : m.url && m.kind === 'video' ? (
                  <video src={m.url} className="h-full w-full object-cover" muted />
                ) : m.kind === 'video' ? (
                  <Film className="h-6 w-6" />
                ) : (
                  <ImageIcon className="h-6 w-6" />
                )}
              </button>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-taupe">{m.name}</div>
                  <div className="text-[10px] uppercase text-taupe-soft">{m.kind} · {m.uploadedBy}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {/* Download available to everyone */}
                  <button
                    type="button"
                    onClick={() => download(m)}
                    disabled={!m.url}
                    className="rounded-md p-1 text-taupe-light hover:bg-sand hover:text-taupe disabled:cursor-not-allowed disabled:opacity-40"
                    title={t('media_download')}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline preview — images and videos play/enlarge; downloadable by anyone */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-taupe/50 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-sand-dark p-3">
              <span className="truncate text-sm font-semibold text-taupe">{preview.name}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => download(preview)} className="flex items-center gap-1 rounded-md bg-taupe px-3 py-1.5 text-xs font-medium text-white hover:bg-taupe-light">
                  <Download className="h-3.5 w-3.5" />
                  {t('media_download')}
                </button>
                <button type="button" onClick={() => setPreview(null)} className="rounded-md p-1.5 text-taupe-light hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center bg-cream p-4">
              {preview.kind === 'video' ? (
                <video src={preview.url} controls className="max-h-[70vh] w-full rounded-lg" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url || '/placeholder.svg'} alt={preview.name} className="max-h-[70vh] w-full rounded-lg object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Paid Campaigns ---------------- */
const OBJECTIVE_LABEL: Record<CampaignObjective, TranslationKey> = {
  leadGen: 'paid_obj_leadGen',
  traffic: 'paid_obj_traffic',
  engagement: 'paid_obj_engagement',
  messages: 'paid_obj_messages',
  calls: 'paid_obj_calls',
}

const CAMPAIGN_STATUS_LABEL: Record<PaidCampaign['status'], TranslationKey> = {
  draft: 'paid_status_draft',
  ceo: 'paid_status_ceo',
  client: 'paid_status_client',
  active: 'paid_status_active',
}
const CAMPAIGN_STATUS_STYLE: Record<PaidCampaign['status'], string> = {
  draft: 'bg-secondary text-taupe',
  ceo: 'bg-amber-100 text-amber-700',
  client: 'bg-sky-100 text-sky-700',
  active: 'bg-emerald-100 text-emerald-700',
}

function CampaignCard({ c, onContinue }: { c: PaidCampaign; onContinue: (c: PaidCampaign) => void }) {
  const { t, role, advancePaidCampaign, sendBackPaidCampaign } = useApp()
  const [note, setNote] = useState('')
  const [showReview, setShowReview] = useState(false)

  const commission = c.budget * CAMPAIGN_COMMISSION_RATE
  const total = c.budget + commission
  // Manager reviews campaigns in CEO stage; the review UI is CEO-only.
  const isManagerReview = role === 'ceo' && c.status === 'ceo'

  return (
    <div className="rounded-xl border border-sand-dark bg-secondary p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-taupe">{c.title}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${CAMPAIGN_STATUS_STYLE[c.status]}`}>{t(CAMPAIGN_STATUS_LABEL[c.status])}</span>
      </div>
      <div className="mt-1 inline-flex rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-taupe">
        {t(OBJECTIVE_LABEL[c.objective])}
      </div>
      <div className="mt-2 grid gap-1 text-xs text-taupe-light sm:grid-cols-2">
        <span>{t('paid_audience')}: {c.audience || '—'}</span>
        <span>{t('paid_ages')}: {c.ageRange}</span>
        <span className="sm:col-span-2">{t('paid_locations')}: {c.locations || '—'}</span>
        <span>{c.budgetType === 'daily' ? t('paid_daily') : t('paid_lifetime')}</span>
        <span>{c.startDate || '—'} → {c.endDate || '—'}</span>
      </div>

      {/* Transparent cost breakdown — media spend + 20% agency commission */}
      {c.budget > 0 && (
        <div className="mt-2 grid gap-1 rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs">
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
      )}

      {(c.headline || c.creativeName) && (
        <div className="mt-2 rounded-lg border border-sand-dark bg-card p-2 text-xs">
          {c.creativeName && <div className="flex items-center gap-1 text-taupe-soft"><Film className="h-3 w-3" />{c.creativeName}</div>}
          {c.headline && <div className="mt-1 font-medium text-taupe">{c.headline}</div>}
          {c.primaryText && <div className="text-taupe-light">{c.primaryText}</div>}
        </div>
      )}

      {/* Review note (shown to the employee after a send-back) */}
      {c.comment && c.status === 'draft' && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-700">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span><span className="font-semibold">{t('paid_reviewNote')}: </span>{c.comment}</span>
        </div>
      )}

      {/* Draft — employee/manager can continue filling it in */}
      {role !== 'client' && c.status === 'draft' && (
        <button type="button" onClick={() => onContinue(c)} className="mt-3 flex items-center gap-1 rounded-md bg-taupe px-3 py-1.5 text-xs font-medium text-white hover:bg-taupe-light">
          <Pencil className="h-3.5 w-3.5" />
          {t('paid_continueDraft')}
        </button>
      )}

      {/* Manager review ��� approve to client or send back with a note */}
      {isManagerReview && (
        <div className="mt-3 space-y-2">
          {!showReview ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => advancePaidCampaign(c.id, 'client')} className="flex items-center gap-1 rounded-md bg-taupe px-3 py-1.5 text-xs font-medium text-white hover:bg-taupe-light">
                <Send className="h-3.5 w-3.5 flip-x" />
                {t('paid_approveCeo')}
              </button>
              <button type="button" onClick={() => setShowReview(true)} className="flex items-center gap-1 rounded-md border border-sand-dark px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand">
                <MessageSquare className="h-3.5 w-3.5" />
                {t('paid_requestChanges')}
              </button>
            </div>
          ) : (
            <div className="space-y-2 rounded-lg border border-sand-dark bg-card p-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('paid_reviewComment')}
                rows={2}
                className="w-full resize-none rounded-md border border-sand-dark bg-secondary px-2 py-1 text-xs text-foreground outline-none focus:border-taupe"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => { sendBackPaidCampaign(c.id, note); setNote(''); setShowReview(false) }} className="flex items-center gap-1 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t('paid_sendBack')}
                </button>
                <button type="button" onClick={() => setShowReview(false)} className="rounded-md border border-sand-dark px-3 py-1.5 text-xs font-medium text-taupe hover:bg-sand">
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PaidCampaigns({ folder }: { folder: ClientFolder }) {
  const { t, role, paidCampaigns, addPaidCampaign, updatePaidCampaign, submitPaidCampaign } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const blank = {
    title: '',
    objective: 'leadGen' as CampaignObjective,
    audience: '',
    ageRange: '',
    locations: '',
    budgetType: 'daily' as BudgetType,
    budget: '',
    startDate: '',
    endDate: '',
    creativeName: '',
    primaryText: '',
    headline: '',
  }
  const [form, setForm] = useState(blank)
  const creativeRef = useRef<HTMLInputElement>(null)
  // Clients never see drafts (in-progress campaigns not yet submitted for review)
  const items = paidCampaigns
    .filter((c) => c.clientId === folder.id)
    .filter((c) => role !== 'client' || c.status !== 'draft')
  const inputClass = 'rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'

  // A campaign can only be created (sent for review) once every field is filled in.
  const isComplete = Boolean(
    form.title.trim() &&
      form.audience.trim() &&
      form.ageRange.trim() &&
      form.locations.trim() &&
      Number(form.budget) > 0 &&
      form.startDate &&
      form.endDate &&
      form.creativeName.trim() &&
      form.headline.trim() &&
      form.primaryText.trim(),
  )

  // Media spend + transparent 20% agency commission
  const spend = Number(form.budget) || 0
  const commission = spend * CAMPAIGN_COMMISSION_RATE
  const total = spend + commission

  const formPayload = () => ({
    clientId: folder.id,
    title: form.title,
    objective: form.objective,
    audience: form.audience,
    ageRange: form.ageRange || '25-55',
    locations: form.locations,
    budgetType: form.budgetType,
    budget: Number(form.budget) || 0,
    startDate: form.startDate,
    endDate: form.endDate,
    creativeName: form.creativeName,
    primaryText: form.primaryText,
    headline: form.headline,
  })

  const resetForm = () => {
    setForm(blank)
    setEditingId(null)
    setShowForm(false)
  }

  // Save progress without submitting — a campaign can be filled in installments.
  const saveDraft = () => {
    if (!form.title.trim()) return
    if (editingId) updatePaidCampaign(editingId, formPayload())
    else addPaidCampaign(formPayload(), 'draft')
    resetForm()
  }

  // Create = send to manager review. Only allowed once every field is complete.
  const createCampaign = () => {
    if (!isComplete) return
    if (editingId) {
      updatePaidCampaign(editingId, formPayload())
      submitPaidCampaign(editingId)
    } else {
      addPaidCampaign(formPayload(), 'ceo')
    }
    resetForm()
  }

  // Load a draft back into the form to continue editing
  const continueDraft = (c: PaidCampaign) => {
    setForm({
      title: c.title,
      objective: c.objective,
      audience: c.audience,
      ageRange: c.ageRange,
      locations: c.locations,
      budgetType: c.budgetType,
      budget: String(c.budget || ''),
      startDate: c.startDate,
      endDate: c.endDate,
      creativeName: c.creativeName,
      primaryText: c.primaryText,
      headline: c.headline,
    })
    setEditingId(c.id)
    setShowForm(true)
  }

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-taupe" />
          <h3 className="text-sm font-semibold text-taupe">{t('paid_title')}</h3>
        </div>
        {role !== 'client' && (
          <button type="button" onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1 rounded-lg bg-taupe px-3 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light">
            <Plus className="h-3.5 w-3.5" />
            {t('paid_new')}
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-taupe-light">{t('paid_subtitle')}</p>

      {showForm && role !== 'client' && (
        <div className="mb-4 space-y-3 rounded-xl border border-sand-dark bg-secondary p-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('paid_campaignTitle')} className={`w-full ${inputClass}`} />

          {/* Objective */}
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-taupe-light">{t('paid_objective')}</div>
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPAIGN_OBJECTIVES.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setForm({ ...form, objective: o })}
                  className={`rounded-lg border px-3 py-2 text-start text-xs font-medium transition ${
                    form.objective === o ? 'border-transparent bg-taupe text-white' : 'border-sand-dark bg-card text-taupe hover:bg-sand'
                  }`}
                >
                  {t(OBJECTIVE_LABEL[o])}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder={t('paid_audience')} className={inputClass} />
            <input value={form.ageRange} onChange={(e) => setForm({ ...form, ageRange: e.target.value })} placeholder={t('paid_ages')} className={inputClass} />
          </div>
          <input value={form.locations} onChange={(e) => setForm({ ...form, locations: e.target.value })} placeholder={t('paid_locations')} className={`w-full ${inputClass}`} />

          {/* Budget */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex rounded-lg border border-sand-dark bg-card p-1">
              {(['daily', 'lifetime'] as BudgetType[]).map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setForm({ ...form, budgetType: bt })}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                    form.budgetType === bt ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
                  }`}
                >
                  {bt === 'daily' ? t('paid_daily') : t('paid_lifetime')}
                </button>
              ))}
            </div>
            <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder={t('paid_budget')} type="number" className={inputClass} />
          </div>

          {/* Transparent cost breakdown — media spend + 20% agency commission */}
          {spend > 0 && (
            <div className="grid gap-1 rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs">
              <div className="flex items-center justify-between text-taupe-light">
                <span>{t('paid_mediaSpend')}</span>
                <span>${spend.toLocaleString()}</span>
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
          )}

          {/* Schedule */}
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-[11px] text-taupe-light">
              {t('paid_startDate')}
              <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="date" className={`mt-1 w-full ${inputClass}`} />
            </label>
            <label className="text-[11px] text-taupe-light">
              {t('paid_endDate')}
              <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="date" className={`mt-1 w-full ${inputClass}`} />
            </label>
          </div>

          {/* Creative */}
          <div className="rounded-lg border border-dashed border-sand-dark bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-taupe-light">{t('paid_creative')}</span>
              <button type="button" onClick={() => creativeRef.current?.click()} className="flex items-center gap-1 rounded-md border border-sand-dark px-2.5 py-1 text-[11px] font-medium text-taupe hover:bg-sand">
                <Upload className="h-3 w-3" />
                {form.creativeName || t('paid_uploadCreative')}
              </button>
              <input
                ref={creativeRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setForm((prev) => ({ ...prev, creativeName: f.name }))
                }}
              />
            </div>
            <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder={t('paid_headline')} className={`mb-2 w-full ${inputClass}`} />
            <textarea value={form.primaryText} onChange={(e) => setForm({ ...form, primaryText: e.target.value })} placeholder={t('paid_primaryText')} rows={2} className={`w-full resize-none ${inputClass}`} />
          </div>

          {!isComplete && <p className="text-[11px] text-taupe-light">{t('paid_incompleteHint')}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={saveDraft} className="flex-1 rounded-lg border border-sand-dark bg-card px-4 py-2 text-sm font-semibold text-taupe hover:bg-sand">
              {t('paid_saveDraft')}
            </button>
            <button
              type="button"
              onClick={createCampaign}
              disabled={!isComplete}
              className="flex-1 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('paid_create')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-sand-dark py-10 text-center text-xs text-taupe-soft">{t('paid_empty')}</div>
        ) : (
          items.map((c) => <CampaignCard key={c.id} c={c} onContinue={continueDraft} />)
        )}
      </div>
    </div>
  )
}

/* ---------------- Operative Tasks ---------------- */
function OperativeTasks({ folder }: { folder: ClientFolder }) {
  const { t, role, operativeTasks, addOperativeTask, toggleOperativeTask } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const items = operativeTasks.filter((o) => o.clientId === folder.id)
  const canAssign = role !== 'client'

  const send = () => {
    if (!title.trim()) return
    addOperativeTask(folder.id, title, description)
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-taupe">{t('op_title')}</h3>
          <p className="text-xs text-taupe-light">{t('op_subtitle')}</p>
        </div>
        {/* Employee & manager can assign tasks to the client */}
        {canAssign && (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-white hover:bg-taupe-light"
          >
            <Plus className="h-4 w-4" />
            {t('op_add')}
          </button>
        )}
      </div>

      {canAssign && showForm && (
        <div className="mb-4 mt-3 space-y-2 rounded-xl border border-sand-dark bg-secondary p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('op_titlePlaceholder')}
            className="w-full rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('op_descPlaceholder')}
            rows={3}
            className="w-full resize-none rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe"
          />
          <button
            type="button"
            onClick={send}
            disabled={!title.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-white hover:bg-taupe-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4 flip-x" />
            {t('op_send')}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-sand-dark py-10 text-center text-xs text-taupe-soft">{t('op_empty')}</div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((o) => (
            <div key={o.id} className="flex items-start gap-3 rounded-lg border border-sand-dark bg-secondary p-3">
              {/* Client marks the task done once completed */}
              <button
                type="button"
                onClick={() => toggleOperativeTask(o.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  o.done ? 'border-taupe bg-taupe text-white' : 'border-sand-dark text-transparent'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${o.done ? 'text-taupe-light line-through' : 'text-foreground'}`}>{o.title}</span>
                  {o.done && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      {t('op_completed')}
                    </span>
                  )}
                </div>
                {o.description && (
                  <p className={`mt-1 text-xs ${o.done ? 'text-taupe-soft' : 'text-taupe-light'}`}>{o.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
