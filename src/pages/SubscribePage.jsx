import { useState } from 'react'
import { useFollowing } from '../hooks/useFollowing'
import { generateICS, downloadICS } from '../utils/ics'
import { toast } from '../components/Toast'
import { getAiredCount, getTotalEpisodes, getNextEpisode } from '../utils/helpers'

export default function SubscribePage() {
  const { following, githubToken, setGithubToken } = useFollowing()
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tokenInput, setTokenInput] = useState(githubToken || '')

  const icsContent = generateICS(following)

  const totalShows = following.length
  const totalEpisodes = following.reduce((sum, s) => sum + getTotalEpisodes(s), 0)
  const airedEpisodes = following.reduce((sum, s) => sum + getAiredCount(s), 0)
  const upcomingShows = following.filter(s => {
    const next = getNextEpisode(s)
    return next && next.airstamp && new Date(next.airstamp) > new Date()
  }).length

  // GitHub Pages ICS URL placeholder - user needs to replace with their actual URL
  const icsUrl = 'https://<your-username>.github.io/reel/reel-calendar.ics'

  const handleCopy = () => {
    navigator.clipboard.writeText(icsUrl).then(() => {
      setCopied(true)
      toast('订阅URL已复制到剪贴板', 'success')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      toast('复制失败，请手动复制', 'error')
    })
  }

  const handleDownload = () => {
    downloadICS(icsContent, `reel-calendar-${new Date().toISOString().slice(0, 10)}.ics`)
    toast('ICS文件已下载', 'success')
  }

  const handleSaveToken = () => {
    setGithubToken(tokenInput.trim())
    toast('GitHub Token 已保存', 'success')
    setShowSettings(false)
  }

  const handleClearToken = () => {
    setTokenInput('')
    setGithubToken('')
    toast('GitHub Token 已清除', 'info')
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
        }}>
          ICS 订阅
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            fontSize: 13,
          }}
        >
          {showSettings ? '关闭设置' : '设置'}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
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
            marginBottom: 12,
          }}>
            GitHub 同步设置
          </h2>
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 14,
            lineHeight: 1.6,
          }}>
            配置 GitHub Personal Access Token 后，可在「我的关注」页一键同步关注列表到 GitHub 仓库的 watchlist.json。
            令牌仅存储在浏览器本地，不会上传到任何服务器。
          </p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              GitHub Personal Access Token（仅 Contents 写权限）
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              style={{
                width: '100%',
                fontSize: 13,
                fontFamily: 'monospace',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSaveToken}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'var(--accent)',
                color: '#000',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              保存
            </button>
            <button
              onClick={handleClearToken}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              清除
            </button>
          </div>
          <div style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-secondary)' }}>安全提示:</strong><br/>
            1. 在 GitHub Settings &rarr; Developer settings &rarr; Personal access tokens &rarr; Fine-grained tokens 生成令牌<br/>
            2. 选择「Only select repositories」并勾选本仓库<br/>
            3. Repository permissions 中给 Contents 授予 Read and write<br/>
            4. 如令牌泄露，请立即在 GitHub 上撤销并重新生成
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}>
        {[
          { label: '已关注', value: totalShows },
          { label: '总集数', value: totalEpisodes },
          { label: '已播出', value: airedEpisodes },
          { label: '即将更新', value: upcomingShows },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            padding: 16,
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: 4,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription URL */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 18,
          fontStyle: 'italic',
          color: 'var(--accent)',
          marginBottom: 12,
        }}>
          订阅链接
        </h2>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 14,
          lineHeight: 1.6,
        }}>
          将此URL添加到你的日历应用（Google Calendar、Apple Calendar、Outlook等），即可自动同步剧集更新。
          请把 &lt;your-username&gt; 替换为你的 GitHub 用户名。
        </p>
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
        }}>
          <input
            type="text"
            value={icsUrl}
            readOnly
            style={{
              flex: 1,
              fontSize: 13,
              fontFamily: 'monospace',
              background: 'var(--bg-tertiary)',
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: copied ? 'var(--success)' : 'var(--accent)',
              color: '#000',
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          提示: 部署到GitHub Pages后，此链接会自动更新。在部署前，你也可以先下载下方的ICS文件手动导入。
        </div>
      </div>

      {/* Download ICS */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 18,
          fontStyle: 'italic',
          color: 'var(--accent)',
          marginBottom: 12,
        }}>
          下载 ICS 文件
        </h2>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 14,
          lineHeight: 1.6,
        }}>
          下载当前关注列表的ICS日历文件，可手动导入到任何支持ICS格式的日历应用中。
        </p>
        <button
          onClick={handleDownload}
          disabled={following.length === 0}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            background: following.length > 0 ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: following.length > 0 ? '#000' : 'var(--text-muted)',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          下载 ICS 文件
        </button>
      </div>

      {/* How to use */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 20,
        border: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 18,
          fontStyle: 'italic',
          color: 'var(--accent)',
          marginBottom: 12,
        }}>
          使用说明
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              title: '1. 自动订阅（推荐）',
              desc: '将ICS订阅URL添加到日历应用中。GitHub Actions会每日自动更新ICS文件，你的日历将自动同步最新剧集更新。',
            },
            {
              title: '2. 手动导入',
              desc: '下载ICS文件后，在Google Calendar中选择"导入"，或在Apple Calendar中双击ICS文件导入。',
            },
            {
              title: '3. 更新频率',
              desc: 'GitHub Actions每日UTC 00:00自动运行，生成最新ICS文件。你也可以随时手动下载最新版本。',
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              borderRadius: 8,
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
