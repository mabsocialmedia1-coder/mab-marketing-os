import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function GET(request: NextRequest) {
  const clientId = new URL(request.url).searchParams.get('clientId')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !clientId) {
    return NextResponse.redirect(new URL('/?meta=error&metaMessage=לא ניתן לנתק את Meta ללא התחברות.', request.url))
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'ceo') {
    return NextResponse.redirect(new URL('/?meta=error&metaMessage=רק מנהלת יכולה לנתק ולחבר מחדש את Meta.', request.url))
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('app_records')
    .delete()
    .eq('id', `meta_connection_${clientId}`)
    .eq('entity', 'meta_connections')
    .eq('client_id', clientId)

  if (error) {
    console.error('[v0] Meta disconnect failed:', error.message)
    return NextResponse.redirect(new URL('/?meta=error&metaMessage=ניתוק Meta נכשל. נסה שוב.', request.url))
  }

  return NextResponse.redirect(new URL(`/api/meta/connect?clientId=${encodeURIComponent(clientId)}`, request.url))
}
