'use client'

import { useState } from 'react'
import { ChevronDown, FileText, Receipt, Send } from 'lucide-react'
import { useApp } from '@/components/app-provider'

export function Invoices() {
  const { clientFolders, addInvoiceFile } = useApp()
  const [open, setOpen] = useState<string | null>(null)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [clientId, setClientId] = useState(clientFolders[0]?.id ?? '')
  const [invoiceNumber, setInvoiceNumber] = useState('000017')
  const [sendDate, setSendDate] = useState('2026-10-26')
  const [periodFrom, setPeriodFrom] = useState('2026-10-27')
  const [periodTo, setPeriodTo] = useState('2026-11-27')
  const [amount, setAmount] = useState('1700')
  const [packageName, setPackageName] = useState('Social Media Management – Basic Package')
  const clients = clientFolders.filter((client) => client.active || client.invoiceFiles?.length)
  const selectedClient = clients.find((client) => client.id === clientId) ?? clients[0]
  const sendInvoice = async () => {
    if (!selectedClient?.contactEmail || !amount || !invoiceNumber) return setSendState('error')
    setSendState('sending')
    try {
      const response = await fetch('/api/google/gmail/send-invoice', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to: selectedClient.contactEmail, clientName: selectedClient.name, amount, invoiceNumber, sendDate, periodFrom, periodTo, packageName }) })
      if (!response.ok) throw new Error('send failed')
      addInvoiceFile(selectedClient.id, `Invoice_${invoiceNumber}_${sendDate}.pdf`)
      setSendState('sent')
    } catch { setSendState('error') }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="text-sm font-medium text-taupe-light">כספים</p>
        <h1 className="mt-1 text-2xl font-semibold text-taupe">חשבוניות לפי לקוח וחודש</h1>
        <p className="mt-2 text-sm leading-6 text-taupe-light">כל מסמכי החיוב של הלקוחות במקום אחד, מסודרים לפי תיק לקוח.</p>
      </header>
      <section className="mt-6 rounded-2xl border border-sand-dark bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-taupe">יצירת חשבונית</h2><p className="mt-1 text-sm text-taupe-light">הפרטים שיופיעו ב־PDF ובמייל ללקוח.</p></div><button type="button" onClick={sendInvoice} disabled={sendState === 'sending'} className="inline-flex items-center gap-2 rounded-lg bg-taupe px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Send className="h-4 w-4" />{sendState === 'sending' ? 'שולח...' : 'שליחה ללקוח'}</button></div>
        {sendState === 'sent' && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">החשבונית נשלחה ללקוח ונוספה לרשימת החשבוניות שנשלחו.</p>}
        {sendState === 'error' && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">השליחה נכשלה. ודא שללקוח יש כתובת מייל ושחיבור Gmail פעיל.</p>}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-taupe">לקוח<select value={clientId} onChange={(event) => setClientId(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5">{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
          <label className="text-sm text-taupe">מספר חשבונית<input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5" /></label>
          <label className="text-sm text-taupe">תאריך שליחה<input type="date" value={sendDate} onChange={(event) => setSendDate(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5" /></label>
          <label className="text-sm text-taupe">חבילת שירות<input value={packageName} onChange={(event) => setPackageName(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5" /></label>
          <label className="text-sm text-taupe">החבילה מתאריך<input type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5" /></label>
          <label className="text-sm text-taupe">החבילה עד תאריך<input type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5" /></label>
          <label className="text-sm text-taupe">סכום<input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-sand-dark bg-background p-2.5" /></label>
        </div>
        <div className="mt-5 rounded-xl border border-sand-dark bg-background p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-taupe-light">Invoice</p><h3 className="mt-1 text-xl font-semibold text-taupe">{selectedClient?.name ?? 'לקוח'}</h3></div><p className="text-sm text-taupe-light">#{invoiceNumber}<br />{formatDate(sendDate)}</p></div><div className="mt-6 grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-taupe-light">פריט</p><p className="font-medium text-taupe">{packageName}</p></div><div><p className="text-taupe-light">תקופת החבילה</p><p className="font-medium text-taupe">{formatDate(periodFrom)} – {formatDate(periodTo)}</p></div><div><p className="text-taupe-light">סכום</p><p className="font-semibold text-taupe">${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div></div></div>
      </section>
      <div className="mt-6 space-y-4">
        {clients.map((client) => {
          const isOpen = open === client.id
          const files = client.invoiceFiles ?? []
          return (
            <section key={client.id} className="overflow-hidden rounded-2xl border border-sand-dark bg-card">
              <button type="button" onClick={() => setOpen(isOpen ? null : client.id)} className="flex w-full items-center gap-3 p-5 text-start hover:bg-secondary">
                <Receipt className="h-5 w-5 text-taupe-light" />
                <span className="min-w-0 flex-1"><span className="block font-semibold text-taupe">{client.name}</span><span className="text-xs text-taupe-light">{files.length} חשבוניות</span></span>
                <ChevronDown className={`h-5 w-5 text-taupe-light transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && <div className="border-t border-sand-dark p-4"><div className="grid gap-3 sm:grid-cols-2">{files.length ? files.map((file) => <div key={file} className="flex items-center gap-3 rounded-xl border border-sand-dark bg-background p-3"><FileText className="h-4 w-4 text-taupe-light" /><span className="min-w-0 flex-1 truncate text-sm text-taupe">{file}</span><span className="text-xs text-taupe-light">{monthFromFile(file)}</span></div>) : <p className="text-sm text-taupe-light">אין עדיין חשבוניות בתיק הלקוח.</p>}</div></div>}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

function monthFromFile(file: string) {
  const match = file.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ _-]?(20\d{2})/i)
  return match ? `${match[1]} ${match[2]}` : 'ללא חודש'
}
