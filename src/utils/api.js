const BASE_URL = 'https://api.tvmaze.com'

const cache = new Map()

async function fetchWithCache(url, ttlMinutes = 60) {
  const key = url
  const cached = cache.get(key)
  if (cached && Date.now() - cached.time < ttlMinutes * 60 * 1000) {
    return cached.data
  }
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    const data = await res.json()
    cache.set(key, { data, time: Date.now() })
    return data
  } catch (err) {
    console.warn('TVmaze API fetch failed:', url, err.message)
    throw err
  }
}

export async function searchShows(query) {
  if (!query || query.trim().length < 2) return []
  const data = await fetchWithCache(`${BASE_URL}/search/shows?q=${encodeURIComponent(query.trim())}`, 5)
  return data.map(item => item.show) || []
}

export async function getShow(id) {
  return fetchWithCache(`${BASE_URL}/shows/${id}?embed[]=episodes`, 60)
}

export async function getEpisodes(showId) {
  return fetchWithCache(`${BASE_URL}/shows/${showId}/episodes`, 60)
}

export async function getSchedule(country = 'US', date) {
  const d = date || new Date().toISOString().slice(0, 10)
  return fetchWithCache(`${BASE_URL}/schedule?country=${country}&date=${d}`, 15)
}

export function getImageUrl(show, size = 'medium') {
  if (!show || !show.image) return null
  if (size === 'original') return show.image.original
  return show.image.medium
}

export function formatDate(dateStr) {
  if (!dateStr) return '待定'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '待定'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function isMovie(show) {
  return show && show.type && show.type.toLowerCase().includes('movie')
}

export function isShow(show) {
  return show && show.type && (show.type.toLowerCase().includes('scripted') || show.type.toLowerCase().includes('reality') || show.type.toLowerCase().includes('talk') || show.type.toLowerCase().includes('animation'))
}
