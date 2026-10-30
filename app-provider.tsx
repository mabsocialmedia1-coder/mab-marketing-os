'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { translations, isRTL, type Lang, type TranslationKey } from '@/lib/i18n'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { createManagedUser, linkClientUser } from '@/app/actions/user-management'
import type { Session } from '@supabase/supabase-js'
import {
  initialActivityLogs,
  initialCalendarEvents,
  initialChatThreads,
  initialContentItems,
  initialEmployees,
  initialWorkJournal,
  initialFinances,
  initialLeads,
  initialMediaAssets,
  initialOperativeTasks,
  initialPaidCampaigns,
  initialTasks,
  followUpInDays,
  nowISO,
  todayISO,
  type ActivityCategory,
  type ActivityLog,
  type Assignee,
  type CalendarEvent,
  type PlanEntry,
  type CalendarLayer,
  type CallOutcome,
  type ChatThread,
  type ChatMessage,
  type ClientFolder,
  type ClientServiceType,
  type CanvaLink,
  type ClientInboxMessage,
  type PackageId,
  type ContentItem,
  type ContentStage,
  type ContentType,
  type Credential,
  type ContentPlatform,
  type Employee,
  type EmployeeStatus,
  type EmployeePermissions,
  type WorkJournalEntry,
  type FinanceEntry,
  type Lead,
  type LeadStatusTag,
  type Marker,
  type MediaAsset,
  type MediaCategory,
  type NotifyChannel,
  type OperativeTask,
  type PaidCampaign,
  type PaidCampaignStatus,
  type CampaignReport,
  type ClientProject,
  type Role,
  type Task,
} from '@/lib/data'

interface AppContextValue {
  // i18n
  lang: Lang
  dir: 'rtl' | 'ltr'
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
  // auth
  role: Role | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void

  // leads
  leads: Lead[]
  addLead: (lead: Partial<Lead>) => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  answerLead: (id: string) => void
  noAnswerLead: (id: string, note: string) => void
  notInterestedLead: (id: string) => void
  setLeadStatus: (id: string, tag: LeadStatusTag) => void
  scheduleLeadMeeting: (id: string, date: string, time: string, link: string, location: string, note?: string) => void
  scheduleLeadCall: (id: string, date: string, time: string, note?: string) => void
  callbackLead: (id: string, date: string, time: string, note?: string) => void
  addLeadFollowUpTask: (id: string, date: string, note: string, kind: 'call' | 'meeting', time?: string) => void
    archiveLead: (id: string) => void
  restoreLead: (id: string) => void
  deleteLead: (id: string) => void

  // client folders
  clientFolders: ClientFolder[]
  addClientFolder: (input: {
  name: string
  businessType: string
  businessTypeHe: string
  contactEmail: string
  businessAddress: string
  businessPhone: string
  importantEmails: string[]
  packageId: PackageId
  serviceType?: ClientServiceType
  customPrice?: number
  contractStartDate?: string
  publishingStartDate?: string
  portalUsername: string
  portalPassword?: string
  }) => Promise<void>
  updateClientFolder: (id: string, input: Partial<{ name: string; businessType: string; businessTypeHe: string; contactEmail: string; businessAddress: string; businessPhone: string; importantEmails: string[]; packageId: PackageId; contractStartDate: string; publishingStartDate: string; strategyIdeas: string; portalUsername: string; portalPassword?: string; projects: ClientFolder['projects']; metaPageId: string; metaPageName: string; metaInstagramId: string; metaInstagramUsername: string }>) => Promise<void>
  deleteClientFolder: (id: string) => Promise<void>

  setClientLogo: (id: string, dataUrl: string) => void
  toggleClientActive: (id: string) => void
  toggleCalendarLayer: (id: string, layer: CalendarLayer) => void
  updateClientDateSettings: (id: string, patch: { calendarLayers?: ClientFolder['calendarLayers']; showEvents?: boolean; categories?: ClientFolder['categories'] }) => void
  togglePlatform: (id: string, platform: ContentPlatform) => void
  toggleNotifyChannel: (id: string, channel: NotifyChannel) => void
  updateClientSocialSettings: (id: string, patch: { hashtagSets?: ClientFolder['hashtagSets']; collabAccounts?: string[] }) => void
  addCanvaLink: (clientId: string, link: Omit<CanvaLink, 'id' | 'createdAt'>) => void
  approveCanvaLink: (clientId: string, linkId: string) => void
  replyToInbox: (clientId: string, messageId: string, reply: string) => void
  updateInboxMessage: (clientId: string, messageId: string, patch: Partial<Pick<ClientInboxMessage, 'assignedTo' | 'handled'>>) => void
    setContractFile: (id: string, fileName: string) => void
    addContractAppendix: (id: string, fileName: string) => void
    removeContractAppendix: (id: string, fileName: string) => void
    addInvoiceFile: (id: string, fileName: string) => void
    removeInvoiceFile: (id: string, fileName: string) => void
  addCredential: (clientId: string, cred: Omit<Credential, 'id'>) => void
  updateCredential: (clientId: string, cred: Credential) => void
  deleteCredential: (clientId: string, credId: string) => void

  // media vault (monthly folders)
  mediaAssets: MediaAsset[]
  addMediaAsset: (clientId: string, category: MediaCategory, monthKey: string, name: string, kind: 'image' | 'video', url?: string) => void
  updateMediaAsset: (id: string, url: string) => void
  deleteMediaAsset: (id: string) => void

  // content items + workflow
  contentItems: ContentItem[]
  addContent: (item: Omit<ContentItem, 'id' | 'stage'> & { stage?: ContentStage }) => void
  ceoApproveContent: (id: string) => void
  ceoRequestEdit: (id: string, comment: string) => void
  clientApproveContent: (id: string) => void
  clientRequestEdit: (id: string, comment: string, markers?: Marker[]) => void
  addContentComment: (id: string, text: string) => void
  resolveEdit: (id: string, fix?: { mediaUrl?: string; mediaKind?: 'image' | 'video'; caption?: string }) => void
  scheduleContent: (id: string, date: string, time: string) => void
  publishContent: (id: string) => void
  markContentPublishFailed: (id: string, reason?: string) => void

  // paid campaigns
  paidCampaigns: PaidCampaign[]
  campaignReports: CampaignReport[]
  createCampaignReport: (report: Omit<CampaignReport, 'id' | 'createdDate' | 'status'>) => void
  updateCampaignReport: (id: string, patch: Partial<Pick<CampaignReport, 'highlights' | 'metrics' | 'recommendations' | 'periodStart' | 'periodEnd' | 'nextDueDate' | 'recipientEmails'>>) => void
  reviewCampaignReport: (id: string, status: CampaignReport['status']) => void
  addPaidCampaign: (c: Omit<PaidCampaign, 'id' | 'status' | 'comment'>, status: 'draft' | 'ceo') => void
  updatePaidCampaign: (id: string, patch: Partial<Omit<PaidCampaign, 'id' | 'clientId' | 'status'>>) => void
  submitPaidCampaign: (id: string) => void
  advancePaidCampaign: (id: string, status: PaidCampaignStatus, comment?: string) => void
  sendBackPaidCampaign: (id: string, comment: string) => void

  // operative tasks
  operativeTasks: OperativeTask[]
  addOperativeTask: (clientId: string, title: string, description?: string) => void
  toggleOperativeTask: (id: string) => void

  // activity logs (audit trail)
  activityLogs: ActivityLog[]

  // employees — manager sees all, employee sees self; manager manages the roster
  employees: Employee[]
  currentEmployeeId: string | null // the employee record for the logged-in user (self)
  currentClientId: string | null // the client folder for the logged-in client (self)
  addEmployee: (e: Omit<Employee, 'id' | 'name' | 'since' | 'assignedClients' | 'openTasks' | 'status'>) => Promise<void>
  updateEmployeePermissions: (id: string, permissions: EmployeePermissions) => void
  setEmployeeStatus: (id: string, status: EmployeeStatus) => void
  deleteEmployee: (id: string) => void
  addEmployeeAttachment: (id: string, att: { name: string; url?: string }) => void

  // work journal — shared attendance log (everyone sees everyone)
  workJournal: WorkJournalEntry[]
  addWorkJournalEntry: (entry: Omit<WorkJournalEntry, 'id'>) => void
  deleteWorkJournalEntry: (id: string) => void

  // finances — revenue & expenses (manager only)
  finances: FinanceEntry[]
  addFinanceEntry: (entry: Omit<FinanceEntry, 'id'>) => void

  // team chat (CEO only)
  chatThreads: ChatThread[]
  sendChatMessage: (threadId: string, text: string, attachment?: ChatMessage['attachment']) => void

  // tasks center
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdDate' | 'done'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  // calendar
  calendarEvents: CalendarEvent[]
  planEntries: Record<string, PlanEntry>
  addCalendarEvent: (clientId: string, title: string, date: string, description?: string) => string
  setCalendarEventStatus: (id: string, status: 'approved' | 'rejected') => void
  setCalendarEventIdea: (id: string, idea: string, clientId?: string) => void
  setCalendarEventFinalNote: (id: string, note: string) => void
  updatePlanEntry: (key: string, patch: Partial<PlanEntry>) => void
  sendPlanEntries: (keys: string[]) => void
  updatePlanningDate: (id: string, patch: Partial<Pick<CalendarEvent, 'planningStatus' | 'planningNote' | 'planningSentToClient'>>) => void
  sendPlanningDates: (ids: string[]) => void
}

const AppContext = createContext<AppContextValue | null>(null)

let idCounter = 2000
const nextId = (prefix: string) => `${prefix}${idCounter++}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const setLang = (next: Lang) => {
    setLangState(next)
    if (typeof window !== 'undefined') window.localStorage.setItem('mab-language', next)
  }
  const [role, setRole] = useState<Role | null>(null)
  const supabase = useMemo(() => createSupabaseClient(), [])

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('mab-language')
    if (savedLanguage === 'en' || savedLanguage === 'he') setLangState(savedLanguage)
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setRole(null)
        return
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      const nextRole = profile?.role as Role | undefined
      setRole(nextRole ?? null)
    }
    void loadProfile()
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (!session?.user) setRole(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [supabase])

  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [clientFolders, setClientFolders] = useState<ClientFolder[]>([])
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(initialMediaAssets)
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems)
  const [paidCampaigns, setPaidCampaigns] = useState<PaidCampaign[]>(initialPaidCampaigns)
  const [campaignReports, setCampaignReports] = useState<CampaignReport[]>([])
  const [operativeTasks, setOperativeTasks] = useState<OperativeTask[]>(initialOperativeTasks)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs)
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [workJournal, setWorkJournal] = useState<WorkJournalEntry[]>(initialWorkJournal)
  const [finances, setFinances] = useState<FinanceEntry[]>(initialFinances)
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(initialChatThreads)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents)
  const [planEntries, setPlanEntries] = useState<Record<string, PlanEntry>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [profileClientId, setProfileClientId] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const dataHydratedRef = useRef(false)
  const loadGenerationRef = useRef(0)
  const persistedRecordsRef = useRef<Record<string, Map<string, string>>>({})
  const persistedClientsRef = useRef<Map<string, string>>(new Map())
  const persistedCalendarRef = useRef<Map<string, string>>(new Map())
  const persistedPlansRef = useRef<Map<string, string>>(new Map())
  
  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      const generation = ++loadGenerationRef.current
  dataHydratedRef.current = false
  persistedRecordsRef.current = {}
  persistedClientsRef.current = new Map()
  persistedCalendarRef.current = new Map()
  persistedPlansRef.current = new Map()
  setDataLoaded(false)
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', user.id).maybeSingle()
      if (cancelled) return
      setCurrentUserId(user.id)
      if (profile?.role) setRole(profile.role as Role)
      setProfileClientId(profile?.client_id ?? null)

      const employeeResult = await supabase.from('employees').select('id, data, created_at, updated_at')
      if (employeeResult.error) {
        console.error('[v0] Employee data hydration failed', employeeResult.error.message)
        return
      }
      const loadedEmployees = (employeeResult.data ?? []).map((row: { id: string; data: unknown }) => ({ ...(row.data as Employee), id: row.id }))
      const employeeRecord = loadedEmployees.find((employee: Employee) => employee.id === user.id || employee.email.toLowerCase() === (user.email ?? '').toLowerCase())
      const employeePermissions = employeeRecord?.permissions
      if (profile?.role === 'employee' && employeeRecord?.name.toLowerCase().includes('evelyn') && !employeePermissions?.allClients) {
        employeeRecord.permissions = { ...(employeePermissions ?? { folderTabs: [], canSeeContracts: false }), allClients: true, clientIds: [] }
      }
      const allowedClientIds = profile?.role === 'client'
        ? (profile.client_id ? [profile.client_id] : [])
        : profile?.role === 'employee'
          ? (employeePermissions?.allClients ? null : employeePermissions?.clientIds ?? [])
          : null
      const queryClientIds = profile?.role === 'client' && !profile.client_id ? null : allowedClientIds
      const clientsQuery = supabase.from('clients').select('id, name, data, created_at, updated_at')
      if (queryClientIds) clientsQuery.in('id', queryClientIds)
      const recordsQuery = supabase.from('app_records').select('id, entity, client_id, data, created_at, updated_at')
      if (queryClientIds) recordsQuery.in('client_id', queryClientIds)
      const plansQuery = supabase.from('plan_entries').select('id, client_id, event_key, picked, decision, note, sent_at, updated_by, created_at, updated_at')
      if (queryClientIds) plansQuery.in('client_id', queryClientIds)
      const settingsQuery = supabase.from('client_calendar_settings').select('client_id, calendar_layers, show_events')
      if (queryClientIds) settingsQuery.in('client_id', queryClientIds)
      const [clientsResult, recordsResult, plansResult, settingsResult] = await Promise.all([
        clientsQuery,
        recordsQuery,
        plansQuery,
        settingsQuery,
      ])
      if (cancelled || generation !== loadGenerationRef.current) return
      if (clientsResult.error) {
        console.error('[v0] Client data hydration failed', clientsResult.error.message)
        setClientFolders([])
        if (profile?.role === 'client') setContentItems([])
        return
      }
      if (recordsResult.error || plansResult.error || settingsResult.error) {
        console.error('[v0] Auxiliary data hydration failed; keeping client list', { records: recordsResult.error?.message, plans: plansResult.error?.message, settings: settingsResult.error?.message })
      }
      const clientRows = Array.isArray(clientsResult.data) ? clientsResult.data : []
      const clients: ClientFolder[] = []
      for (const row of clientRows as Array<{ id: string; name: string; data: unknown }>) {
        const source = row && row.data && typeof row.data === 'object' ? row.data as Partial<ClientFolder> : {}
        const raw = { ...source, id: row.id, name: row.name }
        const credentials = Array.isArray(source.credentials) ? source.credentials : []
        const safeCredentials: NonNullable<ClientFolder['credentials']> = []
        for (const credential of credentials) safeCredentials.push({ ...credential, password: '' })
        const client = { ...raw, credentials: safeCredentials } as ClientFolder
        clients.push(profile?.role === 'employee' ? { ...client, customPrice: undefined } : client)
      }
      const settingsByClient = new Map<string, { client_id: string; calendar_layers: unknown; show_events: boolean }>()
      const settingsRows = Array.isArray(settingsResult.data) ? settingsResult.data : []
      for (const row of settingsRows as Array<{ client_id: string; calendar_layers: unknown; show_events: boolean }>) settingsByClient.set(row.client_id, row)
      const effectiveClientIds = profile?.role === 'client' && !profile.client_id
        ? clients.filter((client) => client.contactEmail.toLowerCase() === (user.email ?? '').toLowerCase()).map((client) => client.id)
        : allowedClientIds
      const approvedClientNames = new Set(['ZYDO', 'MAB', 'ROBS', 'CHAYA', 'Hopson Health Wellness Center', 'Construction 95'])
      const hydratedClients: ClientFolder[] = []
      for (const client of clients) {
        if (!approvedClientNames.has(client.name)) continue
        if (effectiveClientIds && !effectiveClientIds.includes(client.id)) continue
        const settings = settingsByClient.get(client.id)
        const savedLayers = settings?.calendar_layers && typeof settings.calendar_layers === 'object' ? settings.calendar_layers as Partial<ClientFolder['calendarLayers']> : {}
  hydratedClients.push(settings ? { ...client, calendarLayers: { ...client.calendarLayers, ...savedLayers }, showEvents: typeof settings.show_events === 'boolean' ? settings.show_events : client.showEvents } : client)
      }
      setClientFolders(hydratedClients)
      setEmployees(loadedEmployees)
      const grouped = new Map<string, unknown[]>()
      for (const row of (recordsResult.data ?? []) as Array<{ entity: string; client_id: string | null; data: unknown }>) {
        if (effectiveClientIds && row.client_id && !effectiveClientIds.includes(row.client_id)) continue
        if (profile?.role === 'employee' && row.entity === 'finances') continue
        grouped.set(row.entity, [...(grouped.get(row.entity) ?? []), row.data])
      }
      const setRecords = (entity: string, setter: (value: never[]) => void) => setter((grouped.get(entity) ?? []) as never[])
      setRecords('leads', setLeads); setRecords('media_assets', setMediaAssets); setRecords('content_items', setContentItems)
      setRecords('paid_campaigns', setPaidCampaigns); setRecords('campaign_reports', setCampaignReports); setRecords('operative_tasks', setOperativeTasks); setRecords('tasks', setTasks)
      setRecords('activity_logs', setActivityLogs); setRecords('work_journal', setWorkJournal); setRecords('finances', setFinances)
      const storedChatThreads = (grouped.get('chat_threads') ?? []) as ChatThread[]
  const chatThreadMap = new Map([...initialChatThreads, ...storedChatThreads].map((thread) => [thread.id, thread]))
  setChatThreads(Array.from(chatThreadMap.values()))
  setRecords('calendar_events', setCalendarEvents)
      setPlanEntries(Object.fromEntries((plansResult.data ?? []).map((row: any) => [row.event_key, { ...(row as PlanEntry), id: row.id, clientId: row.client_id, eventKey: row.event_key }] as const)))
      dataHydratedRef.current = true
      setDataLoaded(true)
    }
    void loadData()
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void loadData() })
    return () => { cancelled = true; listener.subscription.unsubscribe() }
  }, [supabase])

  useEffect(() => {
    if (!dataLoaded || !currentUserId || (role !== 'ceo' && role !== 'employee')) return
    let cancelled = false
    const syncMetaSchedules = async () => {
      const response = await fetch('/api/meta/scheduled?clientId=all')
      if (!response.ok || cancelled) return
      const result = await response.json() as { items?: ContentItem[] }
      if (!result.items?.length) return
      setContentItems((current) => {
        const external = new Map(result.items!.map((item) => [item.id, item]))
        return [...current.filter((item) => !external.has(item.id)), ...result.items!]
      })
    }
    void syncMetaSchedules().catch(() => undefined)
    return () => { cancelled = true }
  }, [dataLoaded, currentUserId, role])

  useEffect(() => {
    if (!dataLoaded || !dataHydratedRef.current || !currentUserId) return
    const entities: Record<string, readonly { id: string; clientId?: string }[]> = {
      leads,
      media_assets: mediaAssets,
      content_items: contentItems,
      paid_campaigns: paidCampaigns,
      campaign_reports: campaignReports,
      operative_tasks: operativeTasks,
      tasks,
      activity_logs: activityLogs,
      work_journal: workJournal,
      finances,
      chat_threads: chatThreads,
      calendar_events: calendarEvents,
    }
    const save = async () => {
      const requests: Promise<unknown>[] = []
      for (const [entity, rows] of Object.entries(entities)) {
        const previous = persistedRecordsRef.current[entity] ?? new Map<string, string>()
        const current = new Map(rows.map((row) => [row.id, JSON.stringify(row)]))
        for (const row of rows) {
          const serialized = current.get(row.id)
          if (previous.get(row.id) === serialized) continue
          requests.push(supabase.from('app_records').upsert({ id: row.id, entity, client_id: row.clientId ?? null, data: row }).then(() => undefined))
        }
        for (const id of previous.keys()) {
          if (current.has(id)) continue
          requests.push(supabase.from('app_records').delete().eq('id', id).eq('entity', entity).then(() => undefined))
        }
        persistedRecordsRef.current[entity] = current
      }
      const previousClients = persistedClientsRef.current
      const currentClients = new Map(clientFolders.map((client) => [client.id, JSON.stringify(client)]))
      for (const client of clientFolders) {
        if (previousClients.get(client.id) === currentClients.get(client.id)) continue
        requests.push(supabase.from('clients').upsert({ id: client.id, name: client.name, data: client }).then(() => undefined))
        requests.push(supabase.from('client_calendar_settings').upsert({ client_id: client.id, calendar_layers: client.calendarLayers, show_events: client.showEvents ?? true }).then(() => undefined))
      }
      for (const id of previousClients.keys()) {
        if (!currentClients.has(id)) requests.push(supabase.from('clients').delete().eq('id', id).then(() => undefined))
      }
      persistedClientsRef.current = currentClients
      const previousCalendar = persistedCalendarRef.current
      const currentCalendar = new Map(calendarEvents.map((event) => [event.id, JSON.stringify(event)]))
      for (const event of calendarEvents) {
        if (previousCalendar.get(event.id) === currentCalendar.get(event.id)) continue
        requests.push(fetch('/api/google/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event }) }).catch(() => undefined))
      }
      persistedCalendarRef.current = currentCalendar
      const previousPlans = persistedPlansRef.current
      const currentPlans = new Map(Object.entries(planEntries).map(([key, entry]) => [key, JSON.stringify(entry)]))
      for (const [key, serialized] of currentPlans) {
        if (previousPlans.get(key) === serialized) continue
        const entry = planEntries[key] as PlanEntry & { id?: string; clientId?: string; eventKey?: string }
        requests.push(supabase.from('plan_entries').upsert({ id: entry.id, client_id: entry.clientId, event_key: entry.eventKey ?? key, picked: entry.picked, decision: entry.decision, note: entry.note, sent_at: entry.sentAt, updated_by: currentUserId }).then(() => undefined))
      }
      persistedPlansRef.current = currentPlans
      await Promise.all(requests)
    }
    void save()
  }, [dataLoaded, currentUserId, clientFolders, leads, mediaAssets, contentItems, paidCampaigns, campaignReports, operativeTasks, tasks, activityLogs, workJournal, finances, chatThreads, calendarEvents, planEntries, supabase])

  const dir = isRTL(lang) ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const t = useMemo(
    () => (key: TranslationKey) => translations[lang][key] ?? key,
    [lang],
  )

  function clientNameById(clientId: string): string {
  return clientFolders.find((c) => c.id === clientId)?.name ?? 'Client'
  }

  function assignedEmployeeForClient(clientId: string): Assignee {
    const employee = employees.find((item) => item.permissions?.allClients || item.permissions?.clientIds?.includes(clientId))
    if (employee?.name.toLowerCase().includes('new employee')) return 'New Employee'
    return employee?.name.toLowerCase().includes('evelyn') ? 'Evelyn' : 'Evelyn'
  }


  function actorName(): string {
    if (role === 'ceo') return 'Maya (Manager)'
    if (role === 'employee') return 'Evelyn'
    return 'Client'
  }

  function log(
    clientId: string,
    category: ActivityCategory,
    action: string,
    actionHe: string,
  ) {
    setActivityLogs((prev) => [
      {
        id: nextId('al'),
        clientId,
        category,
        actor: actorName(),
        action,
        actionHe,
        timestamp: nowISO(),
      },
      ...prev,
    ])
  }

  function addEvelynTask(title: string, client: string, description = '', assignee: Assignee = 'Evelyn') {
  setTasks((prev) => {
  if (prev.some((task) => !task.done && task.title === title)) return prev
  return [{ id: nextId('t'), title, description, assignee, urgency: 'urgentWeek', client, createdDate: todayISO(), done: false }, ...prev]
  })
  }

  function closeWorkflowTasks(clientId: string, type: ContentType) {
    const client = clientNameById(clientId)
    setTasks((prev) => prev.map((task) => task.client === client && task.title.includes(type) && !task.done ? { ...task, done: true } : task))
  }

  useEffect(() => {
  contentItems.filter((item) => item.stage === 'manager_review').forEach((item) => {
    addEvelynTask(`בדיקת מנהלת ${item.type} — ${clientNameById(item.clientId)}`, clientNameById(item.clientId), 'חומר חדש ממתין לבדיקה ואישור מנהלת.', 'Maya')
  })
  }, [contentItems, clientFolders, tasks])

  useEffect(() => {
  const today = todayISO()
  campaignReports.forEach((report) => {
      if (!report.nextDueDate || report.nextDueDate > today || report.status === 'draft') return
      const title = `Biweekly campaign report — ${clientNameById(report.clientId)}`
      if (!tasks.some((task) => task.title === title && !task.done)) {
        addEvelynTask(title, clientNameById(report.clientId), `Prepare the next 14-day report, keep the strong data, edit out weak data, and request manager or employee approval before sending it to the client.`, 'Maya')
        setCampaignReports((prev) => prev.map((item) => item.id === report.id ? { ...item, nextDueDate: new Date(new Date(report.nextDueDate + 'T12:00:00').getTime() + 14 * 86400000).toISOString().slice(0, 10), status: 'internalReview' } : item))
      }
    })
  }, [campaignReports, tasks])

  const value: AppContextValue = {
    lang,
    dir,
    setLang,
    t,
    role,
  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password.trim()) return { error: 'Email and password are required' }
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
    if (error) return { error: 'Invalid email or password' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', (await supabase.auth.getUser()).data.user?.id ?? '').maybeSingle()
    const nextRole = profile?.role as Role | undefined
    if (nextRole) setRole(nextRole)
    return {}
  },
  logout: async () => { await supabase.auth.signOut(); setRole(null) },

    leads,
    addLead: (lead) =>
      setLeads((prev) => [
        {
          id: nextId('l'),
          firstName: '',
          lastName: '',
          organization: '',
          phone: '',
          address: '',
          instagram: '',
          website: '',
          facebook: '',
          source: 'facebookGroups',
          callOutcome: null,
          statusTag: null,
          notes: '',
          archived: false,
          createdDate: todayISO(),
          ...lead,
        },
        ...prev,
      ]),
    updateLead: (id, patch) =>
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))),
  // Answer only records the outcome; the next action is chosen explicitly on the lead card.
  answerLead: (id) =>
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, callOutcome: 'answered' } : l)),
    ),
    noAnswerLead: (id, note) => {
      const lead = leads.find((l) => l.id === id)
      if (!lead) return
      const date = followUpInDays(todayISO(), 3)
      const description = note.trim()
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, callOutcome: 'noAnswer', followUpDate: date, notes: `${l.notes}${l.notes ? '\\n' : ''}${description}` } : l)))
      setTasks((prev) => [
        {
          id: nextId('t'),
          title: `Call back: ${lead.firstName} ${lead.lastName}`,
          description: `${description} · No answer — call again on ${date}`,
          assignee: lead.assignedEmployeeName ?? 'Evelyn',
          urgency: 'urgentWeek',
          client: 'Leads',
          createdDate: todayISO(),
          done: false,
        },
        ...prev,
      ])
    },
    notInterestedLead: (id) =>
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, callOutcome: 'notInterested', archived: true } : l,
        ),
      ),
    setLeadStatus: (id, tag) =>
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l
          if (tag === 'hot' || tag === 'deliberating') {
            return { ...l, statusTag: tag, followUpDate: followUpInDays(todayISO(), 3) }
          }
          return { ...l, statusTag: tag }
        }),
      ),
    scheduleLeadMeeting: (id, date, time, link, location, note) =>
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, statusTag: 'meeting', meetingDate: date, meetingTime: time, meetingLink: link, meetingLocation: location, meetingNote: note }
            : l,
        ),
      ),
    scheduleLeadCall: (id, date, time, note) =>
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, callDate: date, callTime: time, callNote: note } : l)),
      ),
    callbackLead: (id, date, time, note) =>
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, callDate: date, callTime: time, callNote: note } : l))),
    addLeadFollowUpTask: (id, date, note, kind, time) => {
      const lead = leads.find((l) => l.id === id)
      if (!lead) return
      const employeeTask = {
        id: nextId('t'),
        title: kind === 'meeting' ? `Meeting: ${lead.firstName} ${lead.lastName}` : `Call back: ${lead.firstName} ${lead.lastName}`,
        description: `${note} · ${date}`,
        assignee: lead.assignedEmployeeName ?? 'Evelyn',
        urgency: 'urgentWeek' as const,
        client: lead.organization || `${lead.firstName} ${lead.lastName}`,
        createdDate: todayISO(),
        done: false,
      }
      const managerTask = kind === 'meeting' ? { ...employeeTask, id: nextId('t'), assignee: 'Maya' as const } : null
      setTasks((prev) => [employeeTask, ...(managerTask ? [managerTask] : []), ...prev])
  const calendarEventId = `lead-${id}-${kind}`
  const calendarTitle = kind === 'meeting' ? `Meeting: ${lead.firstName} ${lead.lastName}` : `Call: ${lead.firstName} ${lead.lastName}`
  const calendarTitleHe = kind === 'meeting' ? `פגישה: ${lead.firstName} ${lead.lastName}` : `שיחה: ${lead.firstName} ${lead.lastName}`
  setCalendarEvents((prev) => [
    ...prev.filter((event) => event.id !== calendarEventId),
    {
      id: calendarEventId,
      clientId: id,
      title: calendarTitle,
      titleHe: calendarTitleHe,
      date,
      time: time ?? (kind === 'meeting' ? lead.meetingTime : lead.callTime),
      layer: 'international',
      description: note,
      descriptionHe: note,
    },
  ])

    },
    archiveLead: (id) =>
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, archived: true } : l))),
    restoreLead: (id) =>
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, archived: false } : l))),
    deleteLead: (id) => { if (role !== 'ceo') return; setLeads((prev) => prev.filter((l) => l.id !== id)) },

    clientFolders,
    addClientFolder: async (input) => {
      const id = nextId('cf')
      const now = new Date()
      const since = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      const sinceMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const folder: ClientFolder = {
        id,
        name: input.name.trim(),
        businessType: input.businessType.trim(),
        businessTypeHe: input.businessTypeHe.trim() || input.businessType.trim(),
        logo: null,
  packageId: input.packageId,
  since,
  sinceMonth,
  contractStartDate: input.contractStartDate || undefined,
  publishingStartDate: input.publishingStartDate || undefined,
        contactEmail: input.contactEmail.trim(),
        platforms: ['Instagram', 'Facebook'],
  calendarLayers: { jewish: false, christian: false, usLocal: true, international: true, events: true },
  showEvents: true,
  categories: [],
  notifyChannels: ['email'],
        invoiceStatus: 'pending',
        contractFileName: null,
        // The generated portal login lands in the client's password vault
        credentials: [
          { id: nextId('cr'), platform: 'Client Portal', username: input.portalUsername, password: '' },
        ],
        active: true,
        projects: [{ id: nextId('project'), name: 'Social Media', type: 'socialMedia', notes: '', tasks: [], employeeIds: [], folders: ['Passwords', 'Contracts', 'Photoshoot', 'Client Assets', 'Brand Assets', 'Canva', 'Campaigns', 'Tasks'] }],
      }
      await createManagedUser({
        email: input.contactEmail.trim(),
        password: input.portalPassword || '',
        displayName: input.name.trim(),
        role: 'client',
        clientId: id,
        clientData: folder as unknown as Record<string, unknown>,
      })
      setClientFolders((prev) => [folder, ...prev])
      log(id, 'system', `Created client "${folder.name}" (${input.packageId} package)`, `יצר/ה לקוח "${folder.name}" (חבילת ${input.packageId})`)
      log(id, 'credential', `Generated portal login: ${input.portalUsername}`, `הפיק/ה כניסת פורטל: ${input.portalUsername}`)
    },
    updateClientFolder: async (id, input) => {
      if (role !== 'ceo') throw new Error('Only the manager can change client packages and details')
      const current = clientFolders.find((client) => client.id === id)
      if (!current) throw new Error('Client folder not found')
      const next = { ...current, ...input, name: input.name?.trim() || current.name, businessType: input.businessType?.trim() || current.businessType, businessTypeHe: input.businessTypeHe?.trim() || current.businessTypeHe, contactEmail: input.contactEmail?.trim() || current.contactEmail }
  const existingCredentials = Array.isArray(next.credentials) ? next.credentials : []
  const portal = existingCredentials.find((item) => item.platform === 'Client Portal')
  const credentials = existingCredentials.map((item) => item.id === portal?.id ? { ...item, username: input.portalUsername ?? item.username, password: '' } : { ...item, password: '' })
  if (input.contactEmail) {
    await linkClientUser({ email: input.contactEmail, displayName: next.name, clientId: id })
  }
  setClientFolders((prev) => prev.map((client) => client.id === id ? { ...next, credentials } : client))
    },
deleteClientFolder: async (id) => {
    if (role !== 'ceo') return
    await Promise.all([
        supabase.from('clients').delete().eq('id', id),
        supabase.from('app_records').delete().eq('client_id', id),
        supabase.from('plan_entries').delete().eq('client_id', id),
        supabase.from('client_calendar_settings').delete().eq('client_id', id),
      ])
      setClientFolders((prev) => prev.filter((client) => client.id !== id))
    },
    setClientLogo: (id, dataUrl) =>
      setClientFolders((prev) => prev.map((c) => (c.id === id ? { ...c, logo: dataUrl } : c))),
    toggleClientActive: (id) => {
      setClientFolders((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
      const c = clientFolders.find((x) => x.id === id)
      if (c) {
        log(
          id,
          'system',
          c.active ? 'Moved client to Inactive' : 'Reactivated client',
          c.active ? 'העביר/ה לקוח ללא פעילים' : 'הפעיל/ה מחדש לקוח',
        )
      }
    },
    updateClientDateSettings: (id, patch) => setClientFolders((prev) => prev.map((client) => client.id === id ? { ...client, ...patch } : client)),
    toggleCalendarLayer: (id, layer) =>
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, calendarLayers: { ...c.calendarLayers, [layer]: !c.calendarLayers[layer] } }
            : c,
        ),
      ),
    togglePlatform: (id, platform) =>
      setClientFolders((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const has = c.platforms.includes(platform)
          return {
            ...c,
            platforms: has
              ? c.platforms.filter((p) => p !== platform)
              : [...c.platforms, platform],
          }
        }),
      ),
  updateClientSocialSettings: (id, patch) => setClientFolders((prev) => prev.map((client) => client.id === id ? { ...client, ...patch } : client)),
  addCanvaLink: (clientId, link) => setClientFolders((prev) => prev.map((client) => client.id === clientId ? { ...client, canvaLinks: [...(client.canvaLinks ?? []), { ...link, id: nextId('canva'), createdAt: new Date().toISOString() }] } : client)),
  approveCanvaLink: (clientId, linkId) => setClientFolders((prev) => prev.map((client) => client.id === clientId ? { ...client, canvaLinks: (client.canvaLinks ?? []).map((link) => link.id === linkId ? { ...link, approved: true } : link) } : client)),
  replyToInbox: (clientId, messageId, reply) => setClientFolders((prev) => prev.map((client) => client.id === clientId ? { ...client, inboxMessages: (client.inboxMessages ?? []).map((message) => message.id === messageId ? { ...message, reply: reply.trim(), handled: true } : message) } : client)),
  updateInboxMessage: (clientId, messageId, patch) => setClientFolders((prev) => prev.map((client) => client.id === clientId ? { ...client, inboxMessages: (client.inboxMessages ?? []).map((message) => message.id === messageId ? { ...message, ...patch } : message) } : client)),
  toggleNotifyChannel: (id, channel) =>
  setClientFolders((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const has = c.notifyChannels.includes(channel)
          return {
            ...c,
            notifyChannels: has
              ? c.notifyChannels.filter((n) => n !== channel)
              : [...c.notifyChannels, channel],
          }
        }),
      ),
    setContractFile: (id, fileName) => {
      setClientFolders((prev) => prev.map((c) => (c.id === id ? { ...c, contractFileName: fileName } : c)))
      log(id, 'system', `Uploaded signed contract: ${fileName}`, `העלה/תה חוזה חתום: ${fileName}`)
    },
    addContractAppendix: (id, fileName) => {
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, contractAppendices: [...(c.contractAppendices ?? []), fileName] } : c,
        ),
      )
      log(id, 'system', `Added contract appendix: ${fileName}`, `הוסיף/ה נספח לחוזה: ${fileName}`)
    },
    removeContractAppendix: (id, fileName) => {
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, contractAppendices: (c.contractAppendices ?? []).filter((f) => f !== fileName) }
            : c,
        ),
      )
      log(id, 'system', `Removed contract appendix: ${fileName}`, `הסיר/ה נספח לחוזה: ${fileName}`)
    },
    addInvoiceFile: (id, fileName) => {
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, invoiceFiles: [...(c.invoiceFiles ?? []), fileName] } : c,
        ),
      )
      log(id, 'system', `Uploaded invoice: ${fileName}`, `העלה/תה חשבונית: ${fileName}`)
    },
    removeInvoiceFile: (id, fileName) => {
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, invoiceFiles: (c.invoiceFiles ?? []).filter((f) => f !== fileName) } : c,
        ),
      )
      log(id, 'system', `Removed invoice: ${fileName}`, `הסיר/ה חשבונית: ${fileName}`)
    },
    addCredential: (clientId, cred) => {
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, credentials: [...c.credentials, { ...cred, id: nextId('cr') }] }
            : c,
        ),
      )
      log(clientId, 'credential', `Added ${cred.platform} credentials`, `הוסיף/ה פרטי גישה ל-${cred.platform}`)
    },
    updateCredential: (clientId, cred) => {
      setClientFolders((prev) =>
        prev.map((c) =>
c.id === clientId
          ? { ...c, credentials: (Array.isArray(c.credentials) ? c.credentials : []).map((x) => (x.id === cred.id ? cred : x)) }
            : c,
        ),
      )
      log(clientId, 'credential', `Updated ${cred.platform} credentials`, `עדכן/ה פרטי גישה ל-${cred.platform}`)
    },
    deleteCredential: (clientId, credId) => {
      if (role !== 'ceo') return
      setClientFolders((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, credentials: c.credentials.filter((x) => x.id !== credId) }
            : c,
        ),
      )
    },

    mediaAssets,
    addMediaAsset: (clientId, category, monthKey, name, kind, url) => {
      setMediaAssets((prev) => [
        { id: nextId('ma'), clientId, category, monthKey, name, kind, date: todayISO(), uploadedBy: actorName(), url },
        ...prev,
      ])
      const where =
        category === 'photoshoot' ? 'Photoshoot Directory' : category === 'brandAssets' ? 'Brand Assets' : 'Client Assets'
      const whereHe =
        category === 'photoshoot' ? 'תיקיית הצילומים' : category === 'brandAssets' ? 'נכסי מותג' : 'חומרים מלקוח'
      log(clientId, 'media', `Uploaded ${name} to ${where}`, `העלה/תה את ${name} ל${whereHe}`)
    },
  updateMediaAsset: (id, url) => {
    if (role !== 'ceo' && role !== 'employee') return
    setMediaAssets((prev) => prev.map((media) => media.id === id ? { ...media, url } : media))
  },
  deleteMediaAsset: () => {},
  
  contentItems,
    addContent: (item) => {
      const id = nextId('ci')
      const stage = item.stage ?? 'manager_review'
      setContentItems((prev) => [{ ...item, id, stage, approvalHistory: [] }, ...prev])
      if (stage === 'manager_review') addEvelynTask(`בדיקת מנהלת ${item.type} — ${clientNameById(item.clientId)}`, clientNameById(item.clientId), 'חומר חדש ממתין לבדיקה ואישור מנהלת.', 'Maya')
    },
    ceoApproveContent: (id) => {
      if (role !== 'ceo') return
      setContentItems((prev) => prev.map((c) => {
        if (c.id !== id || c.stage !== 'manager_review') return c
        closeWorkflowTasks(c.clientId, c.type)
        const now = new Date().toISOString()
        return { ...c, stage: 'client_review', approvalHistory: [...(c.approvalHistory ?? []), { id: nextId('ah'), from: c.stage, to: 'client_review', actorId: currentUserId ?? undefined, actorName: actorName(), actorRole: 'ceo', createdAt: now }] }
      }))
    },
    ceoRequestEdit: (id, comment) => {
      const note = comment.trim()
      if (role !== 'ceo' || !note) return
      setContentItems((prev) => prev.map((c) => {
        if (c.id !== id || c.stage !== 'manager_review') return c
        addEvelynTask(`Redo ${c.type} — ${clientNameById(c.clientId)}`, clientNameById(c.clientId), `יש לתקן ולהגיש מחדש: ${note}`, assignedEmployeeForClient(c.clientId))
        const now = new Date().toISOString()
        return { ...c, stage: 'needs_fix', comment: note, editSource: 'ceo', approvalHistory: [...(c.approvalHistory ?? []), { id: nextId('ah'), from: c.stage, to: 'needs_fix', actorId: currentUserId ?? undefined, actorName: actorName(), actorRole: 'ceo', note, createdAt: now }] }
      }))
    },
    clientApproveContent: (id) => {
      if (role !== 'client') return
      setContentItems((prev) => prev.map((c) => {
        if (c.id !== id || c.stage !== 'client_review') return c
        closeWorkflowTasks(c.clientId, c.type)
        addEvelynTask(`לתזמן ${c.type} — ${clientNameById(c.clientId)}`, clientNameById(c.clientId), 'הלקוח אישר. יש לקבוע תאריך ושעה לפרסום.', assignedEmployeeForClient(c.clientId))
        const now = new Date().toISOString()
        return { ...c, stage: 'approved', scheduledDate: undefined, time: undefined, lastApprovedBy: actorName(), lastApprovedAt: now, approvalHistory: [...(c.approvalHistory ?? []), { id: nextId('ah'), from: c.stage, to: 'approved', actorId: currentUserId ?? undefined, actorName: actorName(), actorRole: 'client', createdAt: now }] }
      }))
    },
    markContentPublishFailed: (id, reason) =>
      setContentItems((prev) => {
        const item = prev.find((c) => c.id === id)
        if (item) {
          addEvelynTask(`Retry ${item.type} publishing ��� ${clientNameById(item.clientId)}`, clientNameById(item.clientId), `Meta publishing failed. Reschedule from the client calendar.${reason ? ` ${reason}` : ''}`)
          log(item.clientId, 'content', `Publishing failed on Meta for ${item.type}; employee and manager alerted; rescheduling required${reason ? `: ${reason}` : ''}`, `הפרסום ב-Meta נכשל עבור ${item.type}; העובדת והמנהל קיבלו התראה; נדרש תזמון מחדש${reason ? `: ${reason}` : ''}`)
        }
        return prev.map((c) => (c.id === id ? { ...c, stage: 'needs_fix', comment: reason || 'Publishing failed on Meta' } : c))
      }),
  scheduleContent: (id, date, time) => {
  if (role !== 'employee') return
  setContentItems((prev) => prev.map((c) => {
    if (c.id !== id || c.stage !== 'approved') return c
    const now = new Date().toISOString()
    return { ...c, stage: 'scheduled', scheduledDate: date, time, comment: undefined, approvalHistory: [...(c.approvalHistory ?? []), { id: nextId('ah'), from: c.stage, to: 'scheduled', actorId: currentUserId ?? undefined, actorName: actorName(), actorRole: 'employee', createdAt: now }] }
  }))
  },
  publishContent: (id) => {
    if (role !== 'employee') return
    setContentItems((prev) => prev.map((c) => {
      if (c.id !== id || c.stage !== 'scheduled') return c
      const now = new Date().toISOString()
      return { ...c, stage: 'published', approvalHistory: [...(c.approvalHistory ?? []), { id: nextId('ah'), from: c.stage, to: 'published', actorId: currentUserId ?? undefined, actorName: actorName(), actorRole: 'employee', createdAt: now }] }
    }))
  },
    clientRequestEdit: (id, comment, markers) => {
      const note = comment.trim()
      if (role !== 'client' || !note) return
      setContentItems((prev) => prev.map((c) => {
        if (c.id !== id || c.stage !== 'client_review') return c
        const markerNote = markers?.length ? ` (${markers.length} marked spots)` : ''
        addEvelynTask(`תיקון ${c.type} — ${clientNameById(c.clientId)}`, clientNameById(c.clientId), `הלקוח ביקש תיקונים${markerNote}: ${note}`, assignedEmployeeForClient(c.clientId))
        const now = new Date().toISOString()
        return { ...c, stage: 'needs_fix', comment: note, markers, editSource: 'client', approvalHistory: [...(c.approvalHistory ?? []), { id: nextId('ah'), from: c.stage, to: 'needs_fix', actorId: currentUserId ?? undefined, actorName: actorName(), actorRole: 'client', note, createdAt: now }] }
      }))
    },
    // Employee applies corrections and marks resolved. CEO-requested edits go back to the manager
    // for re-approval first; client-requested edits go straight back to the client review queue.
    addContentComment: (id, text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const authorRole = role === 'ceo' ? 'manager' : role === 'client' ? 'client' : 'employee'
      const author = role === 'ceo' ? 'Manager' : role === 'client' ? 'Client' : 'Team member'
      setContentItems((prev) => prev.map((item) => item.id === id ? { ...item, comments: [...(item.comments ?? []), { id: nextId('cc'), author, authorRole, text: trimmed, createdAt: new Date().toISOString() }] } : item))
    },
    resolveEdit: (id, fix) => {
      if (role !== 'employee') return
      setContentItems((prev) => {
        const item = prev.find((c) => c.id === id)
        const backToCeo = item?.editSource === 'ceo'
        if (item) {
          closeWorkflowTasks(item.clientId, item.type)
          if (backToCeo) {
            log(item.clientId, 'content', `Applied edits to ${item.type}, resubmitted for manager review`, `תיקן/ה את ${item.type} ושלח/ה מחדש לבדיקת מנהלת`)
          } else {
            log(item.clientId, 'content', `Applied edits to ${item.type}, resubmitted to client`, `תיקן/ה את ${item.type} ושלח/ה מחדש ללקוח`)
          }
        }
        return prev.map((c) =>
          c.id === id
            ? {
                ...c,
                // Apply the re-uploaded fix (new media / link / caption) if provided
                ...(fix?.mediaUrl !== undefined ? { mediaUrl: fix.mediaUrl, mediaKind: fix.mediaKind } : {}),
                ...(fix?.caption !== undefined ? { caption: fix.caption } : {}),
                stage: backToCeo ? 'manager_review' : 'client_review',
                comment: undefined,
                markers: undefined,
                editSource: undefined,
              }
            : c,
        )
      })
    },

    paidCampaigns,
    // New campaign — saved as a draft (fill later) or submitted straight to manager review
    addPaidCampaign: (c, status) => {
      const id = nextId('pc')
      setPaidCampaigns((prev) => [{ ...c, id, status }, ...prev])
      if (status === 'ceo') {
        addEvelynTask(
          `Review paid campaign — ${clientNameById(c.clientId)}`,
          clientNameById(c.clientId),
          `"${c.title}" is ready for your review in the Approval Center. Approve to send to the client or send it back with notes.`,
          'Maya',
        )
        log(c.clientId, 'campaign', 'Submitted paid campaign for manager review', 'שלח/ה קמפיין ממומן לבדיקת מנהלת')
      }
    },
    campaignReports,
    createCampaignReport: (report) => {
      const nextDueDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
      const next = { ...report, id: nextId('report'), createdDate: todayISO(), nextDueDate, recipientEmails: report.recipientEmails ?? [], status: 'internalReview' as const }
      setCampaignReports((prev) => [next, ...prev])
      addEvelynTask(`Review campaign report — ${clientNameById(report.clientId)}`, clientNameById(report.clientId), `Edit the report, remove weak findings, keep the useful data, and approve it before it becomes visible to the client.`, 'Maya')
      log(report.clientId, 'campaign', 'Created campaign completion report for internal review', 'נוצר דוח סיום קמפיין לבדיקה פנימית')
    },
    updateCampaignReport: (id, patch) => setCampaignReports((prev) => prev.map((report) => report.id === id ? { ...report, ...patch, editedBy: actorName() } : report)),
    reviewCampaignReport: (id, status) => {
      const report = campaignReports.find((item) => item.id === id)
      if (!report) return
      setCampaignReports((prev) => prev.map((item) => item.id === id ? { ...item, status, editedBy: actorName() } : item))
      if (status === 'approved') addEvelynTask(`Send approved campaign report — ${clientNameById(report.clientId)}`, clientNameById(report.clientId), `The report is approved. Send it to the client from the campaign completion area.`)
      if (status === 'clientVisible') log(report.clientId, 'campaign', 'Published approved campaign report to client', 'דוח קמפיין מאושר הוצג ללקוח')
    },
    // Continue editing a draft in installments
    updatePaidCampaign: (id, patch) =>
      setPaidCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    // Promote a completed draft to manager review + create the manager task
    submitPaidCampaign: (id) =>
      setPaidCampaigns((prev) => {
        const camp = prev.find((c) => c.id === id)
        if (camp) {
          addEvelynTask(
            `Review paid campaign — ${clientNameById(camp.clientId)}`,
            clientNameById(camp.clientId),
            `"${camp.title}" is ready for your review in the Approval Center. Approve to send to the client or send it back with notes.`,
            'Maya',
          )
          log(camp.clientId, 'campaign', 'Submitted paid campaign for manager review', 'שלח/ה קמפיין ממומן לבדיקת מנהלת')
        }
        return prev.map((c) => (c.id === id ? { ...c, status: 'ceo', comment: undefined } : c))
      }),
    advancePaidCampaign: (id, status, comment) =>
      setPaidCampaigns((prev) => {
        const camp = prev.find((c) => c.id === id)
        if (camp) {
          if (status === 'active') {
            addEvelynTask(
              `Launch paid campaign — ${clientNameById(camp.clientId)}`,
              clientNameById(camp.clientId),
              `Set up "${camp.title}" in Meta Ads Manager. Objective, targeting, budget and creative are defined in the Paid Campaigns tab.`,
            )
            log(camp.clientId, 'campaign', 'Approved & launched paid campaign', 'אישר/ה והשיק/ה קמפיין ��מומן')
          } else if (status === 'client') {
            log(camp.clientId, 'campaign', 'Approved paid campaign & sent to client', 'אישר/ה קמפיין ממומן ושלח/ה ללקוח')
          }
        }
        return prev.map((c) => (c.id === id ? { ...c, status, comment: comment?.trim() || undefined } : c))
      }),
    // Manager or client rejects — bounces back to the assigned employee as a draft with a note + task
    sendBackPaidCampaign: (id, comment) =>
      setPaidCampaigns((prev) => {
        const camp = prev.find((c) => c.id === id)
        if (camp) {
          addEvelynTask(
            `Revise paid campaign — ${clientNameById(camp.clientId)}`,
            clientNameById(camp.clientId),
            `Changes requested on "${camp.title}". Notes: ${comment.trim() || '—'}`,
          )
          log(camp.clientId, 'campaign', `Requested changes on paid campaign`, `ביקש/ה תיקונים בקמפיין ממומן`)
        }
        return prev.map((c) => (c.id === id ? { ...c, status: 'draft', comment: comment.trim() || undefined } : c))
      }),

    operativeTasks,
    addOperativeTask: (clientId, title, description) => {
      setOperativeTasks((prev) => [
        ...prev,
        { id: nextId('ot'), clientId, title, description: description?.trim() || undefined, done: false },
      ])
      log(clientId, 'system', `Assigned operative task: ${title}`, `שלח/ה משימה תפעולית: ${title}`)
    },
    toggleOperativeTask: (id) =>
      setOperativeTasks((prev) =>
        prev.map((o) => (o.id === id ? { ...o, done: !o.done } : o)),
      ),

    activityLogs,

    employees,
    // The logged-in employee maps to Evelyn; the manager (Maya) manages the roster.
    currentEmployeeId: role === 'employee' ? currentUserId : role === 'ceo' ? currentUserId : null,
    currentClientId: role === 'client' ? (profileClientId ?? clientFolders[0]?.id ?? null) : null,
    addEmployee: async (e) => {
      const managed = await createManagedUser({ email: e.email, password: e.password ?? '', displayName: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim(), role: 'employee' })
      setEmployees((prev) => [
        ...prev,
        {
          ...e,
          id: managed.id,
          name: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || 'New Employee',
          status: 'active',
          since: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          assignedClients: 0,
          openTasks: 0,
          permissions: e.permissions ?? { allClients: false, clientIds: [], folderTabs: [], canSeeContracts: false, leadsAccess: 'add' },
        },
      ])
    },
    updateEmployeePermissions: (id, permissions) =>
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, permissions } : emp))),
    setEmployeeStatus: (id, status) => setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, status } : emp))),
    deleteEmployee: (id) => setEmployees((prev) => prev.filter((emp) => emp.id !== id)),
    addEmployeeAttachment: (id, att) =>
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id
            ? { ...emp, attachments: [...(emp.attachments ?? []), { id: nextId('att'), name: att.name, url: att.url }] }
            : emp,
        ),
      ),

    workJournal,
    addWorkJournalEntry: (entry) =>
      setWorkJournal((prev) => [{ ...entry, id: nextId('wj') }, ...prev]),
    deleteWorkJournalEntry: (id) => { if (role !== 'ceo') return; setWorkJournal((prev) => prev.filter((w) => w.id !== id)) },

    finances,
    addFinanceEntry: (entry) => setFinances((prev) => [{ ...entry, id: nextId('fin') }, ...prev]),

    chatThreads,
    sendChatMessage: (threadId, text, attachment) => {
      const trimmed = text.trim()
      if (!trimmed && !attachment) return
      // Sender identity follows the logged-in role
      const meEmpId = role === 'employee' ? 'emp2' : role === 'ceo' ? 'emp1' : null
      const meId = role === 'ceo' ? 'ceo' : role === 'employee' ? meEmpId ?? 'emp2' : 'client'
      const meName =
        role === 'ceo'
          ? 'Maya Ben-David'
          : role === 'employee'
            ? employees.find((e) => e.id === meEmpId)?.name ?? 'Team Member'
            : clientNameById(profileClientId ?? clientFolders[0]?.id ?? '')
      setChatThreads((prev) =>
        prev.map((th) =>
          th.id === threadId
            ? {
                ...th,
                messages: [
                  ...th.messages,
                  {
                    id: nextId('cm'),
                    senderId: meId,
                    senderName: meName,
                    text: trimmed,
                    timestamp: nowISO(),
                    attachment,
                  },
                ],
              }
            : th,
        ),
      )
    },

    tasks,
    addTask: (task) =>
      setTasks((prev) => [
        { ...task, id: nextId('t'), createdDate: todayISO(), done: false },
        ...prev,
      ]),
    toggleTask: (id) =>
      setTasks((prev) => prev.map((tk) => (tk.id === id ? { ...tk, done: !tk.done } : tk))),
    deleteTask: (id) => { if (role !== 'ceo') return; setTasks((prev) => prev.filter((tk) => tk.id !== id)) },

    calendarEvents,
    planEntries,
    updatePlanEntry: (key, patch) => setPlanEntries((prev) => ({ ...prev, [key]: { ...{ picked: false, note: '' }, ...prev[key], ...patch, ...(patch.decision ? { decidedBy: role === 'ceo' ? 'Maya' : role === 'client' ? 'Client' : 'Employee', decidedAt: nowISO() } : {}) } })),
    sendPlanEntries: (keys) => setPlanEntries((prev) => Object.fromEntries(Object.entries(prev).map(([key, entry]) => keys.includes(key) && entry.picked && !entry.sentAt ? [key, { ...entry, sentAt: nowISO() }] : [key, entry]))),
    addCalendarEvent: (clientId, title, date, description) => {
      const id = nextId('ce')
      setCalendarEvents((prev) => [...prev, { id, clientId, date, layer: 'international', title, titleHe: title, description, descriptionHe: description }])
      return id
    },
    setCalendarEventStatus: (id, status) =>
      setCalendarEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: e.status === status ? undefined : status } : e)),
      ),
    setCalendarEventIdea: (id, idea, clientId) => {
      setCalendarEvents((prev) => prev.map((e) => (e.id === id ? { ...e, idea } : e)))
      // Link the idea to the existing client group chat
      const trimmed = idea.trim()
      if (trimmed && clientId) {
        setChatThreads((prev) =>
          prev.map((th) =>
            th.clientId === clientId
              ? {
                  ...th,
                  messages: [
                    ...th.messages,
                    {
                      id: nextId('cm'),
                      senderId: role === 'ceo' ? 'ceo' : role ?? 'system',
                      senderName: role === 'ceo' ? 'Maya Ben-David' : role === 'client' ? 'Client' : 'Team',
                      text: `Idea: ${trimmed}`,
                      timestamp: nowISO(),
                    },
                  ],
                }
              : th,
          ),
        )
      }
    },
    setCalendarEventFinalNote: (id, note) =>
      setCalendarEvents((prev) => prev.map((e) => (e.id === id ? { ...e, finalNote: note } : e))),
    updatePlanningDate: (id, patch) => setCalendarEvents((prev) => prev.map((e) => e.id === id ? { ...e, ...patch, planningDecidedBy: role === 'client' ? 'Client' : role === 'ceo' ? 'Manager' : 'Employee', planningDecidedAt: nowISO() } : e)),
    sendPlanningDates: (ids) => setCalendarEvents((prev) => prev.map((e) => ids.includes(e.id) ? { ...e, planningSentToClient: true } : e)),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
