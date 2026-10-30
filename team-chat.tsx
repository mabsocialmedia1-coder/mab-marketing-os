'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Users, User, Send, ShieldCheck, Paperclip, Search, X } from 'lucide-react'
import type { ChatThread } from '@/lib/data'

export function TeamChat() {
  const { t, lang, dir, role, chatThreads, sendChatMessage, clientFolders, employees, currentClientId, currentEmployeeId } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [attachment, setAttachment] = useState<{ kind: 'image' | 'video' | 'link'; url: string; name?: string }>()

  // The logged-in employee maps to Evelyn; the manager maps to Maya.
  const meEmpId = role === 'employee' ? 'emp2' : role === 'ceo' ? 'emp1' : null
  const meSenderId = role === 'ceo' ? 'ceo' : role === 'employee' ? meEmpId : 'client'

  const employeeName = (id: string) => employees.find((x) => x.id === id)?.name ?? 'Team'
  const clientName = (id?: string) => clientFolders.find((c) => c.id === id)?.name ?? 'Client'

  // Threads visible to the current user
  const visible = useMemo(() => {
    if (role === 'ceo') return chatThreads.filter((th) => th.kind === 'group' && !!th.clientId)
    if (role === 'employee') {
      // clientFolders is already filtered by the provider using the employee's
      // permissions, so it is the authoritative list for this employee's chats.
      const assignedClientIds = new Set(clientFolders.map((client) => client.id))
      return chatThreads.filter(
        (th) =>
          (th.kind === 'group' && !!th.clientId && assignedClientIds.has(th.clientId)) ||
          (th.kind === 'direct' && th.employeeId === meEmpId) ||
          (th.kind === 'peer' && (th.employeeId === meEmpId || th.peerEmployeeId === meEmpId)),
      )
    }
    // Client — only their own folder's group thread (manager + their account manager).
    // Prefer the profile link, but fall back to the single client folder loaded for the client.
    const clientFolderId = currentClientId ?? clientFolders[0]?.id
    return chatThreads.filter((th) => th.kind === 'group' && th.clientId === clientFolderId)
  }, [chatThreads, role, meEmpId, currentClientId, currentEmployeeId, clientFolders, employees])

  const [activeId, setActiveId] = useState<string>(visible[0]?.id ?? '')
  useEffect(() => {
    if (visible.length && !visible.some((thread) => thread.id === activeId)) setActiveId(visible[0].id)
  }, [visible, activeId])
  const active = useMemo(
    () => visible.find((th) => th.id === activeId) ?? visible[0],
    [visible, activeId],
  )

  // The "other" employee id in a peer thread, from the current user's perspective
  const peerOtherId = (th: ChatThread) => (th.employeeId === meEmpId ? th.peerEmployeeId : th.employeeId) ?? th.peerEmployeeId ?? th.employeeId

  const threadTitle = (th: ChatThread) => {
    // The client sees their team thread labeled as "My team", not their own name
    if (th.kind === 'group') return role === 'client' ? t('chat_myTeam') : clientName(th.clientId)
    if (th.kind === 'peer') return employeeName(peerOtherId(th))
    // direct = employee ↔ manager
    return role === 'employee' ? t('chat_manager') : employeeName(th.employeeId)
  }

  const threadSubtitle = (th: ChatThread) => {
    if (th.kind === 'group')
      return role === 'client'
        ? `${t('chat_manager')} · ${employeeName(th.employeeId)}`
          : role === 'ceo'
          ? `${lang === 'he' ? 'מנהל' : 'Manager'} · ${employeeName(th.employeeId)} · ${clientName(th.clientId)}`
          : `${t('chat_with')} ${employeeName(th.employeeId)}`
    if (th.kind === 'peer') {
      const other = employees.find((e) => e.id === peerOtherId(th))
      return (lang === 'he' ? other?.roleHe : other?.role) ?? ''
    }
    if (role === 'employee') return employeeName('emp1')
    const e = employees.find((x) => x.id === th.employeeId)
    return (lang === 'he' ? e?.roleHe : e?.role) ?? ''
  }

  // Sections differ by role
  const groups = visible.filter((th) => th.kind === 'group')

  const initials = (name: string) =>
    name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const send = () => {
    if ((!draft.trim() && !attachment) || !active) return
    sendChatMessage(active.id, draft, attachment)
    setDraft('')
    setAttachment(undefined)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      send()
    }
  }

  const ThreadButton = ({ th }: { th: ChatThread }) => {
    const isActive = active?.id === th.id
    const last = th.messages[th.messages.length - 1]
    const icon =
      th.kind === 'group' ? <Users className="h-4 w-4" /> : th.kind === 'direct' ? <ShieldCheck className="h-4 w-4" /> : initials(threadTitle(th))
    return (
      <button
        type="button"
        onClick={() => setActiveId(th.id)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${
          isActive ? 'bg-taupe text-white' : 'text-taupe hover:bg-secondary'
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
            isActive ? 'bg-white/20 text-white' : 'bg-cream text-taupe'
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{threadTitle(th)}</span>
          <span className={`block truncate text-xs ${isActive ? 'text-white/70' : 'text-taupe-light'}`}>
            {last ? last.text : threadSubtitle(th)}
          </span>
        </span>
      </button>
    )
  }

  const Section = ({ label, threads }: { label: string; threads: ChatThread[] }) =>
    threads.length === 0 ? null : (
      <>
        {label && <div className="px-2 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-wide text-taupe-soft first:pt-1">{label}</div>}
        <div className="flex flex-col gap-1">
          {threads.map((th) => (
            <ThreadButton key={th.id} th={th} />
          ))}
        </div>
      </>
    )

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-taupe">{t('chat_title')}</h1>
        <p className="mt-1 text-sm text-taupe-light">{role === 'client' ? t('chat_clientTeamSubtitle') : t('chat_subtitle')}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Thread list */}
        <aside className="rounded-2xl border border-sand-dark bg-card p-3">
          <div className="mb-2 flex items-center justify-between px-2"><span className="text-sm font-semibold text-taupe">{role === 'client' ? t('chat_myTeam') : lang === 'he' ? 'קבוצות לפי לקוח' : 'Client groups'}</span><span className="text-xs text-taupe-soft">{groups.length}</span></div>
          <Section label="" threads={groups} />
        </aside>

        {/* Conversation */}
        <section className="flex h-[600px] flex-col rounded-2xl border border-sand-dark bg-card">
          {active && (
            <>
              <div className="flex items-center gap-3 border-b border-sand-dark p-4">
                <div className="relative ms-auto w-48">
                  <Search className="absolute start-2 top-2.5 h-3.5 w-3.5 text-taupe-soft" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('chat_search')} className="w-full rounded-lg border border-sand-dark bg-background py-2 ps-7 pe-2 text-xs outline-none" />
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream text-taupe">
                  {active.kind === 'group' ? (
                    <Users className="h-5 w-5" />
                  ) : active.kind === 'direct' ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-taupe">{threadTitle(active)}</div>
                  <div className="truncate text-xs text-taupe-light">{threadSubtitle(active)}</div>
                  {active.kind === 'group' && <div className="mt-1 text-[11px] text-taupe-soft">{lang === 'he' ? 'קבוצה: מנהל · עובדת · לקוח' : 'Group: Manager · Employee · Client'}</div>}
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {active.messages.filter((m) => !search.trim() || `${m.text} ${m.senderName}`.toLowerCase().includes(search.toLowerCase())).map((m) => {
                  const mine = m.senderId === meSenderId
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
                        {!mine && (
                          <div className="mb-0.5 px-1 text-[11px] font-medium text-taupe-light">
                            {m.senderName}
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                            mine
                              ? 'rounded-ee-sm bg-taupe text-white'
                              : 'rounded-es-sm bg-secondary text-foreground'
                          }`}
                        >
                          {m.text && <div className="whitespace-pre-wrap">{m.text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => part.match(/^https?:\/\//) ? <a key={index} href={part} target="_blank" rel="noreferrer" className="underline">{part}</a> : part)}</div>}
                          {m.attachment?.kind === 'image' && <img src={m.attachment.url} alt={m.attachment.name ?? 'Chat image'} className="mt-2 max-h-48 rounded-lg object-cover" />}
                          {m.attachment?.kind === 'video' && <video src={m.attachment.url} controls className="mt-2 max-h-48 rounded-lg" />}
                          {m.attachment?.kind === 'link' && <a href={m.attachment.url} target="_blank" rel="noreferrer" className="mt-1 block underline">{m.attachment.url}</a>}
                        </div>
                        <div
                          className={`mt-0.5 px-1 text-[10px] text-taupe-soft ${
                            mine ? 'text-end' : 'text-start'
                          }`}
                        >
                          {formatTime(m.timestamp)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-sand-dark p-3">
                {attachment && <div className="mb-2 flex items-center gap-2 rounded-lg bg-secondary px-2 py-1 text-xs"><span className="truncate">{attachment.name ?? attachment.url}</span><button type="button" onClick={() => setAttachment(undefined)} aria-label={t('chat_removeAttachment')}><X className="h-3.5 w-3.5" /></button></div>}
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setAttachment({ kind: file.type.startsWith('video') ? 'video' : 'image', url: URL.createObjectURL(file), name: file.name }) }} />
                <div className="flex items-end gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} aria-label={t('chat_attach')} className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-sand-dark text-taupe hover:bg-secondary"><Paperclip className="h-4 w-4" /></button>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder={t('chat_placeholder')}
                  dir={dir}
                  className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-sand-dark bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-taupe-soft focus:border-taupe-light"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!draft.trim() && !attachment}
                  className="flex h-[42px] items-center gap-2 rounded-xl bg-taupe px-4 text-sm font-semibold text-white transition hover:bg-taupe-light disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className={`h-4 w-4 ${dir === 'rtl' ? 'scale-x-[-1]' : ''}`} />
                  <span className="hidden sm:inline">{t('send')}</span>
                </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
