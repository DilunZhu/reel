import { useParams, Link } from 'react-router-dom'
import { useShowDetail } from '../hooks/useTVmaze'
import { useFollowing } from '../hooks/useFollowing'
import EpisodeList from '../components/EpisodeList'
import { toast } from '../components/Toast'
import { getImageUrl, formatDate } from '../utils/api'
import { getShowColor, getNextEpisode, getAiredCount, getTotalEpisodes } from '../utils/helpers'

export default function ShowDetailPage() {
  const { id } = useParams()
  const { show, loading, error } = useShowDetail(id)
  const { isFollowing, toggleFollowing } = useFollowing()

  const followed = show ? isFollowing(show.id) : false

  const handleFollow = () => {
    if (!show) return
    const added = toggleFollowing(show)
    toast(added ? `已关注「${show.name}」` : `已取消关注「${show.name}」`, added ? 'success' : 'info')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 0.8s linear infinite',
        }} />
        加载中...
      </div>
    )
  }

  if (error || !show) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--danger)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        </div>
        <p>{error || '无法加载内容'}</p>
        <Link to="/" style={{ marginTop: 16, display: 'inline-block' }}>
          &larr; 返回发现页
        </Link>
      </div>
    )
  }

  const imageUrl = getImageUrl(show, 'original')
  const color = getShowColor(show)
  const nextEp = getNextEpisode(show)
  const aired = getAiredCount(show)
  const total = getTotalEpisodes(show)

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        height: 'clamp(280px, 40vw, 420px)',
        overflow: 'hidden',
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={show.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.35)',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--bg-secondary)',
          }} />
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 24px 32px',
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-end' }}>
            {/* Poster */}
            <div style={{
              width: 'clamp(120px, 18vw, 180px)',
              aspectRatio: '2/3',
              borderRadius: 12,
              overflow: 'hidden',
              border: '2px solid var(--border)',
              flexShrink: 0,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {getImageUrl(show) ? (
                <img src={getImageUrl(show)} alt={show.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: `${color}18`,
                  color,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {show.type || 'Unknown'}
                </span>
                {show.status && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    {show.status}
                  </span>
                )}
                {show.rating && show.rating.average && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    {show.rating.average}
                  </span>
                )}
              </div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: 8,
              }}>
                {show.name}
              </h1>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                fontSize: 14,
                color: 'var(--text-secondary)',
                marginBottom: 16,
              }}>
                {show.premiered && <span>首播: {formatDate(show.premiered)}</span>}
                {show.language && <span>语言: {show.language}</span>}
                {show.network && show.network.name && <span>平台: {show.network.name}</span>}
                {show.runtime && <span>时长: {show.runtime}分钟</span>}
                {show.genres && show.genres.length > 0 && <span>类型: {show.genres.join(', ')}</span>}
              </div>
              <button
                onClick={handleFollow}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  background: followed ? 'var(--bg-tertiary)' : 'var(--accent)',
                  color: followed ? 'var(--text-secondary)' : '#000',
                  border: `2px solid ${followed ? 'var(--border)' : 'var(--accent)'}`,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={followed ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {followed ? '已关注' : '添加关注'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Summary */}
        {show.summary && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 28,
            border: '1px solid var(--border)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 18,
              fontStyle: 'italic',
              color: 'var(--accent)',
              marginBottom: 10,
            }}>
              简介
            </h2>
            <div
              style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: show.summary }}
            />
          </div>
        )}

        {/* Next Episode Card */}
        {nextEp && (
          <div style={{
            background: `linear-gradient(135deg, ${color}10, var(--bg-secondary))`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 28,
            border: `1px solid ${color}30`,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 18,
                  fontStyle: 'italic',
                  color: color,
                  marginBottom: 8,
                }}>
                  下集预告
                </h2>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {nextEp.name || 'New Episode'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  第 {nextEp.season} 季 第 {nextEp.number} 集
                </div>
                <div style={{ fontSize: 14, color: 'var(--accent)', marginTop: 6, fontWeight: 500 }}>
                  {formatDate(nextEp.airstamp)}
                  {nextEp.runtime && ` · ${nextEp.runtime}分钟`}
                </div>
              </div>
              <div style={{
                textAlign: 'right',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  总进度
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {aired} / {total}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Episodes */}
        <EpisodeList show={show} />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
