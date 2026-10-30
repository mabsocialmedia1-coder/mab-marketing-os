'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Paperclip,
  Ban,
  Download,
  Send,
  CalendarDays,
} from 'lucide-react'
import type { FinanceEntry, FinanceType } from '@/lib/data'

export function Finances() {
  const { t, lang, finances, role, clientFolders, tasks, addTask } = useApp()
  const [invoiceClient, setInvoiceClient] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState('')
  const [invoiceEmail, setInvoiceEmail] = useState('')
  const [invoiceStatus, setInvoiceStatus] = useState<'draft' | 'scheduled' | 'sent'>('draft')
  const [invoiceMessage, setInvoiceMessage] = useState('')
  // Privacy gate — numbers stay hidden until explicitly revealed
  const [revealed, setRevealed] = useState(false)

  const revenue = finances.filter((f) => f.type === 'revenue')
  const expenses = finances.filter((f) => f.type === 'expense')
  const totalRevenue = revenue.reduce((s, f) => s + f.amount, 0)
  const totalExpenses = expenses.reduce((s, f) => s + f.amount, 0)
  const net = totalRevenue - totalExpenses

  const money = (n: number) => `$${n.toLocaleString()}`
  const mask = (n: number) => (revealed ? money(n) : '• • • •')
  const selectedInvoiceClient = clientFolders.find((client) => client.id === invoiceClient)
  const invoiceDate = invoiceDueDate ? new Date(`${invoiceDueDate}T12:00:00`) : null
  const sendDate = invoiceDate ? new Date(invoiceDate.getTime() - 10 * 86400000) : null
  const reminderDate = invoiceDate ? new Date(invoiceDate.getTime() - 2 * 86400000) : null
  const formatDate = (date: Date | null) => date ? date.toISOString().slice(0, 10) : ''
  const invoiceDocument = () => `INVOICE\n\nClient: ${selectedInvoiceClient?.name ?? ''}\nAmount: $${invoiceAmount}\nDue date: ${invoiceDueDate}\n\nThank you for your business.`
  const downloadInvoice = () => { const blob = new Blob([invoiceDocument()], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `invoice-${selectedInvoiceClient?.name ?? 'client'}-${invoiceDueDate}.txt`; link.click(); URL.revokeObjectURL(url) }
  const scheduleInvoice = () => { if (!selectedInvoiceClient || !invoiceAmount || !invoiceDueDate || !invoiceEmail) return; setInvoiceStatus('scheduled'); setInvoiceMessage(lang === 'he' ? `החשבונית מתוזמנת לשליחה ב־${formatDate(sendDate)}. תזכורת למנהל נקבעה ל־${formatDate(reminderDate)}.` : `Invoice scheduled for ${formatDate(sendDate)}. Manager reminder set for ${formatDate(reminderDate)}.`); if (reminderDate && !tasks.some((task) => task.title === `Invoice reminder: ${selectedInvoiceClient.name} · ${invoiceDueDate}`)) addTask({ title: `Invoice reminder: ${selectedInvoiceClient.name} · ${invoiceDueDate}`, description: `Send invoice to ${invoiceEmail} two days before payment date (${formatDate(reminderDate)}).`, assignee: 'Evelyn', urgency: 'urgentWeek', client: selectedInvoiceClient.name }) }
  const sendInvoice = async () => { if (!selectedInvoiceClient || !invoiceEmail || !invoiceAmount || !invoiceDueDate) return; const response = await fetch('/api/google/gmail/send-invoice', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to: invoiceEmail, clientName: selectedInvoiceClient.name, amount: invoiceAmount, dueDate: invoiceDueDate }) }); setInvoiceStatus(response.ok ? 'sent' : 'scheduled'); setInvoiceMessage(response.ok ? (lang === 'he' ? 'החשבונית נשלחה דרך Google Gmail.' : 'Invoice sent through Google Gmail.') : (lang === 'he' ? 'יש לחבר הרשאת Gmail לשליחה.' : 'Connect Gmail permission to send.')) }

  const summary = [
    { label: t('fin_totalRevenue'), value: totalRevenue, icon: TrendingUp, tone: 'text-emerald-600', accent: false },
    { label: t('fin_totalExpenses'), value: totalExpenses, icon: TrendingDown, tone: 'text-rose-600', accent: false },
    { label: t('fin_netProfit'), value: net, icon: Wallet, tone: 'text-white', accent: true },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-taupe">{t('fin_title')}</h1>
          <p className="mt-1 text-sm text-taupe-light">{t('fin_subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setRevealed((s) => !s)}
          className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm font-medium text-taupe hover:bg-sand"
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {revealed ? t('fin_hide') : t('fin_reveal')}
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {summary.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className={`rounded-2xl border p-5 ${
                s.accent ? 'border-transparent bg-taupe text-white' : 'border-sand-dark bg-card'
              }`}
            >
              <Icon className={`h-6 w-6 ${s.accent ? 'text-white/90' : s.tone}`} />
              <div className={`mt-3 text-2xl font-semibold ${s.accent ? 'text-white' : 'text-taupe'}`}>
                {mask(s.value)}
              </div>
              <div className={`text-sm ${s.accent ? 'text-white/80' : 'text-taupe-light'}`}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {role === 'ceo' && <section className="mt-6 rounded-2xl border border-sand-dark bg-card p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-taupe">{lang === 'he' ? 'חשבוניות ותזמון חיוב' : 'Invoices & billing schedule'}</h2><p className="mt-1 text-xs text-taupe-light">{lang === 'he' ? 'נשלח ללקוח 10 ימים לפני התשלום. תזכורת למנהל יומיים לפני.' : 'Send to the client 10 days before payment. Remind the manager two days before.'}</p></div><CalendarDays className="h-5 w-5 text-taupe-light" /></div><div className="mt-4 grid gap-3 md:grid-cols-2"><select value={invoiceClient} onChange={(event) => { setInvoiceClient(event.target.value); const client = clientFolders.find((item) => item.id === event.target.value); setInvoiceEmail(client?.contactEmail ?? '') }} className="rounded-lg border border-sand-dark bg-background px-3 py-2 text-sm text-taupe"><option value="">{lang === 'he' ? 'בחר לקוח פעיל' : 'Select active client'}</option>{clientFolders.filter((client) => client.active).map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select><input type="email" value={invoiceEmail} onChange={(event) => setInvoiceEmail(event.target.value)} placeholder={lang === 'he' ? 'מייל לקבלת החשבונית' : 'Invoice recipient email'} className="rounded-lg border border-sand-dark bg-background px-3 py-2 text-sm text-taupe" /><input type="number" min="0" value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} placeholder={lang === 'he' ? 'סכום החשבונית' : 'Invoice amount'} className="rounded-lg border border-sand-dark bg-background px-3 py-2 text-sm text-taupe" /><input type="date" value={invoiceDueDate} onChange={(event) => setInvoiceDueDate(event.target.value)} className="rounded-lg border border-sand-dark bg-background px-3 py-2 text-sm text-taupe" /></div>{invoiceDueDate && <div className="mt-3 grid gap-2 text-xs text-taupe-light sm:grid-cols-2"><div>{lang === 'he' ? 'שליחה אוטומטית' : 'Automatic send'}: <strong className="text-taupe">{formatDate(sendDate)}</strong></div><div>{lang === 'he' ? 'תזכור�� למנהל' : 'Manager reminder'}: <strong className="text-taupe">{formatDate(reminderDate)}</strong></div></div>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={downloadInvoice} disabled={!selectedInvoiceClient || !invoiceAmount || !invoiceDueDate} className="inline-flex items-center gap-2 rounded-lg border border-sand-dark px-3 py-2 text-xs font-semibold text-taupe disabled:opacity-40"><Download className="h-4 w-4" />{lang === 'he' ? 'צור מסמך' : 'Create document'}</button><button type="button" onClick={scheduleInvoice} className="rounded-lg bg-taupe px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40">{lang === 'he' ? 'תזמן חשבונית' : 'Schedule invoice'}</button><button type="button" onClick={sendInvoice} className="inline-flex items-center gap-2 rounded-lg border border-sand-dark px-3 py-2 text-xs font-semibold text-taupe"><Send className="h-4 w-4" />{lang === 'he' ? 'שלח עכשיו דרך Google' : 'Send now via Google'}</button></div>{invoiceMessage && <p className="mt-3 text-xs font-medium text-taupe-light">{invoiceMessage}</p>}<p className="mt-3 text-[11px] text-taupe-light">{lang === 'he' ? 'החשבונית נשלחת למייל בלבד ואינה מוצגת בתיק הלקוח, אצל הלקוח או אצל העובד.' : 'Invoices are emailed only and are not shown in the client folder, client portal, or employee view.'}</p></section>}

      {/* Ledgers */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Ledger
          title={t('fin_revenue')}
          type="revenue"
          entries={revenue}
          revealed={revealed}
          lang={lang}
          positive
        />
        <Ledger
          title={t('fin_expenses')}
          type="expense"
          entries={expenses}
          revealed={revealed}
          lang={lang}
          positive={false}
        />
      </div>
    </div>
  )
}

function Ledger({
  title,
  type,
  entries,
  revealed,
  lang,
  positive,
}: {
  title: string
  type: FinanceType
  entries: FinanceEntry[]
  revealed: boolean
  lang: 'en' | 'he'
  positive: boolean
}) {
  const { t, addFinanceEntry } = useApp()
  const money = (n: number) => `$${n.toLocaleString()}`
  const Arrow = positive ? ArrowUpRight : ArrowDownRight

  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [file, setFile] = useState<{ name: string; url: string } | null>(null)

  const reset = () => {
    setLabel('')
    setAmount('')
    setCategory('')
    setDate('')
    setFile(null)
    setShowForm(false)
  }

  const save = () => {
    const value = Number(amount)
    if (!label.trim() || !Number.isFinite(value) || value <= 0) return
    addFinanceEntry({
      type,
      label: label.trim(),
      labelHe: label.trim(),
      amount: value,
      category: category.trim() || (positive ? 'Income' : 'Expense'),
      categoryHe: category.trim() || (positive ? 'הכנסה' : 'הוצאה'),
      date: date || new Date().toISOString().slice(0, 10),
      attachmentName: file?.name,
      attachmentUrl: file?.url,
    })
    reset()
  }

  const inputClass =
    'w-full rounded-lg border border-sand-dark bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-taupe'

  return (
    <div className="rounded-2xl border border-sand-dark bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-taupe-light">{title}</h2>
        {/* Manager can manually add an income / expense entry */}
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 rounded-lg bg-taupe px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-taupe-light"
        >
          <Plus className="h-3.5 w-3.5" />
          {positive ? t('fin_addRevenue') : t('fin_addExpense')}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-2 rounded-xl border border-sand-dark bg-secondary p-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('fin_labelPlaceholder')}
            className={inputClass}
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('fin_amountPlaceholder')}
              className={inputClass}
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t('fin_categoryPlaceholder')}
              className={inputClass}
            />
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />

          {/* Optional invoice / receipt attachment */}
          {file ? (
            <div className="flex items-center gap-2 rounded-lg border border-sand-dark bg-card px-3 py-2 text-xs text-taupe">
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="shrink-0 text-taupe-light hover:text-rose-600"
                aria-label={t('cancel')}
              >
                <Ban className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-sand-dark px-3 py-2 text-xs font-medium text-taupe hover:bg-sand">
              <Paperclip className="h-3.5 w-3.5" />
              {t('fin_attach')}
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const reader = new FileReader()
                  reader.onload = () => setFile({ name: f.name, url: String(reader.result) })
                  reader.readAsDataURL(f)
                }}
              />
            </label>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={!label.trim() || !amount}
              className="flex-1 rounded-lg bg-taupe py-2 text-sm font-semibold text-white hover:bg-taupe-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('fin_save')}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-sand-dark px-3 py-2 text-sm font-medium text-taupe hover:bg-sand"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-xl border border-sand-dark bg-secondary p-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <Arrow className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-taupe">{lang === 'he' ? e.labelHe : e.label}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-taupe-soft">
                <span className="truncate">
                  {lang === 'he' ? e.categoryHe : e.category} · {e.date}
                </span>
                {e.attachmentUrl && (
                  <a
                    href={e.attachmentUrl}
                    download={e.attachmentName}
                    className="inline-flex shrink-0 items-center gap-0.5 font-medium text-taupe hover:underline"
                    title={e.attachmentName}
                  >
                    <Paperclip className="h-3 w-3" />
                    {t('fin_invoice')}
                  </a>
                )}
              </div>
            </div>
            <div className={`shrink-0 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {revealed ? `${positive ? '+' : '−'}${money(e.amount)}` : '• • •'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
