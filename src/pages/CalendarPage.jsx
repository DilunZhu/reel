import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFollowing } from '../hooks/useFollowing'
import CalendarWeek from '../components/CalendarWeek'
import CalendarMonth from '../components/CalendarMonth'

const VIEWS = [
  { key: 'week', label: '周视图' },
  { key: 'month', label: '月视图' },
]

export default function CalendarPage() {
  const { following } = useFollowing()
  const [view, setView] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const handlePrev = () => {
    const d = new Date(currentDate)
    if (view === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setMonth(d.getMonth() - 1)
    }
    setCurrentDate(d)
  }

  const handleNext = () => {
    const d = new Date(currentDate)
    if (view === 'week') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setMonth(d.getMonth() + 1)
    }
    setCurrentDate(d)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const titleText = view === 'week'
    ? `第${getWeekNumber(currentDate)}周 · ${currentDate.getFullYear()}`
    : `${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`

  function getWeekNumber(d) {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + 4 - (date.getDay() || 7))
    const yearStart = new Date(date.getFullYear(), 0, 1)
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
        }}>
          更新日历
        </h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: view === v.key ? 600 : 400,
                background: view === v.key ? 'var(--accent)' : 'var(--bg-secondary)',
                color: view === v.key ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${view === v.key ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 10,
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePrev}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={handleToday}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          >
            今天
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 20,
          fontStyle: 'italic',
          color: 'var(--accent)',
        }}>
          {titleText}
        </h2>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          已关注 {following.length} 部
        </div>
      </div>

      {following.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 80,
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, marginBottom: 8 }}>日历为空</p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>关注剧集后，这里会显示它们的更新计划</p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#000',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            去发现 &rarr;
          </Link>
        </div>
      ) : (
        view === 'week' ? (
          <CalendarWeek
            shows={following}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        ) : (
          <CalendarMonth
            shows={following}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        )
      )}
    </div>
  )
}
