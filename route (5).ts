import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: connection } = await supabase.from('google_calendar_connections').select('refresh_token').eq('user_id', user.id).maybeSingle()
  if (!connection) return NextResponse.json({ connected: false })
  const body = await request.json() as { event: { id: string; title: string; description?: string; date: string; time?: string } }
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: connection.refresh_token, grant_type: 'refresh_token' }) })
  const token = await tokenResponse.json()
  if (!tokenResponse.ok) return NextResponse.json({ error: 'Google authorization expired' }, { status: 401 })
  const startTime = body.event.time ?? '09:00'
  const [hour, minute] = startTime.split(':').map(Number)
  const endTime = `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute || 0).padStart(2, '0')}:00`
  const start = `${body.event.date}T${startTime}:00`
  const end = `${body.event.date}T${endTime}`
  const eventId = `mab${body.event.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().padEnd(5, '0')}`
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify({ id: eventId, summary: body.event.title, description: body.event.description ?? '', start: { dateTime: start, timeZone: 'America/New_York' }, end: { dateTime: end, timeZone: 'America/New_York' }, extendedProperties: { private: { mabEventId: body.event.id } } }) })
  if (!response.ok) return NextResponse.json({ error: 'Google Calendar sync failed' }, { status: 502 })
  return NextResponse.json({ synced: true, googleEventId: eventId })
}
