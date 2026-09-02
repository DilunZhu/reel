import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearch } from '../hooks/useTVmaze'
import { useFollowing } from '../hooks/useFollowing'
import ShowCard from '../components/ShowCard'
import { toast } from '../components/Toast'

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'show', label: '剧集' },
  { key: 'movie', label: '电影' },
]

export default function DiscoverPage() {
  const { query, setQuery, results, loading, error } = useSearch()
  const { following, toggleFollowing } = useFollowing()
  const [activeFilter, setActiveFilter] = useState('all')

  const handleToggleFollow = (show) => {
    const added = toggleFollowing(show)
    toast(added ? `已关注「${show.name}」` : `已取消关注「${show.name}」`, added ? 'success' : 'info')
  }

  const filteredResults = results.filter(show => {
    if (activeFilter === 'all') return true
    const type = (show.type || '').toLowerCase()
    if (activeFilter === 'show') {
      return type.includes('scripted') || type.includes('reality') || type.includes('talk') || type.includes('animation') || type.includes('documentary')
    }
    if (activeFilter === 'movie') {
      return type.includes('movie')
    }
    return true
  })

  const isSearching = query.trim().length >= 2

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero Search */}
      <div style={{
        textAlign: 'center',
        marginBottom: 36,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          marginBottom: 8,
          letterSpacing: 1,
        }}>
          发现好剧
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 16,
          marginBottom: 28,
        }}>
          搜索并关注你喜爱的剧集和电影，不错过任何更新
        </p>
        <div style={{
          position: 'relative',
          maxWidth: 560,
          margin: '0 auto',
        }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索剧集、电影..."
            style={{
              width: '100%',
              padding: '14px 20px 14px 48px',
              fontSize: 16,
              borderRadius: 12,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          <span style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 20,
            color: 'var(--text-muted)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: 18,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 28,
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: activeFilter === f.key ? 600 : 400,
              background: activeFilter === f.key ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeFilter === f.key ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${activeFilter === f.key ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }} />
          搜索中...
        </div>
      )}

      {error && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: 'var(--danger)',
          background: 'var(--bg-secondary)',
          borderRadius: 12,
        }}>
          搜索出错: {error}
        </div>
      )}

      {!loading && !error && filteredResults.length === 0 && isSearching && (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: 'var(--text-muted)',
        }}>
          未找到匹配结果
        </div>
      )}

      {!loading && !error && !isSearching && (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: 'var(--text-muted)',
        }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>输入关键词开始搜索</p>
          <p style={{ fontSize: 14 }}>支持剧名、演员、类型等关键词</p>
        </div>
      )}

      {!loading && !error && filteredResults.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 20,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
            }}>
              搜索结果 ({filteredResults.length})
            </h2>
            {following.length > 0 && (
              <Link
                to="/following"
                style={{
                  fontSize: 14,
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                我的关注 ({following.length}) &rarr;
              </Link>
            )}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
          }}>
            {filteredResults.map(show => (
              <ShowCard
                key={show.id}
                show={show}
                following={following}
                onToggleFollow={handleToggleFollow}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
