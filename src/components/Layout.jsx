import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ToastContainer from './Toast'

const navItems = [
  { path: '/', label: '发现', icon: 'search' },
  { path: '/following', label: '关注', icon: 'star' },
  { path: '/calendar', label: '日历', icon: 'calendar' },
  { path: '/subscribe', label: '订阅', icon: 'rss' },
]

function NavIcon({ name }) {
  const icons = {
    search: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
    star: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    calendar: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    ),
    rss: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
      </svg>
    ),
  }
  return icons[name] || null
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={{
          width: 220,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 100,
        }}>
          <div style={{ padding: '0 24px 32px' }}>
            <Link to="/" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 28,
              fontStyle: 'italic',
              color: 'var(--accent)',
              textDecoration: 'none',
              letterSpacing: 1,
            }}>
              Reel
            </Link>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 24px',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    background: active ? 'rgba(224,159,62,0.08)' : 'transparent',
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 18, display: 'flex', alignItems: 'center' }}><NavIcon name={item.icon} /></span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
      )}

      {/* Mobile Top Bar */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 100,
        }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 22,
            fontStyle: 'italic',
            color: 'var(--accent)',
            textDecoration: 'none',
          }}>
            Reel
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 22,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </header>
      )}

      {/* Mobile Drawer */}
      {isMobile && mobileOpen && (
        <div style={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 99,
        }} onClick={() => setMobileOpen(false)}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px 0',
            borderBottom: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  color: location.pathname === item.path ? 'var(--accent)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}><NavIcon name={item.icon} /></span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 220,
        paddingTop: isMobile ? 56 : 0,
        paddingBottom: isMobile ? 64 : 0,
        minHeight: '100vh',
      }}>
        {children}
      </main>

      {/* Mobile Bottom Tab */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
        }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  transition: 'color 0.2s',
                }}
              >
                <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}><NavIcon name={item.icon} /></span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}

      <ToastContainer />

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
