import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const clientId = request.nextUrl.searchParams.get('clientId')
  if (!user || !clientId) return NextResponse.json({ connected: false }, { status: 401 })
  const { data, error } = await supabase.from('app_records').select('data').eq('id', `meta_connection_${clientId}`).eq('entity', 'meta_connections').maybeSingle()
  if (error) return NextResponse.json({ connected: false, pages: [], error: 'לא ניתן לקרוא את חיבור Meta כרגע.' }, { status: 500 })
  const value = data?.data as { pages?: Array<{ id: string; name: string; instagram_business_account?: { id?: string; username?: string } }>; permissions?: Array<{ permission: string; status: string }> } | null
  return NextResponse.json({ connected: Boolean(value), pages: value?.pages ?? [], permissions: value?.permissions ?? [] })
}
