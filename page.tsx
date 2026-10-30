'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function ApprovalPageContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'approved' | 'changes'>('idle')
  const contentType = params.get('type') || 'CONTENT'
  const client = params.get('client') || 'Client'
  const caption = params.get('caption') || 'Content awaiting your approval'

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-xl rounded-2xl border border-sand-dark bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-taupe-light">MAB Social Media</p>
        <h1 className="mt-3 text-2xl font-semibold text-taupe">Client approval</h1>
        <p className="mt-1 text-sm text-taupe-light">{client} · {contentType}</p>
        <div className="mt-6 rounded-xl border border-sand-dark bg-secondary p-4">
          <p className="text-sm leading-6 text-foreground">{caption}</p>
        </div>
        {status === 'idle' ? (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setStatus('approved')} className="flex-1 rounded-lg bg-taupe px-4 py-3 text-sm font-semibold text-white">Approve content</button>
            <button type="button" onClick={() => setStatus('changes')} className="flex-1 rounded-lg border border-sand-dark px-4 py-3 text-sm font-semibold text-taupe">Request changes</button>
          </div>
        ) : (
          <div className={`mt-6 rounded-xl p-4 text-sm font-medium ${status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            {status === 'approved' ? 'Approved. The team will now schedule this content in the client calendar.' : 'Your change request was received. The team will update the content and send it again.'}
          </div>
        )}
        <p className="mt-6 text-center text-xs text-taupe-light">No login required. This approval link is intended only for the recipient.</p>
      </div>
    </main>
  )
}

export default function ClientApprovalPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background p-8 text-sm text-taupe-light">Loading approval…</main>}><ApprovalPageContent /></Suspense>
}
