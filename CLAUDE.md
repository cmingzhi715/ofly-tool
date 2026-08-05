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
  --color-surface:       /* 卡片/面板底色 */
  --color-surface-2:     /* 嵌套/悬浮底色 */
  --color-border:        /* 边框（非发光） */
  --color-text:          /* 正文 */
  --color-text-muted:    /* 次级文字 */
  --color-accent:        /* 主强调色 */
  --color-accent-2:      /* 副强调色 */
  /* 字体 */
  --font-ui:             /* 界面字体 */
  --font-mono:           /* 代码/数据字体 */
  /* 效果 */
  --radius:              /* 统一圆角 */
  --glow-accent:         /* 强调发光色值（用于 box-shadow/text-shadow） */
  /* 纹理装饰（背景类） */
  --texture-bg:          /* 背景纹理（网格线/扫描线等），可为 none */
  --scanline:            /* 扫描线开关：none / 叠加样式 */
}
```

### 3.3 两套皮肤的令牌基准值

**Neon（`data-skin="neon"`）** — 设计参考 `demo/03-cyber-neon.html`

| 令牌 | 值 |
|------|----|
| `--color-bg` | `#0b0e1a`（渐变至 `#0f1322`） |
| `--color-accent` | `#00f0ff`（霓虹青） |
| `--color-accent-2` | `#ff00e0`（品红） |
| 辅助紫 | `#7b5cff` |
| `--color-text` | `#dfe6ff` |
| `--color-text-muted` | `#6b74a6` |
| `--font-ui` | 无衬线栈，标题大写 + `letter-spacing` 拉宽 |
| 特征 | 毛玻璃（`backdrop-filter: blur`）、渐变发光边框、网格线背景、扫描光带动画、按钮渐变填充 |

**CRT（`data-skin="crt"`）** — 设计参考 `demo/04-retro-crt.html`

| 令牌 | 值 |
|------|----|
| `--color-bg` | `#001b18`（CRT 屏幕底） |
| 外壳 | `#131a19`（显示器边框 / bezel） |
| `--color-accent` | `#00ff9f`（薄荷） |
| `--color-accent-2` | `#ffb000`（琥珀） |
| `--color-text` | `#b7ffe9` |
| `--color-text-muted` | `#0d5c4c` |
| `--font-ui` | 等宽字体栈（VT323 / Courier New） |
| 特征 | 扫描线叠加层、屏幕暗角（vignette）、闪烁动画、字符画边框、盒状 `[ 工具 ]` 菜单、块状光标 |

### 3.4 切换机制

- 通过根元素 `data-skin` 属性控制生效皮肤：`<html data-skin="neon|crt">`。
- Pinia store（`stores/skin.ts`）持有当前皮肤状态，提供 `setSkin()` / `toggle()`。
- 皮肤选择持久化到 `localStorage`，刷新后保持。
- 切换时过渡动画必须**轻量**（避免高耗帧动画），尊重 `prefers-reduced-motion`。
- 界面提供皮肤切换入口（顶部导航内的小图标或开关），文案用「霓虹 / 复古 CRT」。

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
