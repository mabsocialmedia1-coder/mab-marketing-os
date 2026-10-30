import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptMetaToken } from '@/lib/meta-crypto'
import { createHmac } from 'node:crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function signState(payload: string) {
  return createHmac('sha256', process.env.META_APP_SECRET!).update(payload).digest('base64url')
}

function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const code = request.nextUrl.searchParams.get('code')
  const stateValue = request.nextUrl.searchParams.get('state')
  if (!code || !stateValue) return NextResponse.redirect(new URL('/?meta=error&metaMessage=חיבור Meta לא הושלם. נסה שוב.', request.url))
  let state: { clientId: string; userId: string }
  try {
    const [payload, signature] = stateValue.split('.')
    if (!payload || !signature || signState(payload) !== signature) throw new Error('invalid state signature')
    state = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    console.error('[v0] Meta callback rejected invalid state')
    return NextResponse.redirect(new URL('/?meta=error&metaMessage=חיבור Meta לא הושלם. נסה שוב.', request.url))
  }
  if (user && state.userId !== user.id) return NextResponse.redirect(new URL('/?meta=forbidden', request.url))
  const redirectUri = `${request.nextUrl.origin}/api/meta/callback`
  const tokenResponse = await fetch('https://graph.facebook.com/v22.0/oauth/access_token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.META_APP_ID!, client_secret: process.env.META_APP_SECRET!, redirect_uri: redirectUri, code }) })
  const token = await tokenResponse.json()
  if (!tokenResponse.ok || !token.access_token) return NextResponse.redirect(new URL('/?meta=error&metaMessage=Meta התחבר, אך קבלת הרשאת הגישה נכשלה. בדוק את הרשאות האפליקציה ונסה שוב.', request.url))
  const longTokenResponse = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?${new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: process.env.META_APP_ID!, client_secret: process.env.META_APP_SECRET!, fb_exchange_token: token.access_token })}`)
  const longToken = await longTokenResponse.json()
  const accessToken = longToken.access_token ?? token.access_token
  const graph = async <T,>(path: string) => {
    const response = await fetch(`https://graph.facebook.com/v22.0${path}${path.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(accessToken)}`)
    return { response, body: await response.json() as T }
  }
  type MetaPage = { id: string; name: string; access_token?: string; instagram_business_account?: { id?: string; username?: string } }
  type MetaConnection = { data?: MetaPage[]; error?: { message?: string } }
  type MetaBusinesses = { data?: Array<{ id: string }> }
  type MetaPermissions = { data?: Array<{ permission: string; status: string }> }
  const [directPages, permissions, businesses] = await Promise.all([
    graph<MetaConnection>('/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100'),
    graph<MetaPermissions>('/me/permissions'),
    graph<MetaBusinesses>('/me/businesses?fields=id&limit=100'),
  ])
  const pageMap = new Map<string, MetaPage>()
  for (const page of directPages.body.data ?? []) pageMap.set(page.id, page)
  for (const business of businesses.body.data ?? []) {
    const [owned, client] = await Promise.all([
      graph<MetaConnection>(`/${business.id}/owned_pages?fields=id,name,access_token,instagram_business_account{id,username}&limit=100`),
      graph<MetaConnection>(`/${business.id}/client_pages?fields=id,name,access_token,instagram_business_account{id,username}&limit=100`),
    ])
    for (const page of [...(owned.body.data ?? []), ...(client.body.data ?? [])]) pageMap.set(page.id, page)
  }
  if (!directPages.response.ok && !businesses.response.ok) {
    const url = new URL('/', request.url)
    url.searchParams.set('meta', 'error')
    url.searchParams.set('metaMessage', 'Meta התחבר, אך לא ניתן לטעון דפים או הרשאות. בדקי את הרשאות Pages ו־Business Portfolio.')
    return NextResponse.redirect(url)
  }
  const admin = createAdminClient()
  const savedPages = Array.from(pageMap.values()).map((page) => ({ id: page.id, name: page.name, accessToken: page.access_token ? encryptMetaToken(page.access_token) : undefined, instagram_business_account: page.instagram_business_account }))
  const { error } = await admin.from('app_records').upsert({ id: `meta_connection_${state.clientId}`, entity: 'meta_connections', client_id: state.clientId, data: { id: `meta_connection_${state.clientId}`, clientId: state.clientId, accessToken: encryptMetaToken(accessToken), pages: savedPages, permissions: permissions.body.data ?? [], connectedAt: new Date().toISOString() } })
  if (error) console.error('[v0] Meta connection save failed:', error.message)
  const url = new URL('/', request.url)
  url.searchParams.set('meta', error ? 'error' : 'connected')
  if (error) url.searchParams.set('metaMessage', 'Meta התחבר, אך שמירת החיבור נכשלה. נסה שוב או פנה למנהל המערכת.')
  if (!error && savedPages.length === 0) url.searchParams.set('metaMessage', 'Meta מחובר, אך לא נמצאו דפי Facebook. ודאי שאת מנהלת הדף ושאישרת הרשאות Pages, ואז התחברי מחדש.')
  return NextResponse.redirect(url)
}
