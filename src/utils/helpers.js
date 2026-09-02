export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getProgressBlocks(watched, total) {
  if (!total || total <= 0) return { filled: 0, total: 10 }
  const filled = Math.min(watched, total)
  return { filled, total }
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

export function groupByWeekStatus(shows) {
  const thisWeek = []
  const upcoming = []
  const noUpdate = []
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  for (const show of shows) {
    const nextEp = getNextEpisode(show)
    if (nextEp && nextEp.airstamp) {
      const airDate = new Date(nextEp.airstamp)
      if (airDate >= now && airDate <= weekEnd) {
        thisWeek.push(show)
        continue
      }
      // Has a next episode but beyond this week
      upcoming.push(show)
      continue
    }
    // No next episode (ended or no episode data)
    noUpdate.push(show)
  }

  return { thisWeek, upcoming, noUpdate }
}

export function getNextEpisode(show) {
  if (!show || !show._embedded || !show._embedded.episodes) return null
  const now = new Date()
  const eps = show._embedded.episodes
    .filter(ep => ep.airstamp)
    .sort((a, b) => new Date(a.airstamp) - new Date(b.airstamp))
  return eps.find(ep => new Date(ep.airstamp) >= now) || eps[eps.length - 1] || null
}

export function getLastEpisode(show) {
  if (!show || !show._embedded || !show._embedded.episodes) return null
  const eps = show._embedded.episodes
    .filter(ep => ep.airstamp)
    .sort((a, b) => new Date(a.airstamp) - new Date(b.airstamp))
  const now = new Date()
  for (let i = eps.length - 1; i >= 0; i--) {
    if (new Date(eps[i].airstamp) <= now) return eps[i]
  }
  return eps[0] || null
}

export function getAiredCount(show) {
  if (!show || !show._embedded || !show._embedded.episodes) return 0
  const now = new Date()
  return show._embedded.episodes.filter(ep => ep.airstamp && new Date(ep.airstamp) <= now).length
}

export function getTotalEpisodes(show) {
  if (!show || !show._embedded || !show._embedded.episodes) return 0
  return show._embedded.episodes.length
}

export function getShowColor(show) {
  if (!show || !show.id) return '#e09f3e'
  const colors = ['#e09f3e', '#d4734c', '#c96b5e', '#b873a8', '#7b8cc7', '#5ca8a8', '#6db86d', '#a8b85c']
  return colors[Math.abs(show.id) % colors.length]
}

/**
 * Determine the "current" season for a show.
 * Priority:
 * 1. Season containing the next upcoming episode
 * 2. Season of the most recently aired episode
 * 3. Last season available
 */
export function getCurrentSeason(show) {
  if (!show || !show._embedded || !show._embedded.episodes) return null

  const eps = show._embedded.episodes
    .filter(ep => ep.airstamp || ep.airdate)
    .sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season
      return (a.number || 0) - (b.number || 0)
    })

  if (eps.length === 0) return null

  const now = new Date()

  // Find season with next upcoming episode
  for (const ep of eps) {
    if (ep.airstamp && new Date(ep.airstamp) >= now) {
      return ep.season
    }
  }

  // Find season of most recently aired episode
  for (let i = eps.length - 1; i >= 0; i--) {
    if (eps[i].airstamp && new Date(eps[i].airstamp) <= now) {
      return eps[i].season
    }
  }

  // Fallback: last season
  return eps[eps.length - 1].season
}
