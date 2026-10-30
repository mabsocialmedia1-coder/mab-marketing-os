import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const code = request.nextUrl.searchParams.get('code')
  if (!user || !code) return NextResponse.redirect(new URL('/?google=error', request.url))
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: 'https://mab-blush.vercel.app/api/google/callback', grant_type: 'authorization_code' }) })
  const tokens = await tokenResponse.json()
  if (!tokenResponse.ok || !tokens.refresh_token) return NextResponse.redirect(new URL('/?google=error', request.url))
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } })
  const profile = await profileResponse.json()
  const { error } = await supabase.from('google_calendar_connections').upsert({ user_id: user.id, refresh_token: tokens.refresh_token, google_email: profile.email ?? user.email, updated_at: new Date().toISOString() })
  return NextResponse.redirect(new URL(`/?google=${error ? 'error' : 'connected'}`, request.url))
}
