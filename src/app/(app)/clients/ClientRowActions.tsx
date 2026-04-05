'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteClientAction } from './actions'

export default function ClientRowActions({ clientId, clientName }: { clientId: string, clientName: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete client "${clientName}"? This cannot be undone.`)) {
      return
    }
    
    startTransition(async () => {
      try {
        await deleteClientAction(clientId)
      } catch (err: any) {
        alert(err.message)
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
      <Link 
        href={`/clients/edit/${clientId}`} 
        className="btn btn-sm"
        style={{ 
          background: 'transparent',
          color: 'var(--ink-2)', 
          fontSize: 13, 
          fontWeight: 500,
          border: '1px solid var(--border)',
          padding: '4px 10px',
        }}
      >
        Edit
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="btn btn-sm"
        style={{ 
          background: 'transparent',
          color: 'var(--red)', 
          fontSize: 13, 
          fontWeight: 500, 
          border: '1px solid var(--red-light)',
          padding: '4px 10px',
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.5 : 1
        }}
      >
        {isPending ? '...' : 'Delete'}
      </button>
    </div>
  )
}
