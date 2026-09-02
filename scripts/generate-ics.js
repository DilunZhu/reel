import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WATCHLIST_PATH = path.join(__dirname, '..', 'watchlist.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'dist', 'reel-calendar.ics');
const BASE_URL = 'https://api.tvmaze.com';
const DAYS_AHEAD = 30;
const RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_DELAY_MS = 500;

function escapeIcs(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function wrapIcsLine(line, maxLen = 75) {
  if (line.length <= maxLen) return line;
  const parts = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + maxLen);
    parts.push(i === 0 ? chunk : ' ' + chunk);
    i += maxLen;
  }
  return parts.join('\r\n');
}

function toIcsDateTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const year = String(d.getUTCFullYear());
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  const second = String(d.getUTCSeconds()).padStart(2, '0');
  return year + month + day + 'T' + hour + minute + second + 'Z';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`Fetch failed (attempt ${attempt}/${retries}): ${url} — ${err.message}`);
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt);
      } else {
        throw err;
      }
    }
  }
}

async function fetchShowWithEpisodes(showId) {
  const url = `${BASE_URL}/shows/${showId}?embed[]=episodes`;
  const data = await fetchWithRetry(url);
  return data;
}

function getUpcomingEpisodes(show, daysAhead = DAYS_AHEAD) {
  if (!show || !show._embedded || !show._embedded.episodes) return [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  const eps = show._embedded.episodes.filter(ep => {
    if (!ep.airstamp) return false;
    const airDate = new Date(ep.airstamp);
    return airDate >= now && airDate <= cutoff;
  });

  return eps.sort((a, b) => new Date(a.airstamp) - new Date(b.airstamp));
}

function generatePlaceholderEvent() {
  const lines = [];
  const now = new Date();
  const nowStr = toIcsDateTime(now.toISOString());
  lines.push('BEGIN:VEVENT');
  lines.push('UID:refresh-note@reel-app');
  lines.push('DTSTART:' + nowStr);
  lines.push('DTEND:' + nowStr);
  lines.push('SUMMARY:' + escapeIcs('Reel Calendar 已更新'));
  lines.push('DESCRIPTION:' + escapeIcs('此ICS文件由Reel应用自动生成。\n请通过Reel应用添加关注的剧集以获取个性化日历更新。\n将关注列表同步到 watchlist.json 后，GitHub Actions 会生成真实追剧日程。'));
  lines.push('END:VEVENT');
  return lines;
}

async function main() {
  // Ensure dist directory exists
  const distDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Read watchlist
  let watchlist = [];
  try {
    const raw = fs.readFileSync(WATCHLIST_PATH, 'utf-8');
    watchlist = JSON.parse(raw);
    if (!Array.isArray(watchlist)) {
      console.warn('watchlist.json is not an array, using empty watchlist');
      watchlist = [];
    }
  } catch (err) {
    console.warn('Could not read watchlist.json, using empty watchlist:', err.message);
    watchlist = [];
  }

  console.log(`Watchlist contains ${watchlist.length} show(s)`);

  // Fetch shows
  const shows = [];
  for (const showId of watchlist) {
    try {
      const show = await fetchShowWithEpisodes(showId);
      shows.push(show);
      console.log(`Fetched: ${show.name} (id=${showId})`);
    } catch (err) {
      console.error(`Failed to fetch show ${showId}:`, err.message);
    }
    // Rate limit protection
    await sleep(REQUEST_DELAY_MS);
  }

  // Build ICS
  const lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Reel//TV Show Tracker//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('X-WR-CALNAME:Reel 剧集更新');
  lines.push('X-WR-TIMEZONE:UTC');

  let eventCount = 0;

  for (const show of shows) {
    const upcomingEps = getUpcomingEpisodes(show);
    for (const ep of upcomingEps) {
      const dtStart = toIcsDateTime(ep.airstamp);
      if (!dtStart) continue;

      // Approximate end time (start + runtime, default 60 min)
      const runtime = ep.runtime || 60;
      const startDate = new Date(ep.airstamp);
      const endDate = new Date(startDate.getTime() + runtime * 60000);
      const dtEnd = toIcsDateTime(endDate.toISOString());

      const uid = `ep-${ep.id}-${ep.airstamp}@reel-app`;
      const summary = escapeIcs(show.name) + '丨S' + ep.season + 'E' + ep.number;

      // Line 1: episode title丨runtime (minutes)
      const runtimeMin = ep.runtime || show.runtime || null;
      const line1 = runtimeMin
        ? `${ep.name || show.name}丨${runtimeMin}分钟`
        : (ep.name || show.name);

      // Line 2: season progress bar — this episode's position within its season
      const seasonEps = (show._embedded.episodes || []).filter(e => e.season === ep.season);
      const seasonTotal = seasonEps.length;
      const epNumber = ep.number || 0;
      let line2 = '';
      if (seasonTotal > 0 && epNumber > 0) {
        const filled = Math.min(epNumber, seasonTotal);
        const bar = '■'.repeat(filled) + '□'.repeat(seasonTotal - filled);
        line2 = `${bar} ${filled}/${seasonTotal}`;
      }

      const description = escapeIcs(line2 ? `${line1}\n${line2}` : line1);

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push(`SUMMARY:${summary}`);
      lines.push(`DESCRIPTION:${description}`);
      if (show.url) {
        lines.push(`URL:${escapeIcs(show.url)}`);
      }
      lines.push('END:VEVENT');
      eventCount++;
    }
  }

  // If no events, add placeholder
  if (eventCount === 0) {
    lines.push(...generatePlaceholderEvent());
    console.log('No upcoming episodes found, generated placeholder event');
  } else {
    console.log(`Generated ${eventCount} event(s)`);
  }

  lines.push('END:VCALENDAR');

  const content = lines.map(l => wrapIcsLine(l)).join('\r\n');
  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`ICS file written to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('ICS generation failed:', err);
  // Do not delete existing ICS on failure — write a placeholder to avoid breaking the site
  try {
    const distDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    const lines = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//Reel//TV Show Tracker//EN');
    lines.push('CALSCALE:GREGORIAN');
    lines.push('METHOD:PUBLISH');
    lines.push('X-WR-CALNAME:Reel 剧集更新');
    lines.push('X-WR-TIMEZONE:UTC');
    lines.push(...generatePlaceholderEvent());
    lines.push('END:VCALENDAR');
    const content = lines.map(l => wrapIcsLine(l)).join('\r\n');
    fs.writeFileSync(OUTPUT_PATH, content);
    console.log('Fallback placeholder ICS written due to error');
  } catch (fallbackErr) {
    console.error('Fallback ICS write also failed:', fallbackErr);
    process.exit(1);
  }
});
