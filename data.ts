// Shared domain types + realistic mock data for M.A.B Marketing OS

export type Role = 'ceo' | 'employee' | 'client'

// Team members
export type Assignee = 'Maya' | 'Evelyn' | 'New Employee'
export const ASSIGNEES: Assignee[] = ['Maya', 'Evelyn', 'New Employee']

// ---------------- Leads ----------------
export type LeadSource = 'friendReferral' | 'recommendation' | 'facebookGroups' | 'media'
export type CallOutcome = 'answered' | 'noAnswer' | 'notInterested' | null
export type LeadStatusTag = 'hot' | 'deliberating' | 'meeting' | null

export interface Lead {
  id: string
  firstName: string
  lastName: string
  organization: string
  phone: string
  email?: string
  address: string
  instagram: string
  website: string
  facebook: string
  source: LeadSource
  referralName?: string
  callOutcome: CallOutcome
  statusTag: LeadStatusTag
  notes: string
  followUpDate?: string // ISO date
  meetingDate?: string
  meetingTime?: string
  meetingLocation?: string // where the meeting takes place
  meetingLink?: string
  callDate?: string // scheduled call-back at requested date/time
  callTime?: string
  callNote?: string
  meetingNote?: string
  archived: boolean
  assignedEmployeeId?: string // employee responsible for follow-up and meetings
  assignedEmployeeName?: Assignee
  
  createdDate: string
}

// ---------------- Tasks ----------------
export type Urgency = 'urgentToday' | 'urgentWeek' | 'duringMonth'

// Content attached to a task: a file (pdf/image/video) or an external link
export type TaskAttachmentKind = 'pdf' | 'image' | 'video' | 'link'

export interface TaskAttachment {
  id: string
  kind: TaskAttachmentKind
  name: string
  url?: string // for links
}

export interface Task {
  id: string
  title: string
  description: string
  assignee: Assignee
  urgency: Urgency
  client: string
  createdDate: string // ISO date
  done: boolean
  attachments?: TaskAttachment[]
}

// ---------------- Packages ----------------
export type PackageId = 'basic' | 'gold' | 'platinum'
export type ClientServiceType = 'website' | 'socialMedia' | 'google' | 'ads'

export interface ServicePackage {
  id: PackageId
  nameKey: 'pkg_basic' | 'pkg_gold' | 'pkg_platinum'
  price: number
  deliverables: string[]
  deliverablesHe: string[]
}

// ---------------- Client folders ----------------
export type InvoiceStatus = 'paid' | 'pending' | 'overdue'

export interface Credential {
  id: string
  platform: string
  username: string
  password: string
}

// Media is organized into monthly folders, split by who owns it
export type MediaCategory = 'photoshoot' | 'clientProvided' | 'brandAssets'

export interface MediaAsset {
  id: string
  clientId: string
  category: MediaCategory
  monthKey: string // 'YYYY-MM'
  name: string
  kind: 'image' | 'video'
  date: string
  uploadedBy: string
  url?: string // data URL for uploaded files — enables inline preview + download
}

export type ContentType = 'REEL' | 'POST' | 'STORY'
export type ContentPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'TikTok' | 'YouTube'
export const ALL_PLATFORMS: ContentPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube']
export const DEFAULT_PLATFORMS: ContentPlatform[] = ['Instagram', 'Facebook']

// Optimal posting windows (Miami audience peaks) per platform
export const OPTIMAL_TIMES: Record<ContentPlatform, string[]> = {
  Instagram: ['11:00', '13:00', '19:00'],
  Facebook: ['09:00', '13:00', '15:00'],
  LinkedIn: ['08:00', '12:00', '17:00'],
  TikTok: ['12:00', '18:00', '21:00'],
  YouTube: ['15:00', '18:00', '20:00'],
}

// Visual feedback pin dropped on a creative during client review
export interface Marker {
  id: string
  x: number
  y: number
  note: string
  slideIndex?: number
}

// Approval workflow: draft -> manager_review -> client_review -> approved -> scheduled -> published.
export type ContentStage = 'draft' | 'manager_review' | 'client_review' | 'approved' | 'scheduled' | 'published' | 'needs_fix'

export interface ApprovalHistoryEntry {
  id: string
  from: ContentStage
  to: ContentStage
  actorId?: string
  actorName: string
  actorRole: 'ceo' | 'employee' | 'client'
  note?: string
  createdAt: string
}

export interface ContentComment {
  id: string
  author: string
  authorRole: 'manager' | 'employee' | 'client'
  text: string
  createdAt: string
}

export interface ContentMedia {
  id: string
  url: string
  kind: 'image' | 'video'
  label?: string
}

export interface ContentItem {
  id: string
  clientId: string
  type: ContentType
  platform: ContentPlatform
  caption: string
  mediaUrl?: string // image or video to review in the Approval Center
  mediaKind?: 'image' | 'video'
  mediaItems?: ContentMedia[]
  scheduledDate?: string
  time?: string
  stage: ContentStage
  comment?: string
  comments?: ContentComment[]
  hashtagSetId?: string
  collabAccounts?: string[]
  markers?: Marker[]
  createdBy: string
  editSource?: 'ceo' | 'client' // who requested the current edit — controls where a resubmit returns
  assignedEmployeeId?: string
  approvalHistory?: ApprovalHistoryEntry[]
  lastApprovedBy?: string
  lastApprovedAt?: string
}

export type PaidCampaignStatus = 'draft' | 'ceo' | 'client' | 'active'
export type CampaignObjective = 'leadGen' | 'traffic' | 'engagement' | 'messages' | 'calls'
export const CAMPAIGN_OBJECTIVES: CampaignObjective[] = ['leadGen', 'traffic', 'engagement', 'messages', 'calls']
export type BudgetType = 'daily' | 'lifetime'

// Agency commission added on top of the client's media spend — transparent to everyone.
export const CAMPAIGN_COMMISSION_RATE = 0.2

export interface CampaignReport {
  id: string
  campaignId: string
  clientId: string
  title: string
  highlights: string
  metrics: string
  recommendations: string
  status: 'draft' | 'internalReview' | 'approved' | 'clientVisible'
  editedBy?: string
  createdDate: string
  periodStart?: string
  periodEnd?: string
  nextDueDate?: string
  recipientEmails?: string[]
}

export interface PaidCampaign {
  id: string
  clientId: string
  title: string
  objective: CampaignObjective
  audience: string
  ageRange: string
  locations: string // zip codes, cities, regions
  budgetType: BudgetType
  budget: number
  startDate: string
  endDate: string
  creativeName: string
  primaryText: string
  headline: string
  status: PaidCampaignStatus
  comment?: string // latest review note (manager or client) shown to the employee on send-back
}

export interface OperativeTask {
  id: string
  clientId: string
  title: string
  description?: string // explanation shown to the client
  done: boolean
}

// ---------------- Activity logs (audit trail) ----------------
export type ActivityCategory = 'content' | 'media' | 'campaign' | 'credential' | 'system'

export interface ActivityLog {
  id: string
  clientId: string
  category: ActivityCategory
  actor: string // user identity
  action: string // human-readable action, English
  actionHe: string
  timestamp: string // ISO datetime
}

export type NotifyChannel = 'sms' | 'email' | 'whatsapp' | 'push'
export const NOTIFY_CHANNELS: NotifyChannel[] = ['sms', 'email', 'whatsapp', 'push']

// ---------------- Calendar ----------------
export type CalendarLayer = 'jewish' | 'christian' | 'usLocal' | 'international' | 'events'
export const CALENDAR_LAYERS: CalendarLayer[] = ['jewish', 'christian', 'usLocal', 'international', 'events']
export const CLIENT_CATEGORIES = ['restaurant', 'italian', 'pizza', 'sushi', 'coffee', 'bakery', 'wine', 'realEstate', 'beauty', 'fashion', 'health', 'fitness', 'pets', 'kids', 'art', 'music', 'sports', 'tech', 'retail', 'travel'] as const
export type ClientCategory = (typeof CLIENT_CATEGORIES)[number]
export interface KeyDate { id: string; key: string; date: string; endDate?: string; title: string; titleHe: string; emoji: string; layer: CalendarLayer; categories: (ClientCategory | 'general')[] }
const kd = (id: string, date: string, title: string, titleHe: string, emoji: string, layer: CalendarLayer, categories: (ClientCategory | 'general')[], endDate?: string): KeyDate => ({ id, key: id, date, endDate, title, titleHe, emoji, layer, categories })
export const KEY_DATES: KeyDate[] = [
  kd('hanukkah', '2026-12-04', 'Hanukkah begins at sunset', 'תחילת חנוכה בשקיעה', '🕎', 'jewish', ['general']), kd('tu-bishvat', '2027-01-23', 'Tu BiShvat', 'ט״ו בשבט', '🌳', 'jewish', ['general']), kd('purim', '2027-03-23', 'Purim', 'פורים', '🎭', 'jewish', ['general']), kd('passover', '2027-04-21', 'Passover begins at sunset', 'תחילת פסח בשקיעה', '🍷', 'jewish', ['general']), kd('shavuot', '2027-06-10', 'Shavuot begins at sunset', 'תחילת שבועות בשקיעה', '🌾', 'jewish', ['general']),
  kd('christmas-eve', '2026-12-24', 'Christmas Eve', 'ערב חג המולד', '🎄', 'christian', ['general']), kd('christmas', '2026-12-25', 'Christmas', 'חג המולד', '🎄', 'christian', ['general']), kd('easter', '2027-03-28', 'Easter', 'פסחא', '🐣', 'christian', ['general']),
  ...([['halloween','2026-10-31','Halloween','ליל כל הקדושים'],['veterans-day','2026-11-11','Veterans Day','יום ותיקי המלחמה'],['thanksgiving','2026-11-26','Thanksgiving','חג ההודיה'],['black-friday','2026-11-27','Black Friday','בלאק פריידי'],['small-business-saturday','2026-11-28','Small Business Saturday','שבת העסקים הקטנים'],['cyber-monday','2026-11-30','Cyber Monday','סייבר מאנדיי'],['giving-tuesday','2026-12-01','Giving Tuesday','יום הנתינה'],['new-years-eve','2026-12-31',"New Year's Eve",'ערב השנה החדשה'],['new-year','2027-01-01','New Year','ראש השנה האזרחית'],['mlk','2027-01-18','MLK Day','יום מרטין לותר קינג'],['valentines','2027-02-14',"Valentine's Day",'יום האהבה'],['st-patricks','2027-03-17',"St. Patrick's Day",'יום סנט פטריק'],['mothers-day','2027-05-09',"Mother's Day",'יום האם'],['memorial-day','2027-05-31','Memorial Day','יום הזיכרון'],['fathers-day','2027-06-20',"Father's Day",'יום האב']].map(([id,date,title,titleHe]) => kd(id, date, title, titleHe, '🇺🇸', 'usLocal', ['general']))),
  kd('world-pasta','2026-10-25','World Pasta Day','יום הפסטה העולמי','🍝','international',['italian']), kd('cat-day','2026-10-29','National Cat Day','יום החתול','🐈','international',['pets']), kd('cappuccino','2026-11-08','Cappuccino Day','יום הקפוצ׳ינו','☕','international',['coffee']), kd('kindness','2026-11-13','World Kindness Day','יום הטוב העולמי','���','international',['general']), kd('beaujolais','2026-11-19','Beaujolais Nouveau','בוז׳ולה נובו','🍷','international',['wine']), kd('espresso','2026-11-23','Espresso Day','יום האספרסו','☕','international',['coffee']), kd('cookie','2026-12-04','Cookie Day','יום העוגיות','🍪','international',['bakery']), kd('pizza-jan','2027-01-17','International Pizza Day','יום הפיצה הבינלאומי','🍕','international',['pizza']), kd('pizza-feb','2027-02-09','National Pizza Day','יום הפיצה הלאומי','🍕','international',['pizza']), kd('womens','2027-03-08',"Women's Day",'יום האישה','♀','international',['general']), kd('art','2027-04-15','World Art Day','יום האמנות העולמי','🎨','international',['art']), kd('earth','2027-04-22','Earth Day','יום כדור הארץ','🌍','international',['general']), kd('wine','2027-05-25','National Wine Day','יום היין','🍷','international',['wine']), kd('sushi','2027-06-18','Sushi Day','יום הסושי','🍣','international',['sushi']), kd('yoga','2027-06-21','Yoga Day','יום היוגה','🧘','international',['fitness']),
  kd('miami-book-fair','2026-11-15','Miami Book Fair','יריד הספרים של מיאמי','📚','events',['art','travel'],'2026-11-22'), kd('miami-art-week','2026-11-30','Miami Art Week','שבוע האמנות של מיאמי','🎨','events',['art','fashion'],'2026-12-06'), kd('art-basel','2026-12-02','Art Basel Miami Beach','ארט באזל מיאמי ביץ׳','🎨','events',['art','fashion','travel'],'2026-12-06'), kd('super-bowl','2027-02-14','Super Bowl LXI','סופרבול LXI','🏈','events',['sports']), kd('miami-music-week','2027-03-22','Miami Music Week','שבוע המוזיקה של מיאמי','🎵','events',['music','travel'],'2027-03-28'), kd('ultra','2027-03-26','Ultra Miami','אולטרה מיאמי','🎵','events',['music','travel'],'2027-03-28'), kd('f1-miami','2027-05-09','F1 Miami Grand Prix','גרנד פרי מיאמי F1','🏎️','events',['sports','travel'])
]
export type CalendarLayerSettings = Record<CalendarLayer, boolean>

export type ClientProjectType = 'socialMedia' | 'google' | 'campaigns' | 'website' | 'custom'

export interface ClientProject {
  id: string
  name: string
  type: ClientProjectType
  notes: string
  tasks: string[]
  employeeIds: string[]
  folders: string[]
}

export interface ClientFolder {
  id: string
  name: string
  businessType: string
  businessTypeHe: string
  logo: string | null
  packageId: PackageId
  serviceType?: ClientServiceType
  customPrice?: number
  since: string
  sinceMonth: string // 'YYYY-MM' onboarding month, seeds monthly folders
  contractStartDate?: string // manager-entered contract start date, YYYY-MM-DD
  publishingStartDate?: string // manager-entered publishing start date, YYYY-MM-DD
  strategyIdeas?: string
  contactEmail: string
  businessAddress?: string
  businessPhone?: string
  importantEmails?: string[]
  platforms: ContentPlatform[]
  calendarLayers: CalendarLayerSettings
  showEvents: boolean
  categories: ClientCategory[]
  notifyChannels: NotifyChannel[]
  invoiceStatus: InvoiceStatus
  contractFileName: string | null
  contractAppendices?: string[] // additional relevant files attached to the contract
  invoiceFiles?: string[] // uploaded invoice documents
  credentials: Credential[]
  active: boolean // active vs inactive (archived) client — inactive is CEO-only
  hashtagSets?: { id: string; name: string; tags: string[] }[]
  collabAccounts?: string[]
  metaPageId?: string
  metaPageName?: string
  metaInstagramId?: string
  metaInstagramUsername?: string
  canvaLinks?: CanvaLink[]
  projects?: ClientProject[]
  inboxMessages?: ClientInboxMessage[]
}

export interface CanvaLink {
  id: string
  month: string
  type: 'story' | 'post' | 'reel'
  note: string
  url: string
  approved: boolean
  createdAt: string
}

export interface ClientInboxMessage {
  id: string
  platform: 'Instagram' | 'Facebook'
  channel: 'comment' | 'private'
  sender: string
  text: string
  timestamp: string
  assignedTo?: string
  handled: boolean
  reply?: string
}

// ---------------- Employees ----------------
export type EmployeeStatus = 'active' | 'onLeave'
export type EmployeeRateType = 'hourly' | 'monthly' | 'project'
export const EMPLOYEE_RATE_TYPES: EmployeeRateType[] = ['hourly', 'monthly', 'project']

export interface EmployeeAttachment {
  id: string
  name: string
  url?: string // contract or other document (data URL)
}

// Per-employee access control, managed by the manager. Defaults to nothing until granted.
export interface EmployeePermissions {
  allClients: boolean // when true, sees every client folder
  clientIds: string[] // specific client folders the employee may open
  folderTabs: string[] // specific folder tabs the employee may see (see Tab keys)
  canSeeContracts: boolean // contract & pricing tab — only when the role requires it
  leadsAccess?: 'add' | 'full' // 'add' can only add leads; 'full' can manage them. Only the manager can delete.
}

export interface Employee {
  id: string
  name: string
  firstName?: string
  lastName?: string
  role: string
  roleHe: string
  roleDescription?: string // typed manually by the manager
  email: string
  phone: string
  address?: string
  rateType?: EmployeeRateType
  rateAmount?: number
  recruitedFrom?: string // where the employee was recruited from
  startDate?: string
  status: EmployeeStatus
  since: string
  assignedClients: number
  openTasks: number
  attachments?: EmployeeAttachment[] // contracts and other documents
  permissions?: EmployeePermissions
  username?: string // portal login generated on creation
  password?: string
}

// ---------------- Work journal (shared attendance log) ----------------
export type WorkJournalType = 'workHours' | 'vacation' | 'sick' | 'dayOff'
export const WORK_JOURNAL_TYPES: WorkJournalType[] = ['workHours', 'vacation', 'sick', 'dayOff']

export interface WorkJournalEntry {
  id: string
  employeeId: string
  type: WorkJournalType
  date: string
  hours?: number // for workHours entries
  note?: string
}

// ---------------- Finances (revenue & expenses) ----------------
export type FinanceType = 'revenue' | 'expense'

export interface FinanceEntry {
  id: string
  type: FinanceType
  label: string
  labelHe: string
  amount: number // USD
  category: string
  categoryHe: string
  date: string // ISO date
  attachmentName?: string // optional invoice / receipt file name
  attachmentUrl?: string // optional invoice / receipt file (data URL)
}

// ---------------- Team Chat ----------------
// Group threads = CEO + the relevant employee for a given client.
// Direct threads = CEO + a single employee.
export type ChatThreadKind = 'group' | 'direct' | 'peer'

export interface ChatMessage {
  id: string
  senderId: string // 'ceo' | 'client' | employee id
  senderName: string
  text: string
  timestamp: string // ISO
  attachment?: { kind: 'image' | 'video' | 'link'; url: string; name?: string }
}

export interface ChatThread {
  id: string
  kind: ChatThreadKind
  clientId?: string // set for group threads (client + employee + manager)
  employeeId: string // relevant employee (group) / the employee (direct with manager) / one side (peer)
  peerEmployeeId?: string // the other employee in a peer (employee ↔ employee) thread
  messages: ChatMessage[]
}

export interface PlanEntry {
  picked: boolean
  sentAt?: string
  decision?: 'do' | 'dont'
  note: string
  ideaTitle?: string
  ideaCategory?: string
  createdBy?: string
  createdAt?: string
  decidedBy?: string
  decidedAt?: string
  hiddenNextYear?: boolean
}

export interface CalendarEvent {
  id: string
  date: string // ISO date
  layer: CalendarLayer
  title: string
  titleHe: string
  description?: string // short explanation shown in the calendar info bubble
  descriptionHe?: string
  doNotPost?: boolean
  time?: string
  // Granular Miami-time hourly lock window on this date:
  // lockFrom set => posting blocked from this time onward (earlier in day is OK)
  // lockUntil set => posting blocked until this time (rest of day is OK)
  lockFrom?: string // 'HH:MM'
  lockUntil?: string // 'HH:MM'
  clientId?: string // set for a client-specific "important date"
  status?: 'approved' | 'rejected' // sidebar approval state
  idea?: string // idea / note captured for this event
  finalNote?: string // manager/employee final approval note
  planningStatus?: 'do' | 'dont' | 'waiting'
  planningNote?: string
  planningSentToClient?: boolean
  planningDecidedBy?: string
  planningDecidedAt?: string
}

// ================= Mock data =================

export const packages: ServicePackage[] = [
  {
    id: 'basic',
    nameKey: 'pkg_basic',
    price: 1200,
    deliverables: [
      '8 Feed Posts per month',
      '4 Reels per month',
      '7 Stories per week',
      'Full social media account management',
      'Content strategy & monthly performance report',
      'Caption writing & hashtag research',
      'Community management (comments & DMs)',
      'Profile setup, visual branding & IG Highlights',
      'Facebook & Instagram integration',
      'Photography not included',
    ],
    deliverablesHe: [
      '8 פוסטים בפיד בחודש',
      '4 רילסים בחודש',
      '7 סטוריז בשבוע',
      'ניהול מלא של חשבונות המדיה',
      'אסטרטגיית תוכן ודוח ביצועים חודשי',
      'כתיבת כיתובים ומחקר האשטגים',
      'ניהול קהילה (תגובות והודעות)',
      'הקמת פרופיל, מיתוג ויז׳ואלי והיילייטס',
      'אינטגרציית פייסבוק ואינסטגרם',
      'צילום אינו כלול',
    ],
  },
  {
    id: 'gold',
    nameKey: 'pkg_gold',
    price: 1700,
    deliverables: [
      '6 Feed Posts per month',
      '6 Reels per month',
      '10 Stories per week',
      '1 monthly photoshoot (up to 4 hours included)',
      'Full social media account management',
      'Content strategy & monthly performance report',
      'Caption writing & hashtag research',
      'Community management (comments & DMs)',
      'Profile setup, visual branding & IG Highlights',
      'Facebook & Instagram integration',
    ],
    deliverablesHe: [
      '6 פוסטים בפיד בחודש',
      '6 רילסים בחודש',
      '10 סטוריז בשבוע',
      'צילום חודשי אחד (עד 4 שעות כלול)',
      'ניהול מלא של חשבונות המדיה',
      'אסטרטגיית תוכן ודוח ביצועים חודשי',
      'כתיבת כיתובים ומחקר האשטגים',
      'ניהול קהילה (תגובות והודעות)',
      'הקמת פרופיל, מיתוג ויז׳ואלי והיילייטס',
      'אינטגרציית פייסבוק ואינסטגרם',
    ],
  },
  {
    id: 'platinum',
    nameKey: 'pkg_platinum',
    price: 6500,
    deliverables: [
      '8 Feed Posts per month',
      '8 Reels per month',
      '14 Stories per week',
      '1 monthly professional content production day',
      'Up to 3 models & location included',
      'Advanced content strategy & monthly report',
      'Caption writing & hashtag research',
      'Community management (comments & DMs)',
      'Profile setup, visual branding & IG Highlights',
      'Facebook & Instagram integration',
    ],
    deliverablesHe: [
      '8 פוסטים בפיד בחודש',
      '8 רילסים בחודש',
      '14 סטוריז בשבוע',
      'יום הפקת תוכן מקצועי אחד בחודש',
      'עד 3 דוגמנים ולוקיישן כלולים',
      'אסטרטגיית תוכן מתקדמת ודוח חודשי',
      'כתיבת כיתובים ומחקר האשטגים',
      'ניהול קהילה (תגובות והודעות)',
      'הקמת פרופיל, מיתוג ויז׳ואלי והיילייטס',
      'אינטגרציית פייסבוק ואינסטגרם',
    ],
  },
]

export function getPackage(id: PackageId): ServicePackage {
  return packages.find((p) => p.id === id) ?? packages[0]
}

export function getPackageMonthlyQuota(id: PackageId) {
  const pkg = getPackage(id)
  const posts = Number(pkg.deliverables.find((item) => /Feed Posts per month/i.test(item))?.match(/\d+/)?.[0] ?? 0)
  const reels = Number(pkg.deliverables.find((item) => /Reels per month/i.test(item))?.match(/\d+/)?.[0] ?? 0)
  return { posts, reels, total: posts + reels }
}

export const initialLeads: Lead[] = [
  {
    id: 'l1',
    firstName: 'Sarah',
    lastName: 'Cohen',
    organization: 'Bella Boutique',
    phone: '305-555-0142',
    address: '120 Collins Ave, Miami Beach FL',
    instagram: '@bella.boutique',
    website: 'bellaboutique.com',
    facebook: 'Bella Boutique Miami',
    source: 'facebookGroups',
    callOutcome: null,
    statusTag: null,
    notes: '',
    archived: false,
    createdDate: '2026-08-09',
  },
  {
    id: 'l2',
    firstName: 'David',
    lastName: 'Levi',
    organization: 'Ocean Drive Dental',
    phone: '305-555-0177',
    address: '890 Ocean Dr, Miami Beach FL',
    instagram: '@oceandrivedental',
    website: 'oceandrivedental.com',
    facebook: 'Ocean Drive Dental',
    source: 'recommendation',
    referralName: 'Dr. Weiss',
    callOutcome: 'answered',
    statusTag: 'hot',
    notes: 'Very interested in Gold package. Wants a photoshoot before Labor Day.',
    followUpDate: '2026-08-13',
    archived: false,
    createdDate: '2026-08-07',
  },
  {
    id: 'l3',
    firstName: 'Maria',
    lastName: 'Gomez',
    organization: 'Wynwood Coffee Co.',
    phone: '786-555-0199',
    address: '2500 NW 2nd Ave, Wynwood FL',
    instagram: '@wynwoodcoffee',
    website: 'wynwoodcoffee.co',
    facebook: 'Wynwood Coffee Co.',
    source: 'media',
    callOutcome: 'answered',
    statusTag: 'meeting',
    notes: 'Booked intro meeting to review Basic vs Gold.',
    meetingDate: '2026-08-13',
    meetingTime: '14:00',
    meetingLink: 'https://zoom.us/j/8841250443',
    archived: false,
    createdDate: '2026-08-05',
  },
  {
    id: 'l4',
    firstName: 'Jonathan',
    lastName: 'Ross',
    organization: 'Brickell Fitness',
    phone: '305-555-0110',
    address: '1300 Brickell Bay Dr, Miami FL',
    instagram: '@brickellfitness',
    website: 'brickellfitness.com',
    facebook: 'Brickell Fitness',
    source: 'friendReferral',
    callOutcome: 'answered',
    statusTag: 'deliberating',
    notes: 'Comparing us with another agency. Follow up mid-week.',
    followUpDate: '2026-08-12',
    archived: false,
    createdDate: '2026-08-06',
  },
  {
    id: 'l5',
    firstName: 'Tom',
    lastName: 'Becker',
    organization: 'South Beach Spa',
    phone: '305-555-0164',
    address: '45 Lincoln Rd, Miami Beach FL',
    instagram: '@southbeachspa',
    website: 'southbeachspa.com',
    facebook: 'South Beach Spa',
    source: 'facebookGroups',
    callOutcome: 'notInterested',
    statusTag: null,
    notes: 'Not interested this quarter — revisit in Q4.',
    archived: true,
    createdDate: '2026-07-28',
  },
]

export const initialClientFolders: ClientFolder[] = [
  {
    id: 'cf1',
    name: 'Aventura Realty',
    businessType: 'Luxury Real Estate',
    businessTypeHe: 'נדל״ן יוקרה',
    logo: null,
    packageId: 'platinum',
    since: 'Jan 2026',
    sinceMonth: '2026-01',
    contactEmail: 'marketing@aventurarealty.com',
    platforms: ['Instagram', 'Facebook', 'TikTok'],
    calendarLayers: { jewish: true, christian: false, usLocal: true, international: true, events: true },
  showEvents: true,
  categories: ['realEstate', 'art', 'travel'],
  notifyChannels: ['email', 'whatsapp', 'push'],
    invoiceStatus: 'paid',
    contractFileName: 'Aventura_Realty_Agreement_2026.pdf',
    contractAppendices: ['Appendix_A_Photoshoot_Addendum.pdf', 'Brand_Guidelines_v2.pdf'],
    invoiceFiles: ['Aventura_Invoice_Jan_2026.pdf', 'Aventura_Invoice_Feb_2026.pdf'],
    credentials: [
      { id: 'cr1', platform: 'Instagram', username: '@aventura.realty', password: 'AvR!2026miami' },
      { id: 'cr2', platform: 'Facebook', username: 'Aventura Realty', password: 'FbAvr#4430' },
    ],
    active: true,
  },
  {
    id: 'cf2',
    name: 'Design District Gallery',
    businessType: 'Art Gallery',
    businessTypeHe: 'גלריית אמנות',
    logo: null,
    packageId: 'gold',
    since: 'Mar 2026',
    sinceMonth: '2026-03',
    contactEmail: 'hello@ddgallery.com',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    calendarLayers: { jewish: false, christian: true, usLocal: true, international: true, events: true },
    showEvents: true,
  categories: [],
  notifyChannels: ['email', 'sms'],
    invoiceStatus: 'pending',
    contractFileName: null,
    credentials: [
      { id: 'cr3', platform: 'Instagram', username: '@ddgallery.mia', password: 'ArtBasel$26' },
      { id: 'cr4', platform: 'Facebook', username: 'Design District Gallery', password: 'Gallery!305' },
    ],
    active: true,
  },
  {
    id: 'cf3',
    name: 'Ocean Drive Dental',
    businessType: 'Dental Practice',
    businessTypeHe: 'מרפאת שיניים',
    logo: null,
    packageId: 'basic',
    since: 'May 2026',
    sinceMonth: '2026-05',
    contactEmail: 'front@oceandrivedental.com',
    platforms: ['Instagram', 'Facebook'],
    calendarLayers: { jewish: false, christian: false, usLocal: true, international: true, events: true },
    showEvents: true,
  categories: [],
  notifyChannels: ['email'],
    invoiceStatus: 'paid',
    contractFileName: 'Ocean_Drive_Dental_Agreement.pdf',
    credentials: [
      { id: 'cr5', platform: 'Instagram', username: '@oceandrivedental', password: 'Smile2026!' },
    ],
    active: true,
  },
  {
    id: 'cf4',
    name: 'Bayside Bistro',
    businessType: 'Restaurant',
    businessTypeHe: 'מסעדה',
    logo: null,
    packageId: 'gold',
    since: 'Nov 2025',
    sinceMonth: '2025-11',
    contactEmail: 'info@baysidebistro.com',
    platforms: ['Instagram', 'Facebook'],
    calendarLayers: { jewish: false, christian: true, usLocal: true, international: true, events: true },
    showEvents: true,
  categories: [],
  notifyChannels: ['email'],
    invoiceStatus: 'overdue',
    contractFileName: 'Bayside_Bistro_Agreement.pdf',
    credentials: [
      { id: 'cr6', platform: 'Instagram', username: '@baysidebistro', password: 'Bistro!2025' },
    ],
    active: false,
  },
  {
    id: 'cf5',
    name: 'Coral Gables Law',
    businessType: 'Law Firm',
    businessTypeHe: 'משרד עורכי דין',
    logo: null,
    packageId: 'basic',
    since: 'Sep 2025',
    sinceMonth: '2025-09',
    contactEmail: 'contact@cglaw.com',
    platforms: ['LinkedIn', 'Facebook'],
    calendarLayers: { jewish: false, christian: false, usLocal: true, international: false, events: false },
    showEvents: true,
  categories: [],
  notifyChannels: ['email'],
    invoiceStatus: 'paid',
    contractFileName: null,
    credentials: [],
    active: false,
  },
]

export const initialMediaAssets: MediaAsset[] = [
  { id: 'ma1', clientId: 'cf1', category: 'photoshoot', monthKey: '2026-08', name: 'Penthouse_reel_raw.mp4', kind: 'video', date: '2026-08-08', uploadedBy: 'Maya (CEO)' },
  { id: 'ma2', clientId: 'cf1', category: 'photoshoot', monthKey: '2026-08', name: 'Waterfront_gallery_01.jpg', kind: 'image', date: '2026-08-08', uploadedBy: 'Maya (CEO)' },
  { id: 'ma3', clientId: 'cf1', category: 'photoshoot', monthKey: '2026-07', name: 'Aventura_summer_set.jpg', kind: 'image', date: '2026-07-14', uploadedBy: 'Maya (CEO)' },
  { id: 'ma4', clientId: 'cf1', category: 'clientProvided', monthKey: '2026-08', name: 'Listing_3021_iphone.mov', kind: 'video', date: '2026-08-09', uploadedBy: 'Client' },
  { id: 'ma5', clientId: 'cf1', category: 'clientProvided', monthKey: '2026-08', name: 'Agent_headshot.jpg', kind: 'image', date: '2026-08-05', uploadedBy: 'Client' },
  { id: 'ma6', clientId: 'cf2', category: 'photoshoot', monthKey: '2026-08', name: 'ArtBasel_teaser.mp4', kind: 'video', date: '2026-08-06', uploadedBy: 'Maya (CEO)' },
  { id: 'ma7', clientId: 'cf2', category: 'clientProvided', monthKey: '2026-08', name: 'New_exhibit_photos.zip', kind: 'image', date: '2026-08-07', uploadedBy: 'Evelyn' },
  { id: 'ma8', clientId: 'cf1', category: 'brandAssets', monthKey: 'logo', name: 'Aventura_logo_primary.png', kind: 'image', date: '2026-08-02', uploadedBy: 'Evelyn' },
  { id: 'ma9', clientId: 'cf1', category: 'brandAssets', monthKey: 'before', name: 'Brand_before_after_kitchen.jpg', kind: 'image', date: '2026-08-04', uploadedBy: 'Maya (CEO)' },
]

export const initialContentItems: ContentItem[] = [
  { id: 'ci1', clientId: 'cf1', type: 'REEL', platform: 'Instagram', caption: 'Step inside this Aventura waterfront penthouse. Link in bio for a private tour.', scheduledDate: '2026-08-13', time: '19:00', stage: 'client_review', createdBy: 'Evelyn' },
  { id: 'ci2', clientId: 'cf1', type: 'POST', platform: 'Facebook', caption: 'Market update: Aventura median prices rose 4% this quarter.', scheduledDate: '2026-08-13', time: '13:00', stage: 'manager_review', createdBy: 'Evelyn' },
  { id: 'ci3', clientId: 'cf2', type: 'STORY', platform: 'Instagram', caption: 'Art Basel week is coming — reserve your VIP preview.', scheduledDate: '2026-08-12', time: '11:00', stage: 'client_review', createdBy: 'Evelyn' },
  { id: 'ci4', clientId: 'cf3', type: 'POST', platform: 'Instagram', caption: 'Brighten your smile before summer — free consultation this month.', scheduledDate: '2026-08-16', time: '11:00', stage: 'scheduled', createdBy: 'Evelyn' },
  { id: 'ci5', clientId: 'cf2', type: 'REEL', platform: 'TikTok', caption: 'Behind the scenes at the gallery install.', stage: 'draft', createdBy: 'Evelyn' },
  { id: 'ci6', clientId: 'cf1', type: 'STORY', platform: 'Instagram', caption: 'Poll: which kitchen finish do you prefer?', scheduledDate: '2026-08-13', time: '11:00', stage: 'client_review', createdBy: 'Evelyn' },
]

export const initialPaidCampaigns: PaidCampaign[] = [
  {
    id: 'pc1', clientId: 'cf2', title: 'Art Basel VIP Preview', objective: 'leadGen',
    audience: 'Miami art collectors & design lovers', ageRange: '30-60',
    locations: '33127, 33137, Wynwood, Design District', budgetType: 'lifetime', budget: 1800,
    startDate: '2026-08-20', endDate: '2026-09-03', creativeName: 'ArtBasel_teaser.mp4',
    primaryText: 'Be first through the doors at Art Basel week. Reserve your private VIP preview.',
    headline: 'Reserve Your VIP Preview', status: 'ceo',
  },
  {
    id: 'pc2', clientId: 'cf3', title: 'Summer Smile Leads', objective: 'messages',
    audience: 'South Beach residents', ageRange: '25-45', locations: '33139, Miami Beach',
    budgetType: 'daily', budget: 40, startDate: '2026-08-01', endDate: '2026-08-31',
    creativeName: 'Smile_promo.jpg', primaryText: 'Free consultation this month — brighten your smile before summer ends.',
    headline: 'Book a Free Consultation', status: 'active',
  },
]

export const initialOperativeTasks: OperativeTask[] = [
  { id: 'ot1', clientId: 'cf1', title: 'Update Instagram bio with new listing link', description: 'Please replace the current link in your bio with the new Aventura penthouse listing URL we sent you by email.', done: false },
  { id: 'ot2', clientId: 'cf1', title: 'Refresh Story Highlights covers', done: true },
  { id: 'ot3', clientId: 'cf1', title: 'Design new Facebook cover photo', done: false },
  { id: 'ot4', clientId: 'cf2', title: 'Launch Art Basel campaign', done: false },
  { id: 'ot5', clientId: 'cf3', title: 'Update Highlights with patient reviews', done: false },
]

export const initialActivityLogs: ActivityLog[] = [
  { id: 'al1', clientId: 'cf1', category: 'content', actor: 'Maya (CEO)', action: 'Approved REEL and sent to client', actionHe: 'אישרה REEL ושלחה ללקוח', timestamp: '2026-08-10T15:42:00' },
  { id: 'al2', clientId: 'cf1', category: 'media', actor: 'Maya (CEO)', action: 'Uploaded Penthouse_reel_raw.mp4 to Media Vault', actionHe: 'העלתה את Penthouse_reel_raw.mp4 לכספת המדיה', timestamp: '2026-08-08T09:15:00' },
  { id: 'al3', clientId: 'cf1', category: 'credential', actor: 'Evelyn', action: 'Updated Instagram password', actionHe: 'עדכנה סיסמת אינסטגרם', timestamp: '2026-08-07T11:03:00' },
  { id: 'al4', clientId: 'cf2', category: 'campaign', actor: 'Maya (CEO)', action: 'Sent Art Basel campaign for client approval', actionHe: 'שלחה את קמפיין Art Basel לאישור הלקוח', timestamp: '2026-08-06T16:20:00' },
  { id: 'al5', clientId: 'cf2', category: 'content', actor: 'Client', action: 'Requested edit on STORY', actionHe: 'ביקש תיקון ל-STORY', timestamp: '2026-08-06T18:47:00' },
]

export const initialTasks: Task[] = [
  { id: 't1', title: 'Shoot reels for Aventura Realty', description: 'Full-day shoot at the new waterfront penthouse. Capture 3 vertical reels (walkthrough, lifestyle, agent intro) plus 15 stills for the feed. Golden-hour balcony footage is a priority.', assignee: 'Maya', urgency: 'urgentToday', client: 'Aventura Realty', createdDate: '2026-08-10', done: false },
  { id: 't2', title: 'Design 6 IG posts — Design District', description: 'Six carousel posts previewing the Art Basel exhibit. Use the gallery brand palette and include artist credits in the caption.', assignee: 'Evelyn', urgency: 'urgentWeek', client: 'Design District Gallery', createdDate: '2026-08-09', done: false },
  { id: 't3', title: 'Schedule Shabbat-safe posts', description: 'Queue next week of Aventura content so nothing publishes between Friday sunset and Saturday night. Morning Friday slots are fine.', assignee: 'Evelyn', urgency: 'duringMonth', client: 'Aventura Realty', createdDate: '2026-08-08', done: false },
  { id: 't4', title: 'Launch Art Basel teaser campaign', description: 'Set up the lead-gen campaign in Meta Ads Manager once the client approves. Budget and targeting are defined in the Paid Campaigns tab.', assignee: 'New Employee', urgency: 'urgentWeek', client: 'Design District Gallery', createdDate: '2026-08-07', done: false },
  { id: 't5', title: 'Monthly report — Ocean Drive Dental', description: 'Compile July performance: reach, engagement, follower growth, and top posts. Send branded PDF to the client.', assignee: 'Maya', urgency: 'duringMonth', client: 'Ocean Drive Dental', createdDate: '2026-08-02', done: true },
]

export const initialCalendarEvents: CalendarEvent[] = [
  // Jewish — granular locks: Friday blocks only AFTER sunset; Saturday blocks UNTIL nightfall
  { id: 'ce1', date: '2026-08-14', layer: 'jewish', title: 'Shabbat begins 7:47 PM', titleHe: 'כניסת שבת 19:47', description: 'Shabbat starts at sunset. Do not schedule posts after this time.', descriptionHe: 'כניסת שבת בשקיעה. אין לתזמן פוסטים לאחר שעה זו.', doNotPost: true, time: '19:47', lockFrom: '19:47' },
  { id: 'ce2', date: '2026-08-15', layer: 'jewish', title: 'Shabbat ends 8:40 PM', titleHe: 'צאת שבת 20:40', description: 'Shabbat ends at nightfall. Posting is blocked until this time.', descriptionHe: 'צאת שבת בלילה. פרסום חסום עד שעה זו.', doNotPost: true, time: '20:40', lockUntil: '20:40' },
  { id: 'ce3', date: '2026-08-21', layer: 'jewish', title: 'Shabbat begins 7:41 PM', titleHe: 'כניסת שבת 19:41', description: 'Shabbat starts at sunset. Do not schedule posts after this time.', descriptionHe: 'כניסת שבת בשקיעה. אין לתזמן פוסטים לאחר שעה זו.', doNotPost: true, time: '19:41', lockFrom: '19:41' },
  { id: 'ce4', date: '2026-08-22', layer: 'jewish', title: 'Shabbat ends 8:33 PM', titleHe: 'צאת שבת 20:33', description: 'Shabbat ends at nightfall. Posting is blocked until this time.', descriptionHe: 'צאת שבת בלילה. פרסום חסום עד שעה זו.', doNotPost: true, time: '20:33', lockUntil: '20:33' },
  { id: 'ce5', date: '2026-08-28', layer: 'jewish', title: 'Shabbat begins 7:33 PM', titleHe: 'כניסת שבת 19:33', description: 'Shabbat starts at sunset. Do not schedule posts after this time.', descriptionHe: 'כניסת שבת בשקיעה. אין לתזמן פוסטים לאחר שעה זו.', doNotPost: true, time: '19:33', lockFrom: '19:33' },
  { id: 'ce6', date: '2026-08-29', layer: 'jewish', title: 'Shabbat ends 8:25 PM', titleHe: 'צאת שבת 20:25', description: 'Shabbat ends at nightfall. Posting is blocked until this time.', descriptionHe: 'צאת שבת בלילה. פרסום חסום עד שעה זו.', doNotPost: true, time: '20:25', lockUntil: '20:25' },
  // Christian
  { id: 'ce7', date: '2026-08-15', layer: 'christian', title: 'Assumption of Mary', titleHe: 'חג העלייה השמימה', description: 'Catholic holy day honoring Mary. Consider respectful, low-key content.', descriptionHe: 'חג קתולי לכבוד מריה. מומלץ תוכן מכבד ומינורי.' },
  { id: 'ce8', date: '2026-08-06', layer: 'christian', title: 'Feast of the Transfiguration', titleHe: 'חג ההשתנות', description: 'Christian feast day. A cultural date to be aware of when planning.', descriptionHe: 'חג נוצרי. תאריך תרבותי שכדאי להיות מודעים אליו בתכנון.' },
  // US / Miami local
  { id: 'ce9', date: '2026-08-04', layer: 'usLocal', title: 'US Coast Guard Day', titleHe: 'יום משמר החופים', description: 'US observance. A light opportunity to tie in Miami coastal themes.', descriptionHe: 'ציון אמריקאי. הזדמנות קלילה לשלב נושאים חופיים ממיאמי.' },
  { id: 'ce10', date: '2026-08-26', layer: 'usLocal', title: "Women's Equality Day", titleHe: 'יום שוויון האישה', description: 'US awareness day marking women\u2019s right to vote. Good for value-led posts.', descriptionHe: 'יום מודעות אמריקאי לזכות ההצבעה לנשים. מתאימים לתוכן ערכי.' },
  { id: 'ce11', date: '2026-08-12', layer: 'usLocal', title: 'Miami Swim Week', titleHe: 'שבוע האופנה של מיאמי', description: 'Major Miami fashion event. High local engagement — ideal for lifestyle content.', descriptionHe: 'אירוע אופנה מרכזי במיאמי. מעורבות מקומית גבוהה — מתאים לתוכן לייפסטייל.' },
  { id: 'ce12', date: '2026-08-28', layer: 'usLocal', title: 'Miami Marlins Home Game', titleHe: 'משחק בית של מיאמי מרלינס', description: 'Local sports event. Great for timely, community-focused posts.', descriptionHe: 'אירוע ספורט מקומי. מצוין לתוכן עדכני וקהילתי.' },
  // International days
  { id: 'ce13', date: '2026-08-19', layer: 'international', title: 'World Photography Day', titleHe: 'יום הצילום הבינלאומי', description: 'Global day celebrating photography. Perfect to showcase your best visuals.', descriptionHe: 'יום עולמי לצילום. מושלם להצגת התמו��ות הטובות ביותר שלכם.' },
  { id: 'ce14', date: '2026-08-08', layer: 'international', title: 'International Cat Day', titleHe: 'יום החתול הבינלאומי', description: 'Fun global awareness day. Light, shareable content opportunity.', descriptionHe: 'יום מודעות עולמי כלפי. הזדמנות לתוכן קליל ושַׁתְפִי.' },
]

export const initialEmployees: Employee[] = [
  {
    id: 'emp1', name: 'Maya Ben-David', firstName: 'Maya', lastName: 'Ben-David',
    role: 'Founder & Manager', roleHe: 'מייסדת ומנהלת', roleDescription: 'Runs the agency, approves content, campaigns and invoices.',
    email: 'maya@mabmarketing.com', phone: '+1 (305) 555-0110', address: 'Sunrise, FL',
    rateType: 'monthly', rateAmount: 0, recruitedFrom: 'Founder', startDate: '2024-01-02',
    status: 'active', since: 'Jan 2024', assignedClients: 5, openTasks: 2,
    permissions: { allClients: true, clientIds: [], folderTabs: [], canSeeContracts: true },
  },
  {
    id: 'emp2', name: 'Evelyn Torres', firstName: 'Evelyn', lastName: 'Torres',
    role: 'Content Manager', roleHe: 'מנהלת תוכן', roleDescription: 'Creates content and campaigns for assigned clients.',
    email: 'evelyn@mabmarketing.com', phone: '+1 (305) 555-0124', address: 'Miami, FL',
    rateType: 'monthly', rateAmount: 3800, recruitedFrom: 'LinkedIn', startDate: '2024-03-11',
    status: 'active', since: 'Mar 2024', assignedClients: 4, openTasks: 5,
    permissions: { allClients: true, clientIds: [], folderTabs: [], canSeeContracts: true, leadsAccess: 'full' },
  },
  {
    id: 'emp3', name: 'New Employee', firstName: 'New', lastName: 'Employee',
    role: 'Junior Marketer', roleHe: 'משווקת זוטרה', roleDescription: 'Supports content scheduling and community management.',
    email: 'hire@mabmarketing.com', phone: '+1 (305) 555-0188', address: 'Hollywood, FL',
    rateType: 'hourly', rateAmount: 22, recruitedFrom: 'Referral', startDate: '2026-07-01',
    status: 'active', since: 'Jul 2026', assignedClients: 1, openTasks: 1,
    permissions: { allClients: false, clientIds: [], folderTabs: [], canSeeContracts: false, leadsAccess: 'add' },
  },
]

export const initialWorkJournal: WorkJournalEntry[] = [
  { id: 'wj1', employeeId: 'emp2', type: 'workHours', date: '2026-08-24', hours: 8, note: 'Aventura reels + Gallery campaign' },
  { id: 'wj2', employeeId: 'emp2', type: 'workHours', date: '2026-08-25', hours: 7 },
  { id: 'wj3', employeeId: 'emp3', type: 'sick', date: '2026-08-24', note: 'Flu' },
  { id: 'wj4', employeeId: 'emp3', type: 'workHours', date: '2026-08-25', hours: 5 },
  { id: 'wj5', employeeId: 'emp1', type: 'vacation', date: '2026-08-26', note: 'Family day' },
]

export const initialFinances: FinanceEntry[] = [
  // Revenue — client retainers
  { id: 'fin1', type: 'revenue', label: 'Aventura Realty — Platinum retainer', labelHe: 'Aventura Realty — ריטיינר פלטינום', amount: 6500, category: 'Retainer', categoryHe: 'ריטיינר', date: '2026-08-01' },
  { id: 'fin2', type: 'revenue', label: 'Design District Gallery — Gold retainer', labelHe: 'Design District Gallery — ריטיינר זהב', amount: 4200, category: 'Retainer', categoryHe: 'ריטיינר', date: '2026-08-01' },
  { id: 'fin3', type: 'revenue', label: 'Ocean Drive Dental — Basic retainer', labelHe: 'Ocean Drive Dental — ריטיינר בסיסי', amount: 2400, category: 'Retainer', categoryHe: 'ריטיינר', date: '2026-08-01' },
  { id: 'fin4', type: 'revenue', label: 'Art Basel campaign management fee', labelHe: 'דמי ניהול קמפיין Art Basel', amount: 1500, category: 'Campaign', categoryHe: 'קמפיין', date: '2026-08-06' },
  // Expenses
  { id: 'fin5', type: 'expense', label: 'Meta Ads spend', labelHe: 'הוצאת פרסום ב-Meta', amount: 3000, category: 'Ad spend', categoryHe: 'תקציב פרסום', date: '2026-08-05' },
  { id: 'fin6', type: 'expense', label: 'Payroll — team', labelHe: 'שכר — צוות', amount: 5200, category: 'Payroll', categoryHe: 'שכר', date: '2026-08-01' },
  { id: 'fin7', type: 'expense', label: 'Software & tools (Adobe, Later, Canva)', labelHe: 'תוכנות וכלים (Adobe, Later, Canva)', amount: 420, category: 'Software', categoryHe: 'תוכנה', date: '2026-08-02' },
  { id: 'fin8', type: 'expense', label: 'Photoshoot production', labelHe: 'הפקת צילומים', amount: 900, category: 'Production', categoryHe: 'הפקה', date: '2026-08-08' },
]

export const initialChatThreads: ChatThread[] = [
  // Group threads — one per active client, CEO + the relevant employee
  {
    id: 'chat-cf1',
    kind: 'group',
    clientId: 'cf1',
    employeeId: 'emp2',
    messages: [
      { id: 'm1', senderId: 'emp2', senderName: 'Evelyn Torres', text: 'Aventura Realty approved the August reels — scheduling them now.', timestamp: '2026-08-24T09:12:00' },
      { id: 'm2', senderId: 'ceo', senderName: 'Maya Ben-David', text: 'Perfect. Push the open-house post to Thursday, better reach.', timestamp: '2026-08-24T09:20:00' },
      { id: 'm3', senderId: 'emp2', senderName: 'Evelyn Torres', text: 'Done. Also need new listing photos from the client for next week.', timestamp: '2026-08-24T09:24:00' },
    ],
  },
  {
    id: 'chat-cf2',
    kind: 'group',
    clientId: 'cf2',
    employeeId: 'emp2',
    messages: [
      { id: 'm4', senderId: 'ceo', senderName: 'Maya Ben-David', text: 'Design District Gallery wants the Art Basel campaign live by the 1st.', timestamp: '2026-08-23T14:02:00' },
      { id: 'm5', senderId: 'emp2', senderName: 'Evelyn Torres', text: 'On it — creative is ready, waiting on final budget approval.', timestamp: '2026-08-23T14:10:00' },
    ],
  },
  {
    id: 'chat-cf3',
    kind: 'group',
    clientId: 'cf3',
    employeeId: 'emp3',
    messages: [
      { id: 'm6', senderId: 'ceo', senderName: 'Maya Ben-David', text: 'Ocean Drive Dental is a good first account for you — keep the tone friendly.', timestamp: '2026-08-22T11:30:00' },
      { id: 'm7', senderId: 'emp3', senderName: 'New Employee', text: 'Thanks! First three posts drafted, sending for your review today.', timestamp: '2026-08-22T11:45:00' },
    ],
  },
  // Direct threads — CEO + a single employee
  {
    id: 'chat-emp2',
    kind: 'direct',
    employeeId: 'emp2',
    messages: [
      { id: 'm8', senderId: 'emp2', senderName: 'Evelyn Torres', text: 'Sending you the monthly content plan for all my clients tonight.', timestamp: '2026-08-24T16:05:00' },
      { id: 'm9', senderId: 'ceo', senderName: 'Maya Ben-David', text: 'Great, thank you. Let’s sync tomorrow at 10.', timestamp: '2026-08-24T16:08:00' },
    ],
  },
  {
    id: 'chat-emp3',
    kind: 'direct',
    employeeId: 'emp3',
    messages: [
      { id: 'm10', senderId: 'ceo', senderName: 'Maya Ben-David', text: 'How is your first week going? Let me know if you need anything.', timestamp: '2026-08-21T10:00:00' },
      { id: 'm11', senderId: 'emp3', senderName: 'New Employee', text: 'Going well! Getting the hang of the approval workflow.', timestamp: '2026-08-21T10:12:00' },
    ],
  },
  // Peer threads — employee ↔ employee
  {
    id: 'chat-peer-emp2-emp3',
    kind: 'peer',
    employeeId: 'emp2',
    peerEmployeeId: 'emp3',
    messages: [
      { id: 'm12', senderId: 'emp2', senderName: 'Evelyn Torres', text: 'Hey! Can you cover the Ocean Drive Dental stories this weekend?', timestamp: '2026-08-24T13:15:00' },
      { id: 'm13', senderId: 'emp3', senderName: 'New Employee', text: 'Sure, I’ll schedule them Friday. Send me the captions?', timestamp: '2026-08-24T13:22:00' },
    ],
  },
]

// ---------------- Date helpers ----------------

// Lead callbacks skip Saturday and Sunday.
function isBlockedDay(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

// Add N calendar days then push forward off the weekend.
export function followUpInDays(fromISO: string, days: number): string {
  const d = new Date(fromISO + 'T12:00:00')
  d.setDate(d.getDate() + days)
  while (isBlockedDay(d)) {
    d.setDate(d.getDate() + 1)
  }
  return d.toISOString().slice(0, 10)
}

export function todayISO(): string {
  return '2026-08-11'
}

// Fixed "now" for deterministic demo timestamps
let logClock = 9 * 3600 // seconds into the day, advances each call
export function nowISO(): string {
  const base = new Date('2026-08-11T00:00:00')
  base.setSeconds(base.getSeconds() + logClock)
  logClock += 137
  return base.toISOString().slice(0, 19)
}

export function formatLogTime(iso: string, lang: 'en' | 'he'): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
    month: 'short',
    day: 'numeric',
  })
  const time = d.toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${date} · ${time}`
}

// Build the list of month keys from a client's onboarding month up to the current month (newest first)
export function monthsSince(sinceMonth: string): string[] {
  const [sy, sm] = sinceMonth.split('-').map(Number)
  const now = new Date(todayISO() + 'T12:00:00')
  const months: string[] = []
  let y = sy
  let m = sm // 1-12
  const endY = now.getFullYear()
  const endM = now.getMonth() + 1
  while (y < endY || (y === endY && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return months.reverse()
}

export function monthLabel(monthKey: string, lang: 'en' | 'he'): string {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString(lang === 'he' ? 'he-IL' : 'en-US', { month: 'long', year: 'numeric' })
}

export function daysElapsed(fromISO: string): number {
  const a = new Date(fromISO + 'T12:00:00').getTime()
  const b = new Date(todayISO() + 'T12:00:00').getTime()
  return Math.max(0, Math.round((b - a) / 86400000))
}
