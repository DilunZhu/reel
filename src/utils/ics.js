function escapeIcs(str) {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

function wrapIcsLine(line, maxLen = 75) {
  if (line.length <= maxLen) return line
  const parts = []
  let i = 0
  while (i < line.length) {
    const chunk = line.slice(i, i + maxLen)
    parts.push(i === 0 ? chunk : ' ' + chunk)
    i += maxLen
  }
  return parts.join('\r\n')
}

function toIcsDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function toIcsDateTime(dateStr, timeStr = '20:00') {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  d.setUTCHours(h, m, 0, 0)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hour = String(d.getUTCHours()).padStart(2, '0')
  const minute = String(d.getUTCMinutes()).padStart(2, '0')
  const second = String(d.getUTCSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hour}${minute}${second}Z`
}

function generateUID(prefix, id, dateStr) {
  return `${prefix}-${id}-${dateStr}@reel-app`
}

export function generateICS(shows) {
  const lines = []
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Reel//TV Show Tracker//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push('X-WR-CALNAME:Reel 剧集更新')
  lines.push('X-WR-TIMEZONE:UTC')

  for (const show of shows) {
    if (!show || !show._embedded || !show._embedded.episodes) continue
    const episodes = show._embedded.episodes
    for (const ep of episodes) {
      if (!ep.airstamp) continue
      const dtStart = toIcsDateTime(ep.airstamp)
      if (!dtStart) continue
      const dtEnd = toIcsDateTime(ep.airstamp)
      const uid = generateUID('ep', ep.id, ep.airstamp)
      const summary = `${escapeIcs(show.name)} S${String(ep.season).padStart(2, '0')}E${String(ep.number).padStart(2, '0')}: ${escapeIcs(ep.name || 'New Episode')}`
      const description = escapeIcs(`剧集: ${show.name}\n季: ${ep.season}\n集: ${ep.number}\n标题: ${ep.name || 'N/A'}\n${show.summary ? show.summary.replace(/<[^>]+>/g, '') : ''}`)

      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${uid}`)
      lines.push(`DTSTART:${dtStart}`)
      lines.push(`DTEND:${dtEnd}`)
      lines.push(`SUMMARY:${summary}`)
      lines.push(`DESCRIPTION:${description}`)
      if (show.image && show.image.original) {
        lines.push(`URL:${escapeIcs(show.url || show.image.original)}`)
      }
      lines.push('END:VEVENT')
    }
  }

  lines.push('END:VCALENDAR')
  return lines.map(l => wrapIcsLine(l)).join('\r\n')
}

export function downloadICS(content, filename = 'reel-calendar.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function generateStaticICS(shows) {
  return generateICS(shows)
}
