'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function requireCeo() {
  const supabase = await createServerClient()
  const { data: { user: actor } } = await supabase.auth.getUser()
  if (!actor) throw new Error('Authentication required')
  const { data: actorProfile } = await supabase.from('profiles').select('role').eq('id', actor.id).single()
  if (actorProfile?.role !== 'ceo') throw new Error('Only a CEO can manage client logins')
}

export async function createManagedUser(input: {
  email: string
  password: string
  displayName: string
  role: 'employee' | 'client'
  clientId?: string | null
  clientData?: Record<string, unknown>
}) {
  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes('@')) throw new Error('A valid email is required')
  if (input.password.trim().length < 8) throw new Error('Password must be at least 8 characters')
  if (!input.displayName.trim()) throw new Error('A display name is required')
  await requireCeo()
  const admin = adminClient()
  let userId: string
  let createdUser = false
  const { data, error } = await admin.auth.admin.createUser({ email, password: input.password, email_confirm: true, user_metadata: { display_name: input.displayName } })
  if (data.user) {
    userId = data.user.id
    createdUser = true
  } else if (error?.code === 'email_exists' || error?.message.toLowerCase().includes('already registered')) {
    const { data: existing, error: lookupError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existingUser = existing.users.find((user: { id: string; email?: string }) => user.email?.toLowerCase() === email)
    if (lookupError || !existingUser) throw new Error('The email exists in Auth, but the user could not be linked.')
    userId = existingUser.id
    const { error: passwordError } = await admin.auth.admin.updateUserById(userId, { password: input.password, email_confirm: true, user_metadata: { display_name: input.displayName } })
    if (passwordError) throw new Error(`Existing account update failed: ${passwordError.message}`)
  } else throw new Error(error?.message ?? 'Unable to create user')
  const { error: profileError } = await admin.from('profiles').upsert({ id: userId, role: input.role, client_id: input.clientId ?? null, display_name: input.displayName })
  if (profileError) {
    if (createdUser) await admin.auth.admin.deleteUser(userId)
    throw new Error(`Profile setup failed: ${profileError.message}`)
  }
  if (input.clientId && input.clientData) {
    const clientPayload = { id: input.clientId, name: String(input.clientData.name ?? input.displayName).trim(), data: input.clientData }
    let savedClient: { id: string } | null = null
    let verifyError: { message: string } | null = null
    for (let attempt = 0; attempt < 3 && !savedClient; attempt += 1) {
      const { error: clientError } = await admin.from('clients').upsert(clientPayload, { onConflict: 'id' })
      if (clientError) verifyError = clientError
      else { const result = await admin.from('clients').select('id').eq('id', input.clientId).maybeSingle(); savedClient = result.data; verifyError = result.error }
    }
    if (verifyError || !savedClient) {
      if (createdUser) await admin.auth.admin.deleteUser(userId)
      throw new Error(`Client save could not be verified: ${verifyError?.message ?? 'record not found after 3 attempts'}`)
    }
  }
  return { id: userId, linkedExistingUser: !createdUser }
}

export async function linkClientUser(input: { email: string; password?: string; displayName: string; clientId: string }) {
  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes('@')) throw new Error('A valid client email is required')
  if (!input.displayName.trim()) throw new Error('A client display name is required')
  if (input.password !== undefined && input.password.trim().length < 8) throw new Error('Password must be at least 8 characters')
  await requireCeo()
  const admin = adminClient()
  const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) throw new Error(`Could not find Auth users: ${listError.message}`)
  const existing = users.users.find((user: { id: string; email?: string }) => user.email?.toLowerCase() === email)
  let userId = existing?.id
  if (!userId) {
    if (!input.password) throw new Error('A password is required for a new client login')
    const { data, error } = await admin.auth.admin.createUser({ email, password: input.password, email_confirm: true, user_metadata: { display_name: input.displayName } })
    if (error || !data.user) throw new Error(error?.message ?? 'Could not create client login')
    userId = data.user.id
  } else {
    const update: { password?: string; email?: string; email_confirm?: boolean; user_metadata: { display_name: string } } = { email, email_confirm: true, user_metadata: { display_name: input.displayName } }
    if (input.password) update.password = input.password
    const { error } = await admin.auth.admin.updateUserById(userId, update)
    if (error) throw new Error(`Could not update client login: ${error.message}`)
  }
  const { error: profileError } = await admin.from('profiles').upsert({ id: userId, role: 'client', client_id: input.clientId, display_name: input.displayName })
  if (profileError) throw new Error(`Could not link client profile: ${profileError.message}`)
  return { userId, email, linked: true }
}
