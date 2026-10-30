import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHmac } from 'node:crypto'

function signState(payload: string) {
  return createHmac('sha256', process.env.META_APP_SECRET!).update(payload).digest('base64url')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!user || !clientId) return NextResponse.redirect(new URL('/?meta=error', request.url))
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'ceo') return NextResponse.redirect(new URL('/?meta=forbidden', request.url))
  const redirectUri = `${request.nextUrl.origin}/api/meta/callback`
  const payload = Buffer.from(JSON.stringify({ clientId, userId: user.id })).toString('base64url')
  const state = `${payload}.${signState(payload)}`
  const params = new URLSearchParams({ client_id: process.env.META_APP_ID!, redirect_uri: redirectUri, response_type: 'code', state, scope: 'pages_show_list,business_management,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,instagram_manage_insights' })
  return NextResponse.redirect(`https://www.facebook.com/v22.0/dialog/oauth?${params}`)
}
