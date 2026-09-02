import { useState } from 'react'
import { formatDateShort } from '../utils/api'
import { getShowColor, getAiredCount, getTotalEpisodes } from '../utils/helpers'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarMonth({ shows, currentDate, onDateChange }) {
  const [tooltip, setTooltip] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const prevMonthDays = new Date(year, month, 0).getDate()
  const days = []

  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, currentMonth: false })
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push({ date: i, currentMonth: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: i, currentMonth: false })
  }

  const getEventsForDay = (dayNum) => {
    const events = []
    const date = new Date(year, month, dayNum)
    for (const show of shows) {
      if (!show._embedded || !show._embedded.episodes) continue
      for (const ep of show._embedded.episodes) {
        if (!ep.airstamp) continue
        const epDate = new Date(ep.airstamp)
        if (
          epDate.getFullYear() === date.getFullYear() &&
          epDate.getMonth() === date.getMonth() &&
          epDate.getDate() === date.getDate()
        ) {
          events.push({ show, episode: ep })
        }
      }
    }
    return events.sort((a, b) => new Date(a.episode.airstamp) - new Date(b.episode.airstamp))
  }

  const today = new Date()
  const isToday = (dayNum) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === dayNum
    )
  }

  return (
    <div>
      {/* Week header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
        marginBottom: 8,
      }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            padding: '6px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {days.map((day, idx) => {
          const events = day.currentMonth ? getEventsForDay(day.date) : []
          const todayFlag = day.currentMonth && isToday(day.date)
          return (
            <div
              key={idx}
              style={{
                minHeight: 80,
                borderRadius: 8,
                background: todayFlag ? 'rgba(224,159,62,0.06)' : day.currentMonth ? 'var(--bg-secondary)' : 'transparent',
                border: `1px solid ${todayFlag ? 'var(--accent)40' : day.currentMonth ? 'var(--border)' : 'transparent'}`,
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                opacity: day.currentMonth ? 1 : 0.3,
              }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: todayFlag ? 700 : 500,
                color: todayFlag ? 'var(--accent)' : day.currentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'right',
                marginBottom: 4,
              }}>
                {day.date}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {events.slice(0, 3).map((ev, i) => {
                  const color = getShowColor(ev.show)
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: `${color}18`,
                        borderLeft: `2px solid ${color}`,
                        fontSize: 10,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      onMouseEnter={e => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          show: ev.show,
                          episode: ev.episode,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {ev.show.name}
                    </div>
                  )
                })}
                {events.length > 3 && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 4 }}>
                    +{events.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y - 8,
          transform: 'translate(-50%, -100%)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 14,
          minWidth: 220,
          maxWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 10001,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            {tooltip.show.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {tooltip.episode.name || 'New Episode'} — S{tooltip.episode.season}E{tooltip.episode.number}
          </div>
          <div style={{ fontSize: 12, color: 'var(--accent)' }}>
            {formatDateShort(tooltip.episode.airstamp)}
            {tooltip.episode.runtime && ` · ${tooltip.episode.runtime}分钟`}
          </div>
          {tooltip.show._embedded && tooltip.show._embedded.episodes && (
            <div style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}>
              总进度: {getAiredCount(tooltip.show)} / {getTotalEpisodes(tooltip.show)} 集
            </div>
          )}
        </div>
      )}
    </div>
  )
}
