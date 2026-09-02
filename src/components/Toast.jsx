import { useEffect, useState } from 'react'

let toastId = 0
const listeners = new Set()

export function toast(message, type = 'info') {
  const id = ++toastId
  listeners.forEach(fn => fn({ id, message, type }))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handle = (t) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id))
      }, 2800)
    }
    listeners.add(handle)
    return () => listeners.delete(handle)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--bg-elevated)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'toastIn 0.3s ease',
          borderLeft: `3px solid ${t.type === 'success' ? '#7ec97e' : t.type === 'error' ? '#e07e7e' : 'var(--accent)'}`,
        }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
