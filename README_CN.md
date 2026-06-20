# HOOZi 3.0 网页雷达

本仓库是 HOOZi 网页雷达的浏览器前端。当前版本接收 HOOZi 3.0
`web_radar.lua` 脚本生成的本地 WebSocket 状态数据流。

前端是由原生浏览器 ES Modules 和 Tailwind CSS v4 构成的静态站点，不使用
JavaScript bundler，也没有生产环境运行时依赖。

## HOOZi 3.0 迁移

旧版前端围绕 HOOZi 2.0 传输协议和单体 `app.js` 开发，依赖 2334 端口、
`/ws` 路径、嵌套玩家坐标、数字地图 ID、基于昵称的本机玩家识别、旧版裁剪
坐标系、名册标记和派生长 UID。

HOOZi 3.0 版本改为严格遵循仓库中的 Lua 脚本：

- 本地 WebSocket 地址：`ws://127.0.0.1:9001`
- 使用 `kind` 区分的完整 `state` 快照
- 原始 `game.world.map_name` 字符串，并使用已确认的首段标识映射六张数字地图资源
- 1000×1000 地图域中的扁平 `x`/`y` 坐标
- 稳定的玩家 `id` 和明确的 `self` 字段
- 生命、护盾、倒地/死亡状态、英雄、UID、等级、击杀、伤害、段位、
  队伍/小队、名册元数据和可选安全区
- 可选的浏览器 `ping` 与 Lua `pong`
- 桌面布局保持表格列的固有宽度和横向滚动，并保证地图观察口的宽度始终不小于高度
- 地图绘制字段使用独立开关，所有可验证的非坐标玩家字段均可独立控制表格列
- 响应式观察口后方使用固定正方形雷达绘制表面，并支持 50%–300% 的按钮、滚轮和双指缩放
- 支持经过校验的当前 HOOZi `state` 玩家数据 JSON 导入与导出

浏览器渲染循环会在相邻 Lua 快照之间插值玩家位置和安全区几何数据。前端
不会伪造已经不受支持的 HOOZi 2.0 字段。

## 数据流

```text
HOOZi 3.0 运行时游戏数据
        ↓
web_radar.lua 快照与地图坐标转换
        ↓ 127.0.0.1:9001 上的 WebSocket JSON
src/protocol/hoozi3.js 验证和归一化
        ↓
src/state/store.js 快照状态与插值
        ↓
Canvas 雷达、玩家表格、焦点信息和控制项
```

`web_radar.lua` 只监听环回地址。如果通过独立 HClient 中继开放网页雷达，
请在“手动”模式中配置相应的 `ws` 或 `wss` 地址。中继鉴权不属于本仓库，
也不属于 Lua 协议。

完整消息和字段定义见
[`docs/protocol/hoozi3-web-radar-protocol.md`](docs/protocol/hoozi3-web-radar-protocol.md)。

## 项目结构

```text
hoozi_radar/
├── index.html                    静态页面和 Tailwind UI
├── input.css                     Tailwind CSS v4 输入文件
├── styles.css                    生成的样式表
├── src/
│   ├── main.js                   启动和 WebSocket 生命周期
│   ├── config.js                 常量、设置与连接目标
│   ├── i18n.js                   简中、繁中和英文文本
│   ├── protocol/hoozi3.js        协议验证与归一化
│   ├── state/store.js            快照、选择与插值
│   ├── render/ring.js            仅作用于地图的圈外滤镜和安全区边界
│   ├── render/entities.js        位于地图效果上方的玩家 Canvas 渲染
│   ├── render/viewport.js        纯缩放、锚点、观察口和跟随计算
│   ├── render/radar.js           渲染循环、尺寸、跟随、拖动与缩放
│   ├── ui/layout.js              地图优先的桌面列宽分配
│   ├── ui/player-data.js         JSON 导入与导出文件名规则
│   ├── ui/controls.js            控制项、焦点 UI 和玩家表格
│   └── assets/maps.js            CDN 优先的图片回退
├── static/                       本地回退图片
├── docs/protocol/                项目协议文档
└── references/                   只读 HOOZi 3.0 Lua 参考快照
```

旧版单体 `app.js` 已删除。`index.html` 中的内联模块启动器会检测不受支持的
`file://` 打开方式；通过 HTTP 访问时，仅导入 `./src/main.js` 作为应用入口。

## 雷达观察口与缩放

响应式地图面板只是观察口，不参与决定雷达内容的绘制比例。绘制表面始终保持宽高相等，
边长取初始观察口宽高中的较小值。因此在 100% 时，地图宽或高至少有一边刚好达到观察口
对应边界，完整正方形地图保持可见；观察口较长的方向允许留空。桌面端初始列宽布局稳定后，
绘制表面尺寸即被锁定；此后缩放浏览器窗口或切换玩家信息列表，只改变可见裁剪范围。

雷达缩放严格限制在 50%–300%。页面默认使用固定跟随并从 150% 开始；选择自由视角时会
重置为居中的 100%，重新选择固定跟随时会重置为 150% 并把选中玩家置于中心。右下角的
减号、倍率、加号控件、鼠标滚轮和移动端双指手势共用同一套限幅计算。自由视角会保持手势
锚点下的地图位置不漂移。

地图 `<img>` 初始不设置 `src`，并在未连接、尝试回退资源或资源缺失时保持隐藏。只有 CDN
或本地地图图片成功加载后才显示，因此不会再出现裂图占位图标。

在桌面三列布局中，玩家列表会朝当前可见内容的固有宽度扩张，但不会超过页面内容宽度
的 25%。地图会优先取得足以满足 `宽度 >= 高度` 的空间；如果列表达到上限后仍装不下
全部字段，表格列会在内部横向滚动。窗口缩放、表格字段变化、快照内容变化以及玩家列表
显隐变化后，都会重新执行同一套分配规则。

玩家信息列表工具栏会把最新的完整 `state` JSON 导出为当前玩家信息。左侧的导入按钮
只接受 `.json` 文件，并在应用前使用同一套 HOOZi 3.0 协议校验器进行验证。无效 JSON、
非 `state` 消息或格式错误的玩家数组不会修改当前雷达状态。有效导入会进入离线预览，
停止当前连接和自动重连计时器；只有用户明确点击连接或重连后才恢复连接。导入的测试数据
不会改变实时 WebSocket 的时间戳顺序，下一条有效实时快照可以正常接管。

## 本地运行

浏览器原生 ES Modules 必须通过 HTTP 提供。直接双击 `index.html` 会生成
`file://` 地址，浏览器会阻止它加载模块。

请在仓库根目录使用内置服务器：

```powershell
npm start
```

该命令会在 `http://127.0.0.1:8080/` 提供项目，并使用默认浏览器打开页面。
如果只需要启动服务器而不打开浏览器，请执行 `npm run serve`。

也可以使用其他静态 HTTP 服务器，例如：

```powershell
python -m http.server 8080
```

打开 `http://127.0.0.1:8080/`，并确认 HOOZi 3.0 已加载
`web_radar.lua` 且网页雷达 server 已启用。本机自动模式会连接
`ws://127.0.0.1:9001`。

如果页面本身使用 HTTPS，浏览器通常会把普通 `ws://` 连接视为混合内容并
阻止。此时请在手动模式中使用部署环境提供的、经过授权的 `wss://` 中继。

## 安装工具与构建 CSS

安装锁定的开发依赖：

```powershell
npm install
```

修改 `index.html` 或 JavaScript 中的 Tailwind utility class 后重新生成样式：

```powershell
npx @tailwindcss/cli -i ./input.css -o ./styles.css
```

项目无需 bundling，所有 JavaScript 文件都以原生 ES Modules 提供。

## 地图与静态资源

图片按以下顺序加载：

1. `https://img.hoozi.net/static/`
2. 本地 `./static/`

已知地图只读取 `mp_rr_` 后第一个下划线分隔标识，忽略 `_mu1`、`_mu2` 等后续变体。
确认的资源映射为：`canyonlands` → `1.png`、`desertlands` → `2.png`、
`olympus` → `3.png`、`divided` → `4.png`、`tropic` → `5.png`、
`nemesis` → `6.png`。未知原始地图名仍使用精确的 `<map>.png` 查找。

英雄和段位图标 key 会保留在归一化状态及导出的快照中。在获得权威的资源
key 命名空间之前，前端不会自行把这些 key 拼接成 URL。

## 开发规则

- 修改协议或渲染语义前，先阅读根目录 `AGENTS.md` 和要求的参考文件。
- `references/hapex3-lua-script-factory/` 必须保持只读。
- 以 `web_radar.lua` 为首要事实来源，不要从旧前端推断 HOOZi 3.0 语义。
- 协议解析、状态、Canvas 渲染、DOM 控制和资源回退应保持在现有模块中。
- 用户可见文本需要同时更新简体中文、繁体中文和英文。
- 未经明确批准，不要增加 bundler 或生产依赖。
- Tailwind class 发生变化时必须重新生成 `styles.css`。

## 已知协议限制

当前 Lua 脚本没有发送战利品或投掷物数组，因此前端无法渲染这些实体。
参考资料也没有完整定义 yaw 朝向、图标 key 命名空间、`rank_color` 格式或
数字 `roster` 分类。前端只保留或展示原始值，不会编造解释；完整的不确定项
列表见协议文档。

