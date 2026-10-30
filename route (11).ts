import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { decryptMetaToken } from '@/lib/meta-crypto'

function adminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

function canAccess(role: string | null | undefined, clientId: string, employeeClientIds: string[], allClients: boolean) {
  return role === 'ceo' || (role === 'employee' && (allClients || employeeClientIds.includes(clientId)))
}

export async function GET(request: NextRequest) {
  const requestedClientId = new URL(request.url).searchParams.get('clientId')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = profile?.role
  if (role !== 'ceo' && role !== 'employee') return NextResponse.json({ items: [] })
  const { data: employee } = role === 'employee' ? await supabase.from('employees').select('data').eq('id', user.id).maybeSingle() : { data: null }
  const permissions = (employee?.data as { permissions?: { allClients?: boolean; clientIds?: string[] } } | null)?.permissions
  const employeeClientIds = permissions?.clientIds ?? []
  const allClients = Boolean(permissions?.allClients)
  const admin = adminClient()
  let query = admin.from('app_records').select('client_id,data').eq('entity', 'meta_connections')
  if (requestedClientId && requestedClientId !== 'all') query = query.eq('client_id', requestedClientId)
  const { data: connections, error } = await query
  if (error) return NextResponse.json({ error: 'Could not read Meta connections' }, { status: 500 })
  const items: Array<Record<string, unknown>> = []
  for (const connection of connections ?? []) {
    const clientId = connection.client_id as string
    if (!clientId || !canAccess(role, clientId, employeeClientIds, allClients)) continue
    const connectionData = connection.data as { pages?: Array<{ id: string; name: string; accessToken?: string }> }
    for (const page of connectionData.pages ?? []) {
      if (!page.accessToken) continue
      try {
        const token = decryptMetaToken(page.accessToken)
        const response = await fetch(`https://graph.facebook.com/v22.0/${page.id}/scheduled_posts?fields=id,message,created_time,scheduled_publish_time,permalink_url,attachments{media_type}&limit=100&access_token=${encodeURIComponent(token)}`)
        if (!response.ok) continue
        const body = await response.json() as { data?: Array<{ id: string; message?: string; scheduled_publish_time?: string; permalink_url?: string; attachments?: { data?: Array<{ media_type?: string }> } }> }
        for (const post of body.data ?? []) {
          if (!post.scheduled_publish_time) continue
          const date = new Date(post.scheduled_publish_time)
          const mediaType = post.attachments?.data?.[0]?.media_type?.toUpperCase() ?? ''
          const type = mediaType.includes('STORY') ? 'STORY' : mediaType.includes('REEL') ? 'REEL' : 'POST'
          items.push({ id: `meta-${post.id}`, clientId, type, platform: 'Facebook', caption: post.message ?? '', scheduledDate: date.toISOString().slice(0, 10), time: date.toTimeString().slice(0, 5), stage: 'scheduled', createdBy: 'Meta', metaId: post.id, permalinkUrl: post.permalink_url })
        }
      } catch {
        continue
      }
    }
  }
  return NextResponse.json({ items })
}
