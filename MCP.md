# 拓域 MCP 工具目录

拓域 MCP 目录是一个本地优先的软件、模型与开源项目发现服务。它向 MCP 客户端提供两个只读工具：

- `search_tools`：按关键词、分类或使用场景搜索已审核项目。
- `recommend_tools`：根据用户任务返回带排序依据的项目建议。

当前版本是可运行的 MVP，不会直接控制 Claude、Cursor、ChatGPT 或其他 AI 客户端的最终回答。客户端是否调用工具、如何使用返回结果以及如何展示内容，由各客户端决定。

## 工作方式

```text
创作者浏览器
  catalog.html
       |
       v
Node HTTP API  ---- SQLite: data/catalog.sqlite
       |                    |
       |                    v
  admin.html          src/mcp-server.js
                            |
                            v
                    Claude / Cursor / 其他 MCP 客户端
```

目录页面、管理后台和 MCP Server 共用同一个 SQLite 数据库。项目提交后默认为 `pending`，只有管理员改为 `approved` 后才会进入 MCP 搜索结果。

## 环境要求

- Node.js `22.13.0` 或更高版本
- 支持 stdio MCP Server 的客户端
- 不需要安装 npm 依赖；当前实现使用 Node 内置的 HTTP 与 `node:sqlite`

先启动 HTTP 服务和审核后台：

```powershell
$env:TUOYU_ADMIN_TOKEN = "请替换为至少 16 个字符的随机 Token"
node .\server.js
```

打开：

- 工具目录：`http://127.0.0.1:4173/catalog.html`
- 审核后台：`http://127.0.0.1:4173/admin.html`

服务器默认只监听 `127.0.0.1`。如需部署到其他主机，可显式设置 `HOST`，但必须先补齐身份认证、TLS、反向代理、限流和审计。

## Cursor 配置

项目级配置放在仓库的 `.cursor/mcp.json`，全局配置放在用户目录的 `.cursor/mcp.json`。请将路径替换为当前机器上的绝对路径：

```json
{
  "mcpServers": {
    "tuoyu-catalog": {
      "command": "C:\\Users\\yansihan\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe",
      "args": [
        "C:\\Users\\yansihan\\Documents\\Codex\\2026-10-21\\ba\\src\\mcp-server.js"
      ],
      "env": {
        "TUOYU_DB_PATH": "C:\\Users\\yansihan\\Documents\\Codex\\2026-10-21\\ba\\data\\catalog.sqlite"
      }
    }
  }
}
```

如果 `node` 已经在 `PATH` 中，可以简化：

```json
{
  "mcpServers": {
    "tuoyu-catalog": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\src\\mcp-server.js"
      ]
    }
  }
}
```

## Claude Desktop 配置

Windows 上通常编辑：

```text
%APPDATA%\Claude\claude_desktop_config.json
```

加入：

```json
{
  "mcpServers": {
    "tuoyu-catalog": {
      "command": "node",
      "args": [
        "C:\\absolute\\path\\to\\src\\mcp-server.js"
      ],
      "env": {
        "TUOYU_DB_PATH": "C:\\absolute\\path\\to\\data\\catalog.sqlite"
      }
    }
  }
}
```

保存配置后重启 Claude Desktop。不同客户端版本可能调整配置文件位置或界面入口，应以对应客户端当前文档为准。

## 本地调试

直接启动 stdio Server：

```powershell
npm run mcp:catalog
```

也可以使用 `TUOYU_DB_PATH` 指向独立测试数据库：

```powershell
$env:TUOYU_DB_PATH = "C:\absolute\path\to\data\catalog-test.sqlite"
npm run mcp:catalog
```

stdio Server 不使用 HTTP 端口，客户端通过标准输入输出发送 JSON-RPC 消息。不要把调试日志写到标准输出，否则会破坏 MCP 协议；当前诊断信息写入标准错误。

## `search_tools`

用途：按关键词、分类或场景查找已审核项目。

参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `query` | string | 否 | 项目名、技术词或任务描述，最多 500 字符 |
| `category` | string | 否 | 精确分类，例如 `Agent 平台` |
| `use_case` | string | 否 | 具体使用场景，最多 300 字符 |
| `limit` | integer | 否 | 1 到 50，默认 10 |
| `include_sponsored` | boolean | 否 | 是否允许推广加权，默认 `true` |

调用示例：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_tools",
    "arguments": {
      "query": "本地运行大模型",
      "category": "模型运行时",
      "limit": 5,
      "include_sponsored": true
    }
  }
}
```

## `recommend_tools`

用途：根据用户的具体任务给出候选项目。推荐结果仍先在目录中做相关性筛选，再计算质量分和推广加权。

参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `need` | string | 是 | 用户任务或目标，2 到 500 字符 |
| `category` | string | 否 | 可选精确分类 |
| `limit` | integer | 否 | 1 到 20，默认 5 |
| `include_sponsored` | boolean | 否 | 是否允许推广加权，默认 `true` |

调用示例：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "recommend_tools",
    "arguments": {
      "need": "帮我找一个可以本地运行大模型并暴露 API 的工具",
      "limit": 3,
      "include_sponsored": true
    }
  }
}
```

## 返回结构

每个结果至少包含：

```json
{
  "id": "项目 ID",
  "name": "项目名称",
  "description": "项目描述",
  "links": {
    "website": "https://example.com",
    "repository": "https://github.com/example/project"
  },
  "category": "模型运行时",
  "tags": ["llm", "local"],
  "useCases": ["本地运行大模型"],
  "github": {
    "stars": 12345,
    "lastUpdated": "2026-10-01T00:00:00.000Z"
  },
  "review": {
    "status": "approved",
    "reviewedAt": "2026-10-02T00:00:00.000Z"
  },
  "isPaidPlacement": true,
  "paidPlacement": {
    "tier": "boost",
    "disclosed": true,
    "label": "付费推广"
  },
  "ranking": {
    "relevanceScore": 82,
    "qualityScore": 61,
    "baseScore": 71.5,
    "paidBoost": 8,
    "finalScore": 79.5,
    "isPaidPlacement": true
  }
}
```

顶层还会返回 `result_count`、`sponsored_count` 和 `ranking_policy`。

## 排序与推广规则

排序公式：

```text
finalScore = baseScore + paidBoost
```

基础分由以下信号组成：

- GitHub stars：35%
- 最近更新时间：30%
- 描述质量：25%
- 资料完整度：10%

相关性会与基础质量分组合为 `baseScore`。推广等级：

| `promotionTier` | 加权 |
| --- | ---: |
| `none` | 0 |
| `boost` | +8 |
| `featured` | +15 |

约束：

- 只有 `approved` 项目可以获得推广加权。
- 项目必须先通过关键词、分类或使用场景相关性筛选。
- 设置 `include_sponsored: false` 后，所有 `paidBoost` 都会变为 `0`。
- `isPaidPlacement`、`paidBoost` 和 `paidPlacement.label` 始终披露推广状态。
- 客户端展示推广结果时，应同时展示 `paidPlacement.label`，不得描述为平台客观排名或官方背书。

当前“付费”是本地推广标记模拟。提交接口不会收费，后台也不会调用支付或结算服务。

## HTTP API

公共接口：

- `GET /api/health`
- `GET /api/catalog/search?q=&category=&useCase=&limit=&includeSponsored=`
- `GET /api/catalog/categories`
- `GET /api/catalog/tools/:id`
- `POST /api/catalog/submissions`

管理接口需要：

```http
Authorization: Bearer <TUOYU_ADMIN_TOKEN>
```

- `GET /api/admin/tools?status=pending`
- `PATCH /api/admin/tools/:id`
- `DELETE /api/admin/tools/:id`

后台配置示例：

```json
{
  "status": "approved",
  "promotionTier": "boost",
  "promotionActive": true,
  "githubStars": 12345,
  "lastUpdated": "2026-10-01T00:00:00.000Z",
  "reviewNote": "链接、许可证和 GitHub 指标已核验"
}
```

删除项目：

```http
DELETE /api/admin/tools/项目ID
Authorization: Bearer <TUOYU_ADMIN_TOKEN>
```

删除是永久操作，会同时移除项目审核记录、指标和推广状态。后台界面会在执行前要求二次确认。

## 当前边界

这是本地 MVP，不是公网托管平台。正式上线前必须补齐：

- 公开提交接口的限流、验证码、反垃圾和滥用监控
- 管理员身份系统、最小权限、操作审计和 Token 轮换
- GitHub stars 与更新时间的服务端校验或实时同步
- 远程 MCP 传输、OAuth、租户隔离和配额
- 支付订单、推广有效期、退款和发票状态
- 删除操作审计、误删恢复、项目更正和申诉处理时限
- 正式隐私政策、服务条款、运营者与支持联系方式

在这些条件完成前，不应宣称已接入真实支付、已被各大 AI 平台推荐或能够控制任何 AI 客户端的最终回答。
