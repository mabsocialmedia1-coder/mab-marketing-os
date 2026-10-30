import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'mab-media'
const MAX_BYTES = 200 * 1024 * 1024

async function getActor() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { supabase, user: null, profile: null }
  const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', auth.user.id).maybeSingle()
  return { supabase, user: auth.user, profile }
}

function normalizeStoragePath(value: string) {
  if (value.startsWith('clients/')) return value
  try {
    const url = new URL(value)
    const marker = `/storage/v1/object/`
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex === -1) return ''
    const remainder = url.pathname.slice(markerIndex + marker.length)
    const bucketMarker = '/mab-media/'
    const bucketIndex = remainder.indexOf(bucketMarker)
    return bucketIndex === -1 ? '' : decodeURIComponent(remainder.slice(bucketIndex + bucketMarker.length))
  } catch {
    return ''
  }
}

function isStoragePath(value: string) {
  return value.startsWith('clients/') && !value.includes('..') && !value.startsWith('/')
}

export async function GET(request: NextRequest) {
  const path = normalizeStoragePath(request.nextUrl.searchParams.get('path') ?? '')
  if (!isStoragePath(path)) return NextResponse.json({ error: 'קובץ המדיה אינו תקין או חסר.' }, { status: 400 })
  const { supabase, user, profile } = await getActor()
  if (!user || !profile) return NextResponse.json({ error: 'נדרשת התחברות כדי לצפות במדיה.' }, { status: 401 })
  const pathClientId = path.split('/')[1]
  if (profile.role === 'client' && profile.client_id !== pathClientId) return NextResponse.json({ error: 'אין הרשאה לצפות במדיה הזו.' }, { status: 403 })
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error || !data?.signedUrl) return NextResponse.json({ error: 'הקובץ חסר או שאין הרשאה לצפות בו.' }, { status: 404 })
  return NextResponse.json({ url: data.signedUrl, expiresIn: 3600 })
}

export async function POST(request: NextRequest) {
  const { supabase, user, profile } = await getActor()
  if (!user || !profile || !['ceo', 'employee'].includes(profile.role)) return NextResponse.json({ error: 'אין הרשאה להעלות מדיה.' }, { status: 403 })
  const form = await request.formData()
  const file = form.get('file')
  const clientId = String(form.get('clientId') ?? '')
  if (!(file instanceof File) || !clientId || file.size > MAX_BYTES || (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf')) {
    return NextResponse.json({ error: 'סוג קובץ לא נתמך או שהקובץ גדול מדי.' }, { status: 400 })
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)
  const path = `clients/${clientId}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) return NextResponse.json({ error: 'שמירת הקובץ נכשלה.' }, { status: 500 })
  return NextResponse.json({ path, kind: file.type.startsWith('video/') ? 'video' : 'image' })
}
