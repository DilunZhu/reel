import { useState } from 'react'
import { formatDate } from '../utils/api'
import { getAiredCount, getTotalEpisodes, getShowColor, getCurrentSeason } from '../utils/helpers'

export default function EpisodeList({ show }) {
  if (!show || !show._embedded || !show._embedded.episodes) return null

  const episodes = show._embedded.episodes
    .filter(ep => ep.airstamp || ep.airdate)
    .sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season
      return (a.number || 0) - (b.number || 0)
    })

  const aired = getAiredCount(show)
  const total = getTotalEpisodes(show)
  const color = getShowColor(show)
  const currentSeason = getCurrentSeason(show)

  const episodesBySeason = episodes.reduce((acc, ep) => {
    const s = ep.season || 0
    if (!acc[s]) acc[s] = []
    acc[s].push(ep)
    return acc
  }, {})

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b)
  const [selectedSeason, setSelectedSeason] = useState(currentSeason !== null ? currentSeason : (seasons[0] || 0))

  const displayedSeasons = selectedSeason !== null && episodesBySeason[selectedSeason]
    ? [selectedSeason]
    : seasons

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            已播出进度
          </span>
          <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
            {aired} / {total} 集
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
        }}>
          {Array.from({ length: Math.min(total, 60) }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 14,
                borderRadius: 2,
                background: i < aired ? color : 'var(--bg-tertiary)',
                transition: 'background 0.3s',
              }}
            />
          ))}
          {total > 60 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
              +{total - 60}
            </span>
          )}
        </div>
      </div>

      {/* Season Selector */}
      {seasons.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>选择季:</span>
            {seasons.map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: selectedSeason === season ? 600 : 400,
                  background: selectedSeason === season ? `${color}20` : 'var(--bg-tertiary)',
                  color: selectedSeason === season ? color : 'var(--text-secondary)',
                  border: `1px solid ${selectedSeason === season ? color : 'var(--border)'}`,
                  transition: 'all 0.2s',
                }}
              >
                第 {season} 季
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episodes by selected season(s) */}
      {displayedSeasons.map(season => (
        <div key={season} style={{ marginBottom: 20 }}>
          <h4 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontStyle: 'italic',
            color: 'var(--accent)',
            marginBottom: 12,
          }}>
            第 {season} 季
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {episodesBySeason[season].map(ep => {
              const isAired = ep.airstamp && new Date(ep.airstamp) <= new Date()
              return (
                <div
                  key={ep.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isAired ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    border: `1px solid ${isAired ? color + '20' : 'var(--border)'}`,
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isAired ? color : 'var(--text-muted)',
                    minWidth: 44,
                  }}>
                    E{String(ep.number || 0).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: isAired ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {ep.name || '未命名'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDate(ep.airdate || ep.airstamp)}
                      {ep.runtime && ` · ${ep.runtime}分钟`}
                    </div>
                  </div>
                  {isAired && (
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: `${color}18`,
                      color,
                      fontWeight: 500,
                    }}>
                      已播出
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
