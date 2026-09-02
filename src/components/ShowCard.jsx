import { Link } from 'react-router-dom'
import { getImageUrl, formatDateShort } from '../utils/api'
import { getShowColor } from '../utils/helpers'

export default function ShowCard({ show, following, onToggleFollow }) {
  const imageUrl = getImageUrl(show)
  const color = getShowColor(show)
  const isFollowed = following && following.some(s => s.id === show.id)

  const handleFollow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFollow) onToggleFollow(show)
  }

  return (
    <Link
      to={`/show/${show.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${color}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        position: 'relative',
        aspectRatio: '2/3',
        background: 'var(--bg-tertiary)',
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
              transition: 'transform 0.3s',
            }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 40,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
            </svg>
          </div>
        )}
        <button
          onClick={handleFollow}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isFollowed ? 'var(--accent)' : 'rgba(0,0,0,0.5)',
            color: isFollowed ? '#000' : '#fff',
            border: `2px solid ${isFollowed ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)',
          }}
          title={isFollowed ? '取消关注' : '添加关注'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFollowed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
        {show.premiered && (
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            padding: '4px 10px',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            fontSize: 12,
            color: '#fff',
          }}>
            {formatDateShort(show.premiered)}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.3,
          marginBottom: 6,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {show.name}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: `${color}18`,
            color,
            fontWeight: 500,
            fontSize: 11,
          }}>
            {show.type || 'Unknown'}
          </span>
          {show.rating && show.rating.average && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {show.rating.average}
            </span>
          )}
          {show.language && (
            <span>{show.language}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
