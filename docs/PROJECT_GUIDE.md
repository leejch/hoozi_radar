# HOOZi Radar 前端项目详解

本说明旨在帮助新成员全面理解 HOOZi Radar 前端项目的结构、数据流与关键方法。阅读顺序按照页面初始化、数据拉取、渲染再到用户交互，涵盖 `index.html` 与 `app.js` 中的全部核心逻辑。

## 顶层结构概览

| 路径 | 作用 |
| --- | --- |
| `index.html` | 页面骨架、布局与少量全局样式定义。引用 `styles.css` 并加载 `app.js`。 |
| `app.js` | 页面行为核心：国际化、WebSocket 数据接入、地图渲染、玩家列表渲染与交互控制。 |
| `input.css` | Tailwind CSS v4 的入口文件，仅含 `@import "tailwindcss";`。 |
| `styles.css` | 使用 Tailwind CLI 基于 `index.html` 与 `app.js` 中的类名编译生成的最终样式。 |
| `static/` | 本地静态图片资源（地图切片、品牌图等），在 CDN 失败时作为回退。 |

## 页面与样式结构

### `index.html`

- 页面以 `header`、`main`、`footer` 三段组成，`main` 中使用 `.three-column-layout` 实现配置区、地图区、玩家表的响应式三列布局。
- `#mapStage` 内包含地图位图 (`#mapImage`) 与绘制玩家位置的 Canvas (`#mapCanvas`)，并叠加 `#mapOverlay` 作为状态遮罩。
- 配置表单（如 WebSocket 地址、地图选项、筛选条件等）通过 `data-role` / `id` 钩子与 `app.js` 对应。
- 玩家表格区域通过 `[data-role="player-table-*"]` 钩子被脚本动态填充。
- `style` 标签补充了鼠标交互、遮罩显隐、桌面端布局等关键样式。

### Tailwind 资源

- Tailwind CLI 负责生成 `styles.css`，其中包含了 `index.html` 与 `app.js` 中使用到的实用类。
- 若新增界面元素或类名，应执行 `npx @tailwindcss/cli -i ./input.css -o ./styles.css` 重新编译。

## `app.js` 初始化流程

1. **静态资源配置**：定义 CDN 与本地静态目录，依据访问协议（HTTP/HTTPS）确定资源加载顺序。
2. **国际化**：`translations` 保存中、繁、英三套文案；`getBrowserLanguage()` 根据浏览器语言自动选择；`applyTranslations()` 将文本与占位符替换到 DOM。
3. **DOM 引用收集**：`refs` 对象集中缓存所有需要操作的 DOM 元素，避免重复查询。
4. **状态与设置初始化**：`state` 保存运行时状态（地图尺寸、视口、玩家数据等），`settings` 通过 `readSetting()` 从 `localStorage` 恢复用户偏好，并回填到表单。
5. **事件绑定**：包括地图操作、表单变更、玩家列表开关、WebSocket 重连、数据导出等。
6. **首帧渲染**：调用 `renderPlayerTable()`、`updateDownloadButtonState()`、`syncMapControlsHost()`、`resizeCanvas()` 等函数准备 UI，然后执行 `connect()` 建立 WebSocket 连接。

## 状态与辅助常量

- `RAW_*` 常量定义服务器下发地图位图的裁剪窗口，用于将玩家坐标映射到 Canvas。
- `MIN_SCALE`/`MAX_SCALE` 限制地图缩放比例；`AVAILABLE_MAP_IDS` 列出合法地图 ID。
- `teamPalette` 是队伍颜色表，`teamColorFor(teamId)` 据此生成颜色。
- `UID_MASK` 与 `computeLongUidFromShort()` 用于从短 UID 反推长 UID，保持与后端一致的掩码规则。

## 方法详解

以下按照逻辑模块列出 `app.js` 中的全部函数及其作用。

### 国际化与文本工具

| 方法 | 说明 |
| --- | --- |
| `getBrowserLanguage()` | 读取 `navigator.language`，将繁体区域 (`zh-TW`/`zh-HK`) 映射为 `zh-Hant`，其它 `zh` 前缀为简体，否则回退英文。 |
| `resolveTranslation(source, path)` | 按 `a.b.c` 路径逐级取值，支持嵌套文案结构。 |
| `t(path, replacements)` | 获取翻译字符串，并用 `{token}` 替换；找不到时原样返回，确保界面退化可用。 |
| `applyTranslations()` | 设置 `<html lang>` 与 `<title>`，遍历 `data-i18n` / `data-i18n-placeholder` 元素替换文案。 |

### 玩家 UID 与数据归一化

| 方法 | 说明 |
| --- | --- |
| `extractUidString(raw)` | 兼容多种 UID 类型（字符串/数字/BigInt），统一为字符串。异常或空值返回空串。 |
| `computeLongUidFromShort(shortUid)` | 使用 `UID_MASK` 对短 UID 进行按位异或并转换为 64 位无符号整数，生成长 UID 文本。非法输入返回空串。 |
| `normalizePlayer(player)` | 克隆玩家对象，补齐 `uidShort`、`uidLong`、`uid` 字段，确保渲染阶段字段完整。无效输入返回仅含 UID 空值的对象。 |
| `normalizePlayers(players)` | 将玩家数组映射为 `normalizePlayer()` 结果，保证后续逻辑的数据质量。 |

### 颜色与设置读取

| 方法 | 说明 |
| --- | --- |
| `teamColorFor(teamId)` | 根据队伍 ID 在 `teamPalette` 中取色，空值时使用默认蓝色。 |
| `readSetting(key, fallback)` | 从 `localStorage` 读取配置，根据默认值类型推断布尔/数值/字符串。 |

### 画布与布局尺寸

| 方法 | 说明 |
| --- | --- |
| `clampScale(value)` | 将缩放值限制在 `MIN_SCALE` 与 `MAX_SCALE` 之间，非数字回退最小缩放。 |
| `getEffectivePixelRatio()` | 综合 `devicePixelRatio` 与 `visualViewport.scale`（若存在），用于高分屏画布尺寸计算。 |
| `normalizeMapId(value)` | 对输入的地图 ID 做去空格、空串判定，非法时返回 `null`。 |
| `syncMapStageSize()` | 桌面端根据窗口尺寸、布局间距与玩家表显隐动态计算地图区域边长，同时约束配置区与表格高度；移动端恢复默认自适应样式。 |
| `syncMapControlsHost()` | 在桌面端将地图控制按钮插入 `#mapStage`，移动端则移动到外部托盘并显示。 |
| `updateCanvasResolution()` | 按当前视口缩放与像素比设置 `canvas.width/height`，返回布尔值指示是否实际调整。 |
| `resizeCanvas()` | 触发 `syncMapStageSize()`，读取 `#mapStage` 的 CSS 尺寸，结合像素比更新画布，再调用 `renderPlayers()` 重绘。 |
| `applyTransform()` | 依据 `state.viewport` 设置 `#mapViewport` 的 CSS `transform`，并对平移量按像素比对齐，避免渲染模糊。 |
| `resetViewport()` | 重置缩放与平移为默认值，更新画布并重绘。 |
| `zoomAt(point, factor)` | 围绕指定画面坐标缩放：保持缩放中心不变，调整平移与缩放，并触发画布重绘。 |

### 玩家选择与信息展示

| 方法 | 说明 |
| --- | --- |
| `populatePlayerSelect(players)` | 将玩家名称按队伍排序填充到关注下拉框，并依据本地保存的 `selectedPlayer` 维持选择状态。 |
| `updatePlayerInfo()` | 根据当前关注玩家刷新地图右上角焦点卡片，包括昵称颜色、队伍标签、等级/击杀统计与敌友标识背景。 |

### 地图与玩家渲染

| 方法 | 说明 |
| --- | --- |
| `renderPlayers()` | 在 `#mapCanvas` 上绘制玩家：使用 RAW 裁剪参数对齐地图坐标、绘制本地玩家圆点与队伍连线、根据筛选条件决定是否绘制昵称与标记，并复用 `textMeasureCtx` 计算文本宽度，避免重复测量。 |
| `createPlayerTableSnapshot(players)` | 对玩家进行队伍、昵称排序并生成签名字符串。签名用于判断玩家表是否需要重渲染。 |
| `scheduleLayoutRefresh()` | 通过 `requestAnimationFrame` 节流布局更新，确保在显示/隐藏玩家表后重新同步控制区与画布尺寸。 |
| `updatePlayerTableToggleState(hasColumns, isVisible)` | 根据当前勾选列数量与可见性更新“玩家表显示”开关的可用性、文本与 aria 属性。 |
| `updatePlayerTableSectionVisibility(visible)` | 切换玩家表容器与整体布局的隐藏状态，并在桌面端触发布局刷新。 |
| `renderPlayerTable(snapshot?)` | 根据 `settings` 中勾选的列渲染 `<table>`：生成表头、处理空态提示、按队伍分组交替行底色，并缓存签名避免无效重绘。 |

### 地图选择与静态资源

| 方法 | 说明 |
| --- | --- |
| `setMapAuto(enabled)` | 切换自动地图模式：勾选后清除手动选择并回写本地存储，同时尝试同步地图。 |
| `updateManualMapSelectionUI()` | 为地图按钮更新选中态样式与可访问性属性，自动模式下禁用按钮。 |
| `syncMapFromState()` | 根据手动选择或最近一次 WebSocket 推送的地图 ID 调用 `updateMap()`。 |
| `getStaticSourceKey(index)` | 按优先顺序（HTTPS 优先 CDN，否则本地优先）取得资源源键。 |
| `getStaticAssetUrl(assetName, source)` | 拼接静态资源完整 URL。 |
| `applyStaticImageSource(target, assetName, sourceIndex)` | 记录资源来源元数据并设置 `img.src`，供加载失败时回退下一源。返回是否成功设定。 |
| `updateMap(mapId)` | 若地图 ID 变化则显示加载遮罩、尝试从 CDN/本地加载对应图片，已加载则直接调用 `onMapReady()`。找不到资源时显示缺失提示。 |
| `onMapReady()` | 地图图片加载完成后：调整画布、重置视口、标记地图已加载，并依据玩家数据决定遮罩文案，再次绘制玩家。 |

### WebSocket 与数据更新

| 方法 | 说明 |
| --- | --- |
| `buildTarget()` | 根据 `settings.ipaddr` 生成 WebSocket URL：`auto` 模式下在 HTTPS 环境改为 `wss://<host>/ws`，否则回退本地地址或手动输入。 |
| `clearSocket()` | 安全关闭现有 WebSocket，移除事件监听，防止重复连接。 |
| `connect()` | 整体连接流程：构造 URL、建立 WebSocket、更新状态提示；`onopen` 设置已连接状态与遮罩文案，`onmessage` 交给 `handleMessage()`，`onerror` 直接关闭，`onclose` 清理状态、复位 UI 并显示重连提示。 |
| `handleMessage(raw)` | 解析服务器推送 JSON：更新 `latestMessageText`（供导出）、根据 `payload.map` 触发地图同步、将 `payload.players` 交给 `updatePlayers()`。解析失败时记录错误。 |
| `updatePlayers(players)` | 归一化玩家、刷新在线人数、更新关注下拉与遮罩、重绘地图与列表（使用快照签名避免不必要渲染）。 |
| `updateDownloadButtonState()` | 根据是否存在最新原始消息启用或禁用“导出玩家列表”按钮。 |
| `downloadLatestMessage()` | 将最近一次消息序列化为 JSON Blob，生成带时间戳的文件并触发浏览器下载。 |

### 交互与输入处理

| 方法 | 说明 |
| --- | --- |
| `setOverlayState(stateName, title, subtitle, options)` | 设置遮罩状态、标题、副标题与“重连”按钮显隐。 |
| `updateStatus(stateName, label)` | 根据连接状态更新状态灯的颜色、动画与文本。 |
| `updatePointer(event)` | 在多指触控操作中记录当前指针位置，用于平移与捏合缩放。 |
| `createPinchState()` | 若存在两个指针，计算初始触点、中点与视图缩放基准，为后续手势缩放提供参数。 |
| `releasePointer(event)` | 指针抬起/取消时清理状态，必要时恢复拖拽样式或重新建立平移状态。 |

### 其他辅助逻辑

- `isOverlayBlocking()`：判断遮罩是否可交互，若尚未隐藏则阻止地图交互事件。
- `handleLayoutChange`：媒体查询触发的回调，内部调用 `syncMapControlsHost()`、`resizeCanvas()` 与 `renderPlayers()`，在桌面/移动布局切换时保持视图同步。
- `scheduleResize()`：窗口或 `visualViewport` 变动时的节流函数，延迟 120ms 后执行 `resizeCanvas()` 与 `renderPlayers()`，避免频繁重绘。

### 事件监听与调度

- **地图指针事件**：`pointerdown`/`pointermove`/`pointerup`/`pointercancel`/`lostpointercapture` 组合，支持单指拖拽、双指缩放，并在 `isOverlayBlocking()`（遮罩可交互）时禁止操作。
- **滚轮与双击缩放**：`wheel` 事件根据 `deltaY` 调整缩放因子，`dblclick` 在鼠标位置放大。
- **按钮缩放控制**：`#zoomIn`、`#zoomOut`、`#zoomReset` 使用 `zoomAt()` 与 `resetViewport()` 提供中心缩放与复位。
- **布局变化**：`desktopQuery` 的 `change` 事件及 `window`/`visualViewport` 的 `resize`/`scroll` 事件触发 `scheduleResize()`，从而刷新画布并重绘玩家。
- **玩家选择**：`#sel_player` 的 `focus`/`blur` 标记选择模式避免更新时抢焦点，`change` 更新关注玩家与渲染。
- **配置输入**：表单项监听 `change`/`input` 同步 `settings` 与 `localStorage`，并根据配置刷新地图或表格。
- **地图选择按钮**：点击时切换手动地图 ID，并自动退出自动模式。
- **下载按钮**：调用 `downloadLatestMessage()` 导出最近一次消息。
- **重连按钮**：触发 `connect()` 重建 WebSocket。
- **页面卸载**：`beforeunload` 中调用 `clearSocket()` 以优雅关闭连接。

## 数据流总结

1. 页面加载后立即应用翻译、初始化设置，并尝试连接 WebSocket。
2. WebSocket `onmessage` 推送包含地图 ID 与玩家数组的 JSON。
3. `handleMessage()` 解析数据，交给 `updatePlayers()` 与 `updateMap()`。
4. 地图图片加载成功后 `onMapReady()` 重绘；玩家数据变化驱动 `renderPlayers()` 与 `renderPlayerTable()`。
5. 用户通过鼠标/触控/表单交互改变视图或筛选，相关事件更新 `state` 与 `settings` 并触发重新渲染。
6. 所有视觉反馈（遮罩、状态灯、玩家卡片、表格）均直接或间接依赖于 `state` 与 `settings`，确保界面和数据同步。

## 维护建议

- **新增功能**：创建新的 DOM 钩子时保持与 `refs` 命名一致，并更新 `translations` 的三种语言文本。
- **性能注意**：Canvas 渲染依赖实时缩放与拖动，若需绘制更多元素，可考虑复用 `textCache` 思路或增加节流。
- **本地存储键位**：统一使用 `conf_*` 前缀，新增配置时记得在 `settings` 初始化与对应事件中维护。
- **Tailwind 类名**：变更或新增后务必重新执行 Tailwind 编译，并提交更新后的 `styles.css`。

通过以上结构，新成员可以从全局架构入手，再深入了解各方法的职责与调用关系，从而快速上手 HOOZi Radar 前端开发与维护。
