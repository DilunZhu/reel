import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFollowing } from '../hooks/useFollowing'
import { getImageUrl, formatDateShort } from '../utils/api'
import { getShowColor, getNextEpisode, getDaysUntil, getAiredCount, getTotalEpisodes } from '../utils/helpers'
import { toast } from '../components/Toast'

const SORT_OPTIONS = [
  { key: 'added', label: '添加时间' },
  { key: 'name', label: '名称' },
  { key: 'nextAir', label: '下次播出' },
]

export default function FollowingPage() {
  const { following, removeFollowing, exportFollowing, importFollowing } = useFollowing()
  const [sortBy, setSortBy] = useState('added')
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  const sortedFollowing = useMemo(() => {
    const arr = [...following]
    if (sortBy === 'name') {
      arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'nextAir') {
      arr.sort((a, b) => {
        const na = getNextEpisode(a)
        const nb = getNextEpisode(b)
        if (!na || !na.airstamp) return 1
        if (!nb || !nb.airstamp) return -1
        return new Date(na.airstamp) - new Date(nb.airstamp)
      })
    } else {
      arr.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0))
    }
    return arr
  }, [following, sortBy])

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const thisWeek = []
  const upcoming = []
  const noUpdate = []

  for (const show of sortedFollowing) {
    const nextEp = getNextEpisode(show)
    if (nextEp && nextEp.airstamp) {
      const airDate = new Date(nextEp.airstamp)
      if (airDate >= now && airDate <= weekEnd) {
        thisWeek.push(show)
        continue
      }
      // Next episode exists but beyond this week
      upcoming.push(show)
      continue
    }
    // No next episode data
    noUpdate.push(show)
  }

  const handleExport = () => {
    const data = exportFollowing()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reel-following-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('关注列表已导出', 'success')
  }

  const handleImport = () => {
    if (!importText.trim()) return
    const ok = importFollowing(importText.trim())
    if (ok) {
      toast('关注列表导入成功', 'success')
      setImportText('')
      setShowImport(false)
    } else {
      toast('导入失败，请检查文件格式', 'error')
    }
  }

  // Export watchlist.json content: the plain ID array the repo's watchlist.json
  // expects. Copies to clipboard first (paste directly into GitHub's web editor);
  // falls back to a file download when clipboard is unavailable.
  const handleExportWatchlist = async () => {
    const ids = following.map(s => s.id)
    const data = JSON.stringify(ids, null, 2)
    try {
      await navigator.clipboard.writeText(data)
      toast('watchlist.json 内容已复制，可直接粘贴到 GitHub 仓库', 'success')
    } catch {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'watchlist.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast('已下载 watchlist.json，内容可直接粘贴到 GitHub 仓库', 'success')
    }
  }

  const renderShowItem = (show) => {
    const nextEp = getNextEpisode(show)
    const color = getShowColor(show)
    const days = nextEp && nextEp.airstamp ? getDaysUntil(nextEp.airstamp) : null
    const aired = getAiredCount(show)
    const total = getTotalEpisodes(show)
    const imageUrl = getImageUrl(show)

    return (
      <div
        key={show.id}
        style={{
          display: 'flex',
          gap: 16,
          padding: 16,
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${color}40`
          e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2)`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <Link to={`/show/${show.id}`} style={{ flexShrink: 0 }}>
          <div style={{
            width: 80,
            aspectRatio: '2/3',
            borderRadius: 8,
            overflow: 'hidden',
            background: 'var(--bg-tertiary)',
          }}>
            {imageUrl ? (
              <img src={imageUrl} alt={show.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
                </svg>
              </div>
            )}
          </div>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/show/${show.id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 17,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              marginBottom: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {show.name}
            </h3>
          </Link>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 8,
          }}>
            <span style={{ padding: '2px 8px', borderRadius: 4, background: `${color}15`, color, fontWeight: 500 }}>
              {show.type || 'Unknown'}
            </span>
            {show.status && <span>{show.status}</span>}
            {aired > 0 && total > 0 && <span>{aired}/{total} 集</span>}
          </div>
          {nextEp && nextEp.airstamp && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                S{nextEp.season}E{nextEp.number}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formatDateShort(nextEp.airstamp)}
              </span>
              {days !== null && days >= 0 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: days <= 3 ? 'rgba(201,76,76,0.15)' : 'rgba(92,168,92,0.15)',
                  color: days <= 3 ? 'var(--danger)' : 'var(--success)',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {days === 0 ? '今天' : days === 1 ? '明天' : `${days}天后`}
                </span>
              )}
            </div>
          )}
          {!nextEp && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              暂无播出信息
            </div>
          )}
        </div>
        <button
          onClick={() => {
            removeFollowing(show.id)
            toast(`已取消关注「${show.name}」`, 'info')
          }}
          style={{
            alignSelf: 'flex-start',
            padding: '6px 12px',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            fontSize: 12,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--danger)'
            e.currentTarget.style.borderColor = 'var(--danger)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          取消关注
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
        }}>
          我的关注
        </h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ fontSize: 13, padding: '6px 10px' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontSize: 13,
            }}
          >
            导出 JSON
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontSize: 13,
            }}
          >
            导入
          </button>
          <button
            onClick={handleExportWatchlist}
            title="导出 watchlist.json 所需的 ID 数组，可直接粘贴到 GitHub 仓库"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#000',
              border: '1px solid var(--accent)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            导出 watchlist.json
          </button>
        </div>
      </div>

      {showImport && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          border: '1px solid var(--border)',
        }}>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="粘贴导出的JSON内容..."
            rows={4}
            style={{
              width: '100%',
              marginBottom: 10,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleImport}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: '#000',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              确认导入
            </button>
            <button
              onClick={() => { setShowImport(false); setImportText('') }}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {following.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 80,
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, marginBottom: 8 }}>还没有关注任何内容</p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>去发现页搜索并添加你喜爱的剧集和电影</p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {thisWeek.length > 0 && (
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontStyle: 'italic',
                color: 'var(--accent)',
                marginBottom: 12,
              }}>
                本周更新 ({thisWeek.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {thisWeek.map(renderShowItem)}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                marginBottom: 12,
              }}>
                即将更新 ({upcoming.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcoming.map(renderShowItem)}
              </div>
            </div>
          )}
          {noUpdate.length > 0 && (
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontStyle: 'italic',
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}>
                暂无更新 / 已完结 ({noUpdate.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {noUpdate.map(renderShowItem)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
