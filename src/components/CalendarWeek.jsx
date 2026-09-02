import { useState } from 'react'
import { formatDateShort } from '../utils/api'
import { getShowColor, getNextEpisode, getAiredCount, getTotalEpisodes } from '../utils/helpers'

const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function CalendarWeek({ shows, currentDate, onDateChange }) {
  const [tooltip, setTooltip] = useState(null)

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })

  const getEventsForDay = (date) => {
    const events = []
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
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 8,
      }}>
        {weekDays.map((day, idx) => {
          const isToday = day.getTime() === today.getTime()
          const events = getEventsForDay(day)
          return (
            <div
              key={idx}
              style={{
                minHeight: 180,
                borderRadius: 10,
                background: isToday ? 'rgba(224,159,62,0.06)' : 'var(--bg-secondary)',
                border: `1px solid ${isToday ? 'var(--accent)40' : 'var(--border)'}`,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  fontSize: 11,
                  color: isToday ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {DAYS[day.getDay()]}
                </div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                  marginTop: 2,
                }}>
                  {day.getDate()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                {events.map((ev, i) => {
                  const color = getShowColor(ev.show)
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 6,
                        background: `${color}15`,
                        borderLeft: `3px solid ${color}`,
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          show: ev.show,
                          episode: ev.episode,
                        })
                        e.currentTarget.style.background = `${color}30`
                      }}
                      onMouseLeave={e => {
                        setTooltip(null)
                        e.currentTarget.style.background = `${color}15`
                      }}
                    >
                      <div style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {ev.show.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 1 }}>
                        S{ev.episode.season}E{ev.episode.number}
                      </div>
                    </div>
                  )
                })}
                {events.length === 0 && (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 11,
                  }}>
                    无更新
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
