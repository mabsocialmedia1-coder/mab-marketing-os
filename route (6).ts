import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data, error } = await supabase.from('app_records').select('data').eq('id', id).eq('entity', 'media_assets').maybeSingle()
  if (error || !data?.data) return new NextResponse('Not found', { status: 404 })
  const record = data.data as { url?: string; kind?: string }
  if (!record.url?.startsWith('data:')) return NextResponse.redirect(record.url ?? '/placeholder.svg')
  const match = record.url.match(/^data:([^;]+);base64,([\s\S]+)$/)
  if (!match) return new NextResponse('Invalid media', { status: 422 })
  return new NextResponse(Buffer.from(match[2], 'base64'), { headers: { 'Content-Type': match[1], 'Cache-Control': 'private, max-age=3600' } })
}
