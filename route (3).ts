import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function pdfEscape(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}

function createInvoicePdf(fields: { clientName: string; invoiceNumber: string; sendDate: string; periodFrom: string; periodTo: string; packageName: string; amount: string }) {
  const lines = [
    'INVOICE',
    `Invoice number: ${fields.invoiceNumber}`,
    `Send date: ${fields.sendDate}`,
    `Client: ${fields.clientName}`,
    `Package: ${fields.packageName}`,
    `Service period: ${fields.periodFrom} - ${fields.periodTo}`,
    `Amount: $${fields.amount}`,
  ]
  const stream = `BT /F1 16 Tf 50 760 Td ${lines.map((line, index) => `${index ? '0 -28 Td ' : ''}(${pdfEscape(line)}) Tj`).join(' ')} ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return Buffer.from(pdf, 'utf8').toString('base64')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { to?: string; clientName?: string; amount?: string; dueDate?: string; invoiceNumber?: string; sendDate?: string; periodFrom?: string; periodTo?: string; packageName?: string }
  if (!body.to || !body.clientName || !body.amount || !body.invoiceNumber || !body.sendDate || !body.periodFrom || !body.periodTo || !body.packageName) return NextResponse.json({ error: 'Missing invoice fields' }, { status: 400 })
  const { data: connection } = await supabase.from('google_calendar_connections').select('refresh_token').eq('user_id', user.id).maybeSingle()
  if (!connection?.refresh_token) return NextResponse.json({ error: 'Google Gmail is not connected' }, { status: 409 })
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: connection.refresh_token, grant_type: 'refresh_token' }) })
  const token = await tokenResponse.json()
  if (!tokenResponse.ok) return NextResponse.json({ error: 'Google authorization expired' }, { status: 401 })
  const subject = `Invoice ${body.invoiceNumber} for ${body.clientName}`
  const boundary = `invoice_${Date.now()}`
  const pdf = createInvoicePdf({ clientName: body.clientName, invoiceNumber: body.invoiceNumber, sendDate: body.sendDate, periodFrom: body.periodFrom, periodTo: body.periodTo, packageName: body.packageName, amount: body.amount })
  const text = `Hello,\n\nPlease find invoice ${body.invoiceNumber} attached.\n\nClient: ${body.clientName}\nAmount: $${body.amount}\nService period: ${body.periodFrom} - ${body.periodTo}\n\nThank you.`
  const raw = [`To: ${body.to}`, `Subject: ${subject}`, 'MIME-Version: 1.0', `Content-Type: multipart/mixed; boundary="${boundary}"`, '', `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', '', text, `--${boundary}`, 'Content-Type: application/pdf; name="invoice.pdf"', 'Content-Disposition: attachment; filename="invoice.pdf"', 'Content-Transfer-Encoding: base64', '', pdf, `--${boundary}--`].join('\r\n')
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify({ raw: encodeBase64(raw) }) })
  if (!response.ok) return NextResponse.json({ error: 'Gmail send failed' }, { status: 502 })
  return NextResponse.json({ sent: true })
}
