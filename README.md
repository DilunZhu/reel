# Reel — 美剧及电影更新追踪

Reel 是一款专注于美剧和电影更新追踪的纯前端 Web 应用。通过搜索并关注你喜爱的剧集，你可以随时查看更新日历、导出 ICS 文件订阅到个人日历，再也不会错过任何一集。

## 功能特性

- **搜索发现** — 基于 TVmaze API 搜索全球剧集和电影
- **关注管理** — 本地 localStorage 持久化关注列表，支持导出/导入
- **更新日历** — 周视图/月视图切换，直观查看关注内容的播出计划
- **ICS 订阅** — 生成标准 ICS 格式日历文件，支持订阅到 Google Calendar、Apple Calendar、Outlook 等
- **进度追踪** — 已播出集数以矩形块直观展示
- **响应式设计** — 桌面端左侧边栏 + 移动端底部 Tab 栏，自适应布局

## 技术栈

- React 18 + Vite
- React Router DOM
- TVmaze API（免费、无需 Key、支持 CORS）
- localStorage（关注列表）+ IndexedDB（剧集缓存，预留）
- GitHub Pages + GitHub Actions 自动化部署

## 快速开始

### 本地开发

```bash
# 克隆项目
git clone <repo-url>
cd reel

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`。

### 构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 部署到 GitHub Pages

### 1. 创建 GitHub 仓库并推送代码

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/reel.git
git push -u origin main
```

### 2. 启用 GitHub Pages

进入仓库 **Settings → Pages**，选择 Source 为 **GitHub Actions**。

### 3. 配置 GitHub Actions

项目已包含 `.github/workflows/ics-generator.yml`，每次推送到 main 分支时会自动运行：

- 构建静态站点
- 生成 ICS 日历文件
- 部署到 `gh-pages` 分支

### 4. 访问应用

部署完成后，访问 `https://<your-username>.github.io/reel/`。

## 关注列表同步到 GitHub（ICS 真实日程）

为了让 GitHub Actions 生成的 ICS 文件包含真实追剧日程，需要将浏览器本地的关注列表同步到仓库根目录的 `watchlist.json` 文件中。

### 方式一：手动同步（推荐，零风险）

1. 在 Reel 应用的「我的关注」页点击「导出 JSON」，复制关注列表 JSON 内容
2. 打开你的 GitHub 仓库页面，点击根目录的 `watchlist.json` 文件
3. 点击右上角的编辑按钮（铅笔图标）
4. 将复制的 JSON 内容粘贴进去，替换原有内容
5. 填写提交信息（如 "Update watchlist"），点击 **Commit changes**
6. GitHub Actions 将在下次运行时读取最新的 `watchlist.json`，生成包含真实追剧日程的 ICS 文件

### 方式二：自动同步（可选）

在 Reel 应用的「ICS 订阅」页设置中，可以开启自动同步：

1. 生成 GitHub 细粒度 Personal Access Token：
   - 访问 GitHub 设置 → Developer settings → Personal access tokens → Fine-grained tokens
   - 点击 **Generate new token**
   - 选择「Only select repositories」，勾选你的 Reel 仓库
   - 在「Repository permissions」中，找到 **Contents** 并选择 **Read and write**
   - 设置过期时间（建议 90 天），生成令牌
2. 在 Reel 应用设置中粘贴该令牌，点击保存
3. 关注列表变化时将自动通过 GitHub Contents API 更新仓库中的 `watchlist.json`

**安全提示**：
- 令牌仅存储在浏览器 localStorage 中，不会上传到任何第三方服务器
- 如果令牌意外泄露，可随时在 GitHub 上撤销并重新生成
- 建议设置较短的过期时间并定期轮换
- 令牌仅对单个仓库有 Contents 写权限，风险可控

## ICS 订阅使用说明

### 方式一：自动订阅（推荐）

1. 部署到 GitHub Pages 后，ICS 文件位于：
   ```
   https://<your-username>.github.io/reel/reel-calendar.ics
   ```

2. 在你的日历应用中添加网络日历订阅：
   - **Google Calendar**: 设置 → 添加日历 → 通过网址添加 → 粘贴 ICS URL
   - **Apple Calendar**: 文件 → 新建日历订阅 → 粘贴 ICS URL
   - **Outlook**: 添加日历 → 从 Internet 订阅 → 粘贴 ICS URL

3. GitHub Actions 每日 UTC 00:00 自动更新 ICS 文件，日历将自动同步。

### 方式二：手动下载

在应用内 **ICS 订阅页** 点击「下载 ICS 文件」，手动导入到日历应用中。

## 项目结构

```
reel/
├── .github/workflows/    # GitHub Actions 配置
├── public/               # 静态资源
├── src/
│   ├── components/       # 共享组件
│   │   ├── Layout.jsx
│   │   ├── ShowCard.jsx
│   │   ├── EpisodeList.jsx
│   │   ├── CalendarWeek.jsx
│   │   ├── CalendarMonth.jsx
│   │   └── Toast.jsx
│   ├── pages/            # 页面组件
│   │   ├── DiscoverPage.jsx
│   │   ├── ShowDetailPage.jsx
│   │   ├── FollowingPage.jsx
│   │   ├── CalendarPage.jsx
│   │   └── SubscribePage.jsx
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useLocalStorage.js
│   │   ├── useFollowing.js
│   │   └── useTVmaze.js
│   ├── utils/            # 工具函数
│   │   ├── api.js
│   │   ├── ics.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── watchlist.json        # GitHub Actions 读取的关注列表
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 数据源说明

- 数据来自 [TVmaze API](https://www.tvmaze.com/api)，免费且无需 API Key
- API 覆盖已播出和即将播出的剧集内容
- 电影数据在 TVmaze 中的覆盖度可能不如剧集
- 建议合理使用缓存，避免频繁请求

## 已知限制

- TVmaze API 存在请求频率限制，应用已内置缓存机制
- 纯前端应用无法直接提供服务器端 ICS 订阅 URL，通过 GitHub Actions 间接实现
- 部分剧集的分集信息可能不完整，以 API 返回数据为准

## License

MIT
