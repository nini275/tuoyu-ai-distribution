# 拓域 · Rita AI 项目分发与 MCP 工具目录

面向软件、模型与开源项目的 AI 渠道分发原型。Rita 是拓域中的 AI 分发智能体：它先判断项目定位与渠道匹配度，再为每个渠道生成独立内容，并让所有外部发布动作经过审核与排期。

项目同时提供一个可被其他 AI 客户端调用的 MCP 工具目录。创作者可以提交软件、模型或开源项目，管理员审核后可设置透明标注的推广加权；Claude、Cursor 等 MCP 客户端可以调用 `search_tools` 和 `recommend_tools`。

这不是第二套互相冲突的产品数据。Rita 工作台负责项目分析与内容分发，MCP 目录负责让其他 AI 按结构化数据发现项目；两者共享“先审核、后发布、推广必须披露”的产品原则。目录数据当前保存在服务端 SQLite，工作台草稿仍保存在浏览器本地。

## Rita 的职责

- 读取项目链接、名称、一句话价值和目标用户，形成初始分发画像
- 判断 GitHub、Hugging Face、开发者社区、AI 平台与内容渠道的匹配顺序
- 为不同渠道生成独立内容，并给出可发现性优化动作
- 把内容送入审核、排期和人工发布记录流程，不绕过发布者确认
- 帮助项目形成更完整、稳定、机器可读的公开事实，提高被 AI 搜索和回答系统正确理解及引用的概率

Rita 提升的是项目的可理解性与可发现性，不会向 AI 产品直接注入排名。具体能力与边界见下文。

## 本地运行

需要 Node.js `22.13.0` 或更高版本，因为目录使用 Node 内置的 `node:sqlite`。

当前机器可直接使用 Codex 内置 Node.js：

```powershell
$env:TUOYU_ADMIN_TOKEN = "请替换为至少 16 个字符的随机 Token"
& "C:\Users\yansihan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\server.js
```

打开：

- 工作台：`http://127.0.0.1:4173`
- MCP 工具目录：`http://127.0.0.1:4173/catalog.html`
- 审核后台：`http://127.0.0.1:4173/admin.html`

如果系统已经安装 Node.js，也可以运行：

```powershell
$env:TUOYU_ADMIN_TOKEN = "请替换为至少 16 个字符的随机 Token"
node .\server.js
```

常用命令：

```powershell
npm run mcp:catalog
npm run check
npm test
```

MCP 客户端配置、接口参数和推广披露规则见 [MCP.md](./MCP.md)。

## 项目结构

```text
.
├── index.html / app.js              Rita 项目分发工作台
├── catalog.html / catalog.js        创作者项目搜索与提交页面
├── admin.html / admin.js            Token 保护的目录审核后台
├── server.js                        HTTP 静态服务与目录 API
├── src/
│   ├── api.js                       公共提交/搜索与管理 API
│   ├── mcp-server.js                stdio MCP Server
│   └── catalog/
│       ├── store.js                 SQLite 存储、审核与查询
│       ├── scoring.js               相关性、基础分和推广加权
│       ├── validation.js            提交与后台更新校验
│       └── seed.js                  已审核示例项目
├── test/catalog.test.js             API、SQLite、排序与 MCP 测试
├── MCP.md                           Claude/Cursor 接入说明
└── data/catalog.sqlite              本地运行时数据库（不提交 Git）
```

## 当前能力

- 项目接入与本地规则分析
- 项目发布状态筛选
- 渠道匹配评分与分发顺序建议
- 针对 14 个 AI 模型、开发者与内容渠道生成独立文案
- 内容编辑、复制、审核、自定义时间排期和人工发布记录
- AI 搜索发现页：可发现性检查、搜索问题模拟和优化动作
- 生成可被 AI 与搜索系统读取的项目事实卡、FAQ 线索和 JSON-LD 结构化数据
- 免费版、创作者版与专业版的本地套餐预览和用量限制
- 专业版 7 天试用、月度额度重置和降级保留数据
- 浏览器本地持久化
- 桌面与移动端自适应
- MCP `search_tools` 与 `recommend_tools` 工具
- 项目提交、人工审核、暂停、拒绝和永久删除
- 分类、标签、使用场景与中文关键词检索
- GitHub stars、更新时间、描述质量和资料完整度基础评分
- `boost` 与 `featured` 两级透明推广加权
- 管理员 Token 保护、Session Storage 会话与审核备注

## MCP 目录与推广规则

目录中的项目默认以 `pending` 状态提交，审核通过前不会出现在 API 或 MCP 搜索结果中。

排序公式为：

```text
finalScore = baseScore + paidBoost
```

当前推广等级是本地标记模拟，不涉及真实付款：

| 推广等级 | 加权 |
| --- | ---: |
| `none` | 0 |
| `boost` | +8 |
| `featured` | +15 |

推广加权必须遵守以下边界：

- 只有已审核项目可以获得加权。
- 项目必须先匹配关键词、分类或使用场景。
- 调用方可传 `include_sponsored: false` 完全关闭推广加权。
- 每个推广结果都会返回 `isPaidPlacement`、`paidBoost` 和 `paidPlacement.label`。
- 拓域不能控制 Claude、Cursor、ChatGPT 等客户端最终是否调用工具或如何回答。

当前公开提交接口是 MVP，尚未加入验证码、限流和反垃圾服务；正式公网部署前必须补齐。

## 套餐与付费原型

| 套餐 | 月付 | 年付 | 自建项目 | 每月渠道内容 | 每月 AI 索引包 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 免费版 | ¥0 | ¥0 | 1 个 | 20 份 | 1 份 |
| 创作者版 | ¥49 | ¥399 | 10 个 | 300 份 | 不限量 |
| 专业版 | ¥149 | ¥1,299 | 50 个 | 2,000 份 | 不限量 |

计费规则：

- 年付按 10 个月月付价格计算。
- 每个成功生成的渠道版本计 1 份；接入项目自动生成的 3 个起步版本也计入当月额度。
- AI 索引包每次成功生成或重新生成计 1 份。
- 额度按北京时间自然月重置，未使用额度不结转。
- 整批内容生成前会先校验额度；额度不足时不生成、不扣减。
- 降级不会删除已有项目或内容，只会阻止超限的新增操作。
- 专业版试用为 7 天，每个本地工作区一次。

当前套餐切换是本地功能预览，**不会产生真实扣款**。正式发布后，付款、续订、取消和退款应通过 Microsoft Store 完成，并由服务端验证购买凭证。详细规则见 [PRICING.md](./PRICING.md) 和 [SUBSCRIPTION_TERMS.md](./SUBSCRIPTION_TERMS.md)。

## 本地数据边界

当前版本没有账号系统或云端同步，数据分为两类：

- Rita 工作台的项目、内容、队列、索引包、套餐预览和用量保存在浏览器 `localStorage`，存储键为 `tuoyu-distribution-workspace-v1`。
- MCP 工具目录的提交、审核、指标和推广标记保存在本地 SQLite，默认路径为 `data/catalog.sqlite`。

这意味着：

- 数据不会自动跨设备同步。
- 清理浏览器站点数据会删除本地工作区并重置试用状态。
- 清理 `data/catalog.sqlite` 会删除目录提交、审核和推广记录。
- `localStorage` 不能作为正式付费授权依据。
- Microsoft Store 正式版本必须把购买凭证核验和关键额度控制放到可信服务端。

目录数据库已被 `.gitignore` 排除，不应把本地提交或后台 Token 提交到 Git。隐私边界见 [PRIVACY.md](./PRIVACY.md)。

## AI 搜索发现能力与边界

“AI 发现”页用于提高项目被 AI 搜索和回答系统找到、正确理解、推荐及引用的概率。它会检查 canonical 链接、项目定位、目标受众、内容覆盖、多来源事实、更新时间和机器可读索引包，并针对真实选型问题模拟项目事实与搜索意图的匹配度。

生成的索引包适合同步到项目官网、README、模型卡或其他稳定公开页面。它不是向 ChatGPT、Gemini、Claude 等产品直接注入排名，也不能保证在这些产品中固定排在第一位；各平台是否检索、排序和引用取决于其未公开且持续变化的检索机制。

## 真实发布接入

项目中的渠道状态分为三类：

- `API 接入`：需要对应平台 OAuth 或 API 凭证
- `浏览器辅助`：需要用户登录态与逐步确认
- `人工发布`：需要用户自行完成平台提交

首版不会在缺少授权时自动对外发布，也不模拟真实发布成功。接入生产环境时，建议新增服务端渠道适配器、凭证保险库、操作审计和发布前策略检查，不应把平台密钥放在浏览器端。

## 名称、许可与权利

- 原创代码与文档采用 [Apache License 2.0](./LICENSE) 授权，归属信息见 [NOTICE](./NOTICE)。
- 原创内容、界面与创作成果的版权边界见 [COPYRIGHT.md](./COPYRIGHT.md)。
- “拓域”“TuoYu”“Rita”、项目标志及具有来源识别作用的视觉组合适用 [TRADEMARK.md](./TRADEMARK.md)。Apache-2.0 不授予商标许可；当前文件不表示相关标识已经完成商标注册。
- 第三方图标及其许可证见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
- 用户录入和准备发布的项目材料仍归其各自权利人所有。发布者应确认自己拥有相关软件、模型、图片、文本和商标的使用及发布权利。

## Microsoft Store 状态

项目目前尚未提交 Microsoft Store，也不能仅凭本地静态项目直接上架。实际发布仍需要 Partner Center 开发者账号、应用身份、MSIX/PWA 打包、公网隐私与支持 URL、Store 定价和订阅商品、购买凭证验证、截图和认证流程。完整清单见 [STORE_PUBLISHING.md](./STORE_PUBLISHING.md)。

## 建议的下一阶段

1. 接入项目元数据抓取：GitHub API、Hugging Face API、网站 Open Graph。
2. 接入 LLM 生成服务：以项目事实为检索源，输出结构化渠道内容。
3. 优先实现 GitHub Release 与 Hugging Face 模型卡/仓库更新适配器。
4. 增加团队审核、发布窗口和渠道内容规范版本管理。
