# OFLY TOOL · 项目约定

**项目定位**：本地工作工具环境。配合本地 nginx 部署一个**本地浏览器工具集合**（JSON 格式化、Hash 生成、正则测试等开发工具），仅服务于本地开发与日常工作。

本文件约束本项目的一切实现，优先级高于默认行为。所有新增代码、组件、样式、文档均须遵循以下规范。

---

## 1. 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 前端框架 | Vue 3 | Composition API，统一使用 `<script setup lang="ts">` |
| 构建工具 | Vite | 官方脚手架 `npm create vue@latest` 初始化（含 TypeScript） |
| 类型系统 | TypeScript | 开启 `strict`，类型优先 |
| 状态管理 | Pinia | 皮肤、偏好等全局状态 |
| 路由 | Vue Router | 每个工具一个路由页面 |
| 后端 | Node.js | **仅当确实需要**时使用，代码统一放在 `server/` 目录 |
| 部署 | 本地 nginx | 托管前端构建产物 `dist/`，`/api` 反向代理到 Node 服务 |

- 前后端分离：前端纯静态构建，后端以 `/api` 前缀对外。
- 不需要后端时，`server/` 目录可以不存在，不得为「可能用得上」而引入后端。

---

## 2. 目录结构

```
ofly-tool/
├── src/                    # 前端源码
│   ├── components/         # 通用组件（PascalCase 命名）
│   ├── views/              # 页面 / 工具视图
│   ├── router/             # 路由定义
│   ├── stores/             # Pinia store（如 skin.ts）
│   ├── styles/             # 全局样式与皮肤令牌
│   │   ├── tokens.neon.css
│   │   ├── tokens.crt.css
│   │   └── base.css
│   └── utils/              # 纯函数工具
├── server/                 # Node 后端（可选，如需要时创建）
├── demo/                   # 风格 demo（设计参考，保留不动）
│   ├── 03-cyber-neon.html  # Neon 皮肤设计参考（已选用）
│   ├── 04-retro-crt.html   # CRT 皮肤设计参考（已选用）
│   ├── 01-terminal-hacker.html      # 未选中风格，仅存档
│   └── 02-minimal-dashboard.html    # 未选中风格，仅存档
├── index.html
├── vite.config.ts
└── CLAUDE.md
```

---

## 3. 皮肤系统（核心规范）

项目支持**多套可切换皮肤**，当前正式皮肤为两套。这是本项目区别于普通项目的最重要设计：**一切视觉都由 CSS 变量（设计令牌）驱动**。

| 皮肤 | `data-skin` 值 | 风格基准 |
|------|---------------|---------|
| 霓虹 Neon（默认） | `neon` | 深蓝黑底 + 霓虹青/品红渐变发光 · 毛玻璃 · 网格线背景 · 扫描光带 · 无衬线 + 大写字距 |
| 复古 CRT | `crt` | 墨绿 CRT 屏幕 + 薄荷/琥珀 · 扫描线 · 字符画边框 · 闪烁块光标 · 等宽字体 |

### 3.1 设计令牌规则

- 所有颜色、字体、圆角、发光、纹理必须定义为 **CSS 自定义属性**，按皮肤分组，挂在 `[data-skin]` 根选择器下。
- **组件与页面样式只允许引用令牌变量，禁止写死任何颜色值、字体名、圆角值。**
- 新增皮肤 = 新增一组令牌 + 一个 `data-skin` 值，不改动任何组件代码。

### 3.2 令牌清单（所有皮肤必须完整提供）

```css
/* 挂在 [data-skin="..."] 下 */
[data-skin] {
  /* 色彩 */
  --color-bg:            /* 页面底色 */
  --color-bg-2:          /* 底色渐变终点 */
  --color-surface:       /* 卡片/面板底色 */
  --color-surface-2:     /* 嵌套/悬浮底色 */
  --color-border:        /* 边框（非发光） */
  --border-strong:       /* 强边框 / 屏幕边框 */
  --color-text:          /* 正文 */
  --color-text-muted:    /* 次级文字 */
  --color-accent:        /* 主强调色 */
  --color-accent-2:      /* 副强调色 */
  --color-accent-3:      /* 第三强调色（如霓虹辅助紫） */
  --color-hover:         /* 悬停文本色 */
  --color-on-accent:     /* 强调底上的文本色 */
  /* 字体 */
  --font-ui:             /* 界面字体 */
  --font-mono:           /* 代码/数据字体 */
  /* 效果 */
  --radius:              /* 统一圆角 */
  --glow-accent:         /* 强调发光色值（用于 box-shadow/text-shadow） */
  --overlay-ink:         /* 暗色叠加（暗角 / 遮罩） */
  --shadow-deep:         /* 深阴影 */
  --bg-hover:            /* 悬停底色 */
  --bg-shell:            /* 外壳背景（none 或渐变） */
  /* 纹理装饰（背景类） */
  --texture-bg:          /* 背景纹理（网格线/扫描线等），可为 none */
  --scanline:            /* 扫描线开关：none / 叠加样式 */
}
```

### 3.3 两套皮肤的令牌基准值

**Neon（`data-skin="neon"`）** — 设计参考 `demo/03-cyber-neon.html`

| 令牌 | 值 |
|------|----|
| `--color-bg` | `#0b0e1a` |
| `--color-bg-2` | `#0f1322`（渐变终点） |
| `--color-accent` | `#00f0ff`（霓虹青） |
| `--color-accent-2` | `#ff00e0`（品红） |
| `--color-accent-3` | `#7b5cff`（辅助紫） |
| `--color-hover` | `#b9c4e8` |
| `--color-on-accent` | `#060a16` |
| `--border-strong` | `rgba(0, 240, 255, 0.35)` |
| `--overlay-ink` / `--shadow-deep` | `rgba(0,0,0,0.6)` / `rgba(0,0,0,0.85)` |
| `--bg-hover` | `rgba(255,255,255,0.03)` |
| `--bg-shell` | `none` |
| `--color-text` | `#dfe6ff` |
| `--color-text-muted` | `#6b74a6` |
| `--font-ui` | 无衬线栈，标题大写 + `letter-spacing` 拉宽 |
| 特征 | 毛玻璃（`backdrop-filter: blur`）、渐变发光边框、网格线背景、扫描光带动画、按钮渐变填充 |

**CRT（`data-skin="crt"`）** — 设计参考 `demo/04-retro-crt.html`

| 令牌 | 值 |
|------|----|
| `--color-bg` | `#001b18`（CRT 屏幕底） |
| `--color-bg-2` | `#00261f`（渐变终点） |
| 外壳 | `#131a19`（显示器边框 / bezel） |
| `--color-accent` | `#00ff9f`（薄荷） |
| `--color-accent-2` | `#ffb000`（琥珀） |
| `--color-accent-3` | `#7b5cff` |
| `--color-hover` | `#ffd166` |
| `--color-on-accent` | `#241a00` |
| `--border-strong` | `#022b24`（屏幕边框） |
| `--overlay-ink` / `--shadow-deep` | `rgba(0,0,0,0.6)` / `rgba(0,0,0,0.85)` |
| `--bg-hover` | `transparent` |
| `--bg-shell` | `radial-gradient(900px 600px at 50% -20%, #0a1a16, #05090a 70%)` |
| `--color-text` | `#b7ffe9` |
| `--color-text-muted` | `#2aa88a` |
| `--color-border` | `#0d5c4c` |
| `--font-ui` | 等宽字体栈（VT323 / Courier New） |
| 特征 | 扫描线叠加层、屏幕暗角（vignette）、闪烁动画、字符画边框、盒状 `[ 工具 ]` 菜单、块状光标 |

### 3.4 切换机制

- 通过根元素 `data-skin` 属性控制生效皮肤：`<html data-skin="neon|crt">`。
- Pinia store（`stores/skin.ts`）持有当前皮肤状态，提供 `setSkin()` / `toggle()`。
- 皮肤选择持久化到 `localStorage`，刷新后保持。
- 切换时过渡动画必须**轻量**（避免高耗帧动画），尊重 `prefers-reduced-motion`。
- 界面提供皮肤切换入口（顶部导航内的小图标或开关），文案用「霓虹 / 复古 CRT」。

### 3.5 皮肤差异处理策略

两套皮肤允许**布局层面的差异**，但差异必须按以下分级处理，**由外到内逐层收敛**：

| 差异类型 | 例子 | 处理机制 |
|---------|------|---------|
| ① 颜色 / 字体 / 圆角 / 发光 | Neon 霓虹 vs CRT 薄荷 | 令牌变量 |
| ② 布局参数（间距 / 方向 / 对齐 / 列数） | 侧栏宽度、nav 竖排或横排 | 令牌变量驱动（如 `--nav-direction`） |
| ③ 装饰层 / 背景 / 动画 | 网格线、扫描线、bezel、闪烁 | `[data-skin]` 作用域 CSS + 伪元素，**不新增 DOM** |
| ④ 外壳骨架结构不同 | Neon 竖排侧栏 vs CRT 横向盒状菜单、内容区排布 | **优先单外壳 + CSS 驱动**；仅当结构差异 CSS 无法表达时才分叉外壳 |
| ⑤ 内容组件内部结构差异 | 某工具两个皮肤下控件摆放差异 | 先 CSS，实在不行才用 `useSkin()` 最小分支 |

**外壳与内容分层约定：**
- **优先单外壳（默认）**：应用壳（AppShell）保持**单实例常驻**，导航形态、内容区排布、装饰层全部由 `[data-skin]` 规则与布局令牌驱动。切换皮肤只改 `<html data-skin>`，DOM 不重挂载——**工具页的本地状态（未提交的输入等）不丢失**。
- **分叉外壳（仅当结构差异过大）**：必要时才用 `v-if` 渲染不同布局组件；此时必须把 `<RouterView>` / `<KeepAlive>` 放在分叉**之外**（常驻），避免切换皮肤导致工具组件卸载、状态丢失。
- **内容（工具页）强制共享**：所有工具组件放在 RouterView 内，只消费令牌，**禁止感知皮肤**。
- **集中分支**：内容组件内确需按皮肤分支时，统一走 `composables/useSkin.ts` 暴露的 `isNeon` / `isCrt`；禁止散落裸判断 `data-skin === 'crt'`。

---

## 4. 界面文案规范

- 界面文案以**中文为主**；技术名词（JSON、Hash、URL、Base64、Regex 等）保留英文。
- **动词全流程统一**：如按钮「格式化 JSON」→ 结果提示「已格式化」；「复制结果」→「已复制」，一个动作在整套流程中始终同名。
- 按钮直接说明动作结果，不用「提交」「确定」这类模糊词。
- 错误与空状态给出原因和下一步，不说空话。

---

## 5. 代码规范

- **Vue 3 Composition API**，统一 `<script setup lang="ts">`；不使用 Options API。
- **命名**：组件/文件 PascalCase；函数、变量、文件名 camelCase；常量、环境变量 SCREAMING_SNAKE。
- **类型优先**：props / emits / API 响应必须定义类型；禁止滥用 `any`。
- **样式**：组件样式 `scoped`，只引用 §3 的令牌变量；禁止硬编码颜色/字体/圆角。
- **Pinia**：使用 setup 写法（`defineStore` + Composition API），状态变更收敛到 store action。
- **首屏体积 / 按需引入（分层规范）**——
  **首屏层（直接影响初始加载）：**
  - 路由组件必须懒加载：`component: () => import('...')`，禁止在路由表顶部 `import` 整页组件；工具页依赖自动进入对应 chunk。
  - 第三方依赖禁止全局引入，禁止 `app.use()` 全局注册插件/组件；骨架只引入必要依赖。
  - 图标一律**内联 SVG 组件**，禁止引入图标库/字体图标（FontAwesome 全量 CSS、iconify 等）。
  - 禁止引入重型 UI 框架（Element Plus / Naive / Ant）；组件全部自研、消费令牌。
  - 禁止网络字体 / `@font-face` 外链字体；统一系统字体栈（本地工具离线可用、零字体下载）。
  - 构建目标对齐现代浏览器：`vite.config.ts` 设 `build.target: 'es2022'`，减少转译垫片。
  **工具 chunk 层（进入工具才加载，不影响首屏）：**
  - 工具优先使用原生 API 实现：Hash 用 Web Crypto（SHA-1/256/384/512）、Base64 用 `btoa`/`atob` + `TextEncoder`、URL 用 `encodeURIComponent` 等。
  - 仅当原生 API 确实缺失时（如 MD5、二维码）才在**对应工具视图内**按需引入轻量库；该依赖只进入工具 chunk，不得外泄到全局。
  - 工具内重型子组件可用 `defineAsyncComponent` 异步挂载（如二维码画布、图片处理面板）。
  - 优先 tree-shakable 具名导入（`import { xx } from 'lib'`），避免 `import lib` 整库。
  - 新增大体积依赖前先评估：能否原生 API 替代 / 能否放工具内按需 / 体积是否可控。
- 新工具的实现与视觉必须同时适配两套皮肤（切换皮肤后不出现样式缺失或破版）。

---

## 6. 部署约定（本地 nginx）

- 前端构建：`npm run build`，产物输出到 `dist/`。
- nginx 本地站点：`root` 指向 `dist/`，`location /api` 反向代理到 Node 服务端口；前端开发时 `vite proxy` 指向同一后端。
- 所有服务仅监听本机（`127.0.0.1`），不暴露公网。
- 构建产物、临时文件、`node_modules/`、`dist/` 不得提交；git 仓库根提供 `.gitignore`。

---

## 7. 设计与迭代原则

- 任何新界面改动前，先对照 `demo/` 中的皮肤参考，再动手。
- 新皮肤、新组件上线前，先实现一个静态 demo 验证效果（参考本次 `demo/` 流程），确认后再接入工程。
- 视觉改动优先改令牌，不改组件结构；结构性改动才动组件。
