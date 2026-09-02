import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getShow } from '../utils/api'

const STORAGE_KEY = 'reel_following'
const GITHUB_TOKEN_KEY = 'reel_github_token'

export function useFollowing() {
  const [following, setFollowing, clearFollowing] = useLocalStorage(STORAGE_KEY, [])
  const [githubToken, setGithubToken] = useLocalStorage(GITHUB_TOKEN_KEY, '')

  const isFollowing = useCallback((showId) => {
    return following.some(s => s.id === showId)
  }, [following])

  const addFollowing = useCallback((show) => {
    setFollowing(prev => {
      if (prev.some(s => s.id === show.id)) return prev
      return [...prev, { id: show.id, addedAt: new Date().toISOString(), ...show }]
    })
    // Backfill full data (incl. _embedded.episodes) when the show object
    // comes from search results, which lack episode data. Without this,
    // the calendar and "next episode" grouping silently skip the show.
    if (!show._embedded || !show._embedded.episodes) {
      getShow(show.id)
        .then(full => {
          setFollowing(prev => prev.map(s =>
            s.id === show.id ? { ...s, ...full, addedAt: s.addedAt } : s
          ))
        })
        .catch(() => {
          // keep partial data if the backfill fails; user can still unfollow/refollow
        })
    }
  }, [setFollowing])

  const removeFollowing = useCallback((showId) => {
    setFollowing(prev => prev.filter(s => s.id !== showId))
  }, [setFollowing])

  const toggleFollowing = useCallback((show) => {
    if (isFollowing(show.id)) {
      removeFollowing(show.id)
      return false
    } else {
      addFollowing(show)
      return true
    }
  }, [isFollowing, addFollowing, removeFollowing])

  const exportFollowing = useCallback(() => {
    return JSON.stringify(following, null, 2)
  }, [following])

  const importFollowing = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr)
      if (Array.isArray(data)) {
        setFollowing(data)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [setFollowing])

  const getWatchlistIds = useCallback(() => {
    return following.map(s => s.id)
  }, [following])

  const syncToGitHub = useCallback(async (owner, repo) => {
    const token = githubToken
    if (!token) {
      throw new Error('未配置 GitHub Token，请先在设置中保存')
    }
    if (!owner || !repo) {
      throw new Error('缺少仓库 owner 或 repo 名称')
    }

    const ids = getWatchlistIds()
    const content = JSON.stringify(ids, null, 2)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/watchlist.json`

    // Get current file SHA (if exists)
    let sha = null
    try {
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      })
      if (res.ok) {
        const data = await res.json()
        sha = data.sha
      }
    } catch {
      // File may not exist yet
    }

    const body = {
      message: 'Update watchlist from Reel app',
      content: Buffer.from(content).toString('base64'),
    }
    if (sha) {
      body.sha = sha
    }

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || `GitHub API 错误: ${res.status}`)
    }

    return true
  }, [githubToken, getWatchlistIds])

  // Self-heal on mount: backfill any followed shows that are missing episode
  // data (e.g. followed from search results before this fix existed), so the
  // calendar and update grouping work for existing users without re-following.
  useEffect(() => {
    if (following.length === 0) return
    const incomplete = following.filter(s => !s._embedded || !s._embedded.episodes)
    if (incomplete.length === 0) return
    for (const show of incomplete) {
      getShow(show.id)
        .then(full => {
          setFollowing(prev => prev.map(s =>
            s.id === show.id ? { ...s, ...full, addedAt: s.addedAt } : s
          ))
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    following,
    isFollowing,
    addFollowing,
    removeFollowing,
    toggleFollowing,
    exportFollowing,
    importFollowing,
    clearFollowing,
    getWatchlistIds,
    githubToken,
    setGithubToken,
    syncToGitHub,
  }
}
