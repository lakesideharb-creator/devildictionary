# The Devil's Dictionary

一款以“反常识定义”为核心的滑词游戏。玩家在随机字母方格中滑动连词，再接受辞典对词语与玩家本人的双重审判。

## 直接游玩

下载仓库根目录的 `The-Devils-Dictionary.html`，双击即可离线运行。它包含完整样式、游戏逻辑、100 个词条和浏览器合成音效，不需要安装依赖。

## 游戏阶段

- 第一阶段（THE LITERATE）：5×5 方格，显示完整目标词，熟悉滑词、提示与反常识释义。
- 第二阶段（THE DOUBTER）：完成 25 个词条后解锁；升级为 6×6 方格，只显示首尾字母，并从三条定义中完成“定义审判”。
- 第三阶段（THE ACCOMPLICE）：完成 50 个词条后解锁；升级为 7×7 方格。
- 第四阶段（THE AUTHOR）：完成 75 个词条后解锁；升级为 8×8 方格，长词挑战，并再次接受定义审判。
- 金币：每完成 5 个不同词条获得 1 枚；金币数量始终根据累计进度自动校准。

## 词库来源

100 个词条中，45 个是原创仿写，55 个取自 Ambrose Bierce 1911 年原作 *The Cynic's Word-Book / The Devil's Dictionary*（公有领域，商用无需授权）。挑选时按现代常用度筛掉了 19 世纪生僻词，并排除了涉及种族、性别刻板与暴力的条目。

定义审判的两个干扰项不是编造的假句子，而是原作中**其他词条的真实释义**——三条都是 Bierce 的真笔，玩家要判断的是“哪一条属于这个词”，而非“哪一条是真的”。

## iOS 版（Capacitor）

网页版与 iOS 版共用同一份 `dist/`，内容完全一致：**100 个词条全免费，没有内购、没有解锁、没有付费墙**。原生壳只做平台适配，不做商业化。

- Bundle ID：`com.devildictionary.app`
- 依赖管理：**Swift Package Manager**（`cap add ios --packagemanager SPM`），不需要 CocoaPods
- 最低系统：iOS 15
- 原生插件：StatusBar / SplashScreen / Haptics

```bash
npm run build          # 生成 dist/
npx cap sync ios       # 同步 Web 资源与插件
npx cap open ios       # 在 Xcode 中打开
```

原生侧做的适配：

- 安全区边距（`viewport-fit=cover` + `env(safe-area-inset-*)`），避开刘海与 Home 指示条
- 棋盘 `touch-action: none`，禁用长按放大镜与文本选择，防止连词时被系统手势打断
- 深色状态栏与启动屏配色跟随页面主题
- 连词、审判、进入新阶段、获得金币各有一次触感反馈
- iPhone 锁定竖屏（棋盘是竖排布局，横屏会截断），设备族为 iPhone only，无需提交 iPad 截图
- 已知限制：本仓库的命令行环境禁止 `sandbox-exec`，`xcodebuild` 无法完成 SPM 解析，构建需在 Xcode GUI 中进行

### 上架素材

`docs/app-store.md` 是完整的 App Store Connect 提交包：App 名称、副标题、关键词、描述、版本说明、年龄分级问卷、App Privacy 问答、审核备注，以及提交前清单。各字段字符数已按 Apple 限额校验，可直接复制。

```bash
node scripts/generate-store-screenshots.mjs   # 生成 5 张截图（6.9" + 6.5"）
npx capacitor-assets generate --ios \         # 从 assets/icon.svg 生成全套图标与启动屏
  --iconBackgroundColor "#17120e" --splashBackgroundColor "#17120e"
```

截图是矢量合成的（`app.js` 里读真实词条，文案不会与线上脱节），不是设备实拍。上架前建议在模拟器里重拍，脚本与清单见文档第 11 节。

App 图标上传 `assets/icon.png`：1024×1024、无 alpha、无预置圆角（Apple 自己加遮罩）。

## 自动部署

Vercel 已连接本仓库：推送到 `main` 会自动更新生产部署，其他分支和 Pull Request 会生成预览部署。构建命令和输出目录由 `vercel.json` 管理。

## 本地开发

```bash
npm install
npm test
npm run build:standalone
```

- `index.html`、`styles.css`、`app.js`：开发源文件。
- `The-Devils-Dictionary.html`：可直接交付的单文件版本。
- `tests/`：游戏逻辑、阶段解锁、金币边界与离线文件测试。
