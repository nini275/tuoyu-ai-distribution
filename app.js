const STORAGE_KEY = "tuoyu-distribution-workspace-v1";
const WORKSPACE_VERSION = 2;
const STARTER_CONTENT_COUNT = 3;
const billingPeriodFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
});

const billingPlans = [
  {
    id: "free",
    name: "免费版",
    eyebrow: "START",
    description: "先验证项目定位与首发路径。",
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      projects: 1,
      contentVersions: 20,
      indexPackages: 1,
    },
    features: [
      "1 个自建活跃项目",
      "每月 20 份渠道内容",
      "每月 1 份 AI 索引包",
      "14 个渠道匹配与人工发布",
    ],
  },
  {
    id: "creator",
    name: "创作者版",
    eyebrow: "CREATOR",
    description: "适合持续发布产品、模型与开源版本。",
    monthlyPrice: 49,
    yearlyPrice: 399,
    featured: true,
    limits: {
      projects: 10,
      contentVersions: 300,
      indexPackages: Number.POSITIVE_INFINITY,
    },
    features: [
      "10 个自建活跃项目",
      "每月 300 份渠道内容",
      "AI 索引包不限量",
      "完整审核、排期与发布记录",
    ],
  },
  {
    id: "pro",
    name: "专业版",
    eyebrow: "PRO",
    description: "面向高频发布与多项目运营。",
    monthlyPrice: 149,
    yearlyPrice: 1299,
    limits: {
      projects: 50,
      contentVersions: 2000,
      indexPackages: Number.POSITIVE_INFINITY,
    },
    features: [
      "50 个自建活跃项目",
      "每月 2,000 份渠道内容",
      "AI 索引包不限量",
      "适合批量分发与长期运营",
    ],
  },
];

const channelCatalog = [
  {
    id: "huggingface",
    name: "Hugging Face",
    group: "模型与 Agent",
    description: "模型卡、Spaces 与开源 AI 项目曝光",
    audiences: ["AI 工程师", "研究者"],
    reach: "全球 AI 开发者",
    mode: "api",
    color: "#8a6b16",
    bg: "#fff5cf",
    fit: 94,
    channelFormat: "模型卡 / Space 描述",
  },
  {
    id: "github",
    name: "GitHub",
    group: "开发者社区",
    description: "通过 Release、README 与组织动态分发",
    audiences: ["工程师", "开源开发者"],
    reach: "全球开发者",
    mode: "api",
    color: "#303a36",
    bg: "#eef1ef",
    fit: 92,
    channelFormat: "Release 说明",
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    group: "新品目录",
    description: "面向早期用户与工具猎手的首发阵地",
    audiences: ["产品经理", "早期用户"],
    reach: "全球产品社区",
    mode: "manual",
    color: "#c14b2e",
    bg: "#fff0ea",
    fit: 84,
    channelFormat: "首发帖",
  },
  {
    id: "modelscope",
    name: "ModelScope 魔搭",
    group: "模型与 Agent",
    description: "中文模型与 Space 的展示和评测入口",
    audiences: ["AI 工程师", "研究者"],
    reach: "中文 AI 开发者",
    mode: "api",
    color: "#6751ac",
    bg: "#f0ecff",
    fit: 90,
    channelFormat: "模型介绍",
  },
  {
    id: "poe",
    name: "Poe",
    group: "模型与 Agent",
    description: "面向 Bot 与 AI 应用消费者的分发平台",
    audiences: ["AI 用户", "创作者"],
    reach: "AI 消费者",
    mode: "assisted",
    color: "#5541a2",
    bg: "#f1edff",
    fit: 79,
    channelFormat: "Bot 简介",
  },
  {
    id: "coze",
    name: "扣子 Coze",
    group: "模型与 Agent",
    description: "Agent、Bot 与工作流的商店式分发",
    audiences: ["业务用户", "AI 创作者"],
    reach: "中文 AI 用户",
    mode: "assisted",
    color: "#216959",
    bg: "#e5f4ef",
    fit: 82,
    channelFormat: "Agent 介绍",
  },
  {
    id: "dify",
    name: "Dify Marketplace",
    group: "模型与 Agent",
    description: "插件、模板与工作流进入企业 AI 生态",
    audiences: ["AI 工程师", "企业团队"],
    reach: "企业 AI 用户",
    mode: "manual",
    color: "#2469a5",
    bg: "#e8f2fb",
    fit: 76,
    channelFormat: "插件说明",
  },
  {
    id: "hackernews",
    name: "Hacker News",
    group: "开发者社区",
    description: "技术叙事与真实结果驱动的高质量讨论",
    audiences: ["工程师", "创始人"],
    reach: "技术决策者",
    mode: "api",
    color: "#d85d27",
    bg: "#fff0e8",
    fit: 86,
    channelFormat: "Show HN",
  },
  {
    id: "v2ex",
    name: "V2EX",
    group: "开发者社区",
    description: "中文开发者社区分享与产品反馈",
    audiences: ["工程师", "独立开发者"],
    reach: "中文技术社区",
    mode: "api",
    color: "#46555d",
    bg: "#eef2f4",
    fit: 80,
    channelFormat: "分享主题",
  },
  {
    id: "jike",
    name: "即刻",
    group: "中文内容",
    description: "用动态和产品故事触达中文科技人群",
    audiences: ["产品经理", "科技从业者"],
    reach: "中文科技社区",
    mode: "assisted",
    color: "#c99600",
    bg: "#fff8d9",
    fit: 74,
    channelFormat: "社区动态",
  },
  {
    id: "zhihu",
    name: "知乎",
    group: "中文内容",
    description: "以问题与深度解析建立长期搜索入口",
    audiences: ["专业用户", "中文用户"],
    reach: "中文搜索用户",
    mode: "manual",
    color: "#2269b6",
    bg: "#e9f2fc",
    fit: 69,
    channelFormat: "问答文章",
  },
  {
    id: "futurepedia",
    name: "Futurepedia",
    group: "新品目录",
    description: "AI 工具目录，适合明确的搜索型需求",
    audiences: ["AI 用户", "产品经理"],
    reach: "全球 AI 用户",
    mode: "manual",
    color: "#558139",
    bg: "#edf7e7",
    fit: 77,
    channelFormat: "工具收录",
  },
  {
    id: "theresanaiforthat",
    name: "There's An AI For That",
    group: "新品目录",
    description: "以任务场景为核心的 AI 工具发现平台",
    audiences: ["AI 用户", "内容创作者"],
    reach: "全球 AI 用户",
    mode: "manual",
    color: "#8a4724",
    bg: "#fff1e9",
    fit: 72,
    channelFormat: "任务描述",
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    group: "中文内容",
    description: "以真实使用场景触达创作者与泛用户",
    audiences: ["创作者", "泛用户"],
    reach: "中文内容用户",
    mode: "assisted",
    color: "#c83d45",
    bg: "#ffedee",
    fit: 64,
    channelFormat: "场景笔记",
  },
];

const now = new Date();
const demoProjects = [
  {
    id: "agentloom",
    name: "Agentloom",
    url: "https://github.com/agentloom/agentloom",
    tagline: "把多智能体协作变成一组可测试、可观测的工作流原语。",
    type: "开源框架",
    stage: "正式发布",
    audience: "AI 工程师、Agent 开发者",
    color: "#205fd7",
    score: 91,
    channels: ["github", "huggingface", "hackernews", "v2ex", "producthunt"],
    createdAt: "2026-10-18T09:20:00.000Z",
    source: "github",
    isDemo: true,
  },
  {
    id: "lumen-3b",
    name: "Lumen 3B",
    url: "https://huggingface.co/lumen-ai/lumen-3b",
    tagline: "为中文端侧设备设计的轻量多模态模型，2.8GB 显存可运行。",
    type: "基础模型",
    stage: "开源首发",
    audience: "模型研究者、端侧 AI 开发者",
    color: "#167457",
    score: 87,
    channels: ["huggingface", "modelscope", "github", "hackernews", "zhihu"],
    createdAt: "2026-10-15T06:40:00.000Z",
    source: "model",
    isDemo: true,
  },
];

const demoAssets = [
  {
    id: "asset-1",
    projectId: "agentloom",
    channelId: "github",
    title: "Agentloom v1.0：可观测的多智能体工作流原语",
    body:
      "Agentloom v1.0 is now available.\n\nWe built Agentloom for teams that need multi-agent systems to behave less like a demo and more like production software. The release includes deterministic graph execution, per-step tracing, replayable runs, and provider-neutral tool adapters.\n\nHighlights:\n- Typed workflow graphs with retry and fallback policies\n- OpenTelemetry-compatible traces for every agent step\n- Local replay for failed runs\n- First-class support for Python and TypeScript\n\nTry the quickstart or open an issue with a trace bundle if something breaks.",
    tags: [],
    status: "review",
    createdAt: "2026-10-20T08:30:00.000Z",
  },
  {
    id: "asset-2",
    projectId: "agentloom",
    channelId: "hackernews",
    title: "Show HN: Agentloom – observable workflow primitives for multi-agent systems",
    body:
      "We kept running into the same failure mode with multi-agent projects: they worked in a notebook, then became impossible to debug once the graph grew. Agentloom is our attempt at a smaller, typed runtime with tracing and replay built in.\n\nThe core is a graph executor. You define typed nodes, connect them with retry/fallback policies, and every model call and tool call emits an OpenTelemetry-compatible trace. Failed runs can be replayed locally from their recorded inputs.\n\nIt is Apache-2.0 and supports Python and TypeScript. I would especially value feedback on the graph API and whether the trace format is useful for your own debugging workflow.",
    tags: [],
    status: "ready",
    createdAt: "2026-10-20T10:10:00.000Z",
  },
  {
    id: "asset-3",
    projectId: "lumen-3b",
    channelId: "huggingface",
    title: "Lumen-3B：轻量中文多模态基础模型",
    body:
      "Lumen-3B 是为中文端侧场景训练的轻量多模态模型，重点优化低显存推理、中文图文理解与结构化输出。\n\n模型支持图像问答、文档理解与轻量 OCR 辅助任务。通过 4-bit 量化，可在约 2.8GB 显存下运行。发布包包含推理示例、评测卡片与部署说明。\n\n适合设备端知识库、截图理解与离线辅助等场景。建议在生产部署前使用你的业务样本完成二次评测。",
    tags: ["multimodal", "chinese", "edge-ai"],
    status: "scheduled",
    createdAt: "2026-10-19T04:00:00.000Z",
    scheduledAt: "2026-10-22T02:30:00.000Z",
  },
];

const demoQueue = [
  {
    id: "queue-1",
    assetId: "asset-1",
    projectId: "agentloom",
    channelId: "github",
    status: "review",
    scheduledAt: null,
    createdAt: "2026-10-21T01:20:00.000Z",
  },
  {
    id: "queue-2",
    assetId: "asset-2",
    projectId: "agentloom",
    channelId: "hackernews",
    status: "ready",
    scheduledAt: null,
    createdAt: "2026-10-21T02:10:00.000Z",
  },
  {
    id: "queue-3",
    assetId: "asset-3",
    projectId: "lumen-3b",
    channelId: "huggingface",
    status: "scheduled",
    scheduledAt: "2026-10-22T02:30:00.000Z",
    createdAt: "2026-10-20T07:10:00.000Z",
  },
];

const defaultState = {
  version: WORKSPACE_VERSION,
  projects: demoProjects,
  assets: demoAssets,
  queue: demoQueue,
  generatedAssets: [],
  billing: createDefaultBilling(),
};

let state = loadState();
let currentView = "overview";
let activeProjectId = state.projects[0]?.id || null;
let projectFilter = "全部";
let channelFilter = "全部";
let channelQuery = "";
let queueFilter = "全部";
let discoveryQuery = "";
let discoveryProbeResult = null;
let studioSettings = {
  projectId: state.projects[0]?.id || "",
  channels: ["github", "huggingface", "hackernews"],
  tone: "技术可信",
  language: "自动",
  goal: "首发",
};
let commandFocus = 0;

const appContent = document.querySelector("#app-content");
const modalBackdrop = document.querySelector("#modal-backdrop");
const intakeModal = document.querySelector("#intake-modal");
const detailModal = document.querySelector("#detail-modal");
const detailModalContent = document.querySelector("#detail-modal-content");
const assetModal = document.querySelector("#asset-modal");
const assetModalContent = document.querySelector("#asset-modal-content");
const scheduleModal = document.querySelector("#schedule-modal");
const scheduleForm = document.querySelector("#schedule-form");
const scheduleSummary = document.querySelector("#schedule-summary");
const scheduleAtInput = document.querySelector("#schedule-at-input");
const commandModal = document.querySelector("#command-modal");
const commandInput = document.querySelector("#command-input");
const commandResults = document.querySelector("#command-results");
const billingModal = document.querySelector("#billing-modal");
const billingModalContent = document.querySelector("#billing-modal-content");
const toastRegion = document.querySelector("#toast-region");
let billingContext = "";
let billingContextNeed = 0;
let billingPreviewInterval = "monthly";

document.addEventListener("DOMContentLoaded", () => {
  refreshIcons();
  updateProfileSummary();
  render();
  bindGlobalEvents();
});

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(defaultState);
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.assets) || !Array.isArray(parsed.queue)) {
      return structuredClone(defaultState);
    }
    return migrateWorkspace(parsed);
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  syncBillingStatus(false);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentPeriodKey(date = new Date()) {
  const parts = Object.fromEntries(
    billingPeriodFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}`;
}

function createDefaultBilling() {
  return {
    planId: "free",
    interval: "monthly",
    source: "free",
    trialUsed: false,
    trialEndsAt: null,
    usage: {
      periodKey: currentPeriodKey(),
      contentVersions: 0,
      indexPackages: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

function migrateWorkspace(workspace) {
  const demoIds = new Set(["agentloom", "lumen-3b"]);
  const projects = workspace.projects.map((project) =>
    demoIds.has(project.id) ? { ...project, isDemo: true } : { ...project, isDemo: Boolean(project.isDemo) },
  );
  return {
    version: WORKSPACE_VERSION,
    projects,
    assets: workspace.assets,
    queue: workspace.queue,
    generatedAssets: Array.isArray(workspace.generatedAssets) ? workspace.generatedAssets : [],
    billing: normalizeBilling(workspace.billing),
  };
}

function normalizeBilling(billing) {
  const fallback = createDefaultBilling();
  if (!billing || typeof billing !== "object") return fallback;
  const validPlan = billingPlans.some((plan) => plan.id === billing.planId);
  const next = {
    ...fallback,
    ...billing,
    planId: validPlan ? billing.planId : "free",
    interval: ["monthly", "yearly"].includes(billing.interval) ? billing.interval : "monthly",
    usage: {
      ...fallback.usage,
      ...(billing.usage || {}),
    },
  };

  const trialTime = next.trialEndsAt ? new Date(next.trialEndsAt).getTime() : Number.NaN;
  if (next.source === "trial" && (!Number.isFinite(trialTime) || trialTime <= Date.now())) {
    next.planId = "free";
    next.source = "trial-expired";
    next.trialEndsAt = null;
  }

  if (next.usage.periodKey !== currentPeriodKey()) {
    next.usage = {
      periodKey: currentPeriodKey(),
      contentVersions: 0,
      indexPackages: 0,
    };
  }

  next.usage.contentVersions = Math.max(0, Number(next.usage.contentVersions) || 0);
  next.usage.indexPackages = Math.max(0, Number(next.usage.indexPackages) || 0);
  return next;
}

function syncBillingStatus(shouldPersist = true) {
  let changed = false;
  if (state.billing.usage.periodKey !== currentPeriodKey()) {
    state.billing.usage = {
      periodKey: currentPeriodKey(),
      contentVersions: 0,
      indexPackages: 0,
    };
    changed = true;
  }

  if (state.billing.source === "trial") {
    const trialTime = state.billing.trialEndsAt ? new Date(state.billing.trialEndsAt).getTime() : Number.NaN;
    if (!Number.isFinite(trialTime) || trialTime <= Date.now()) {
      state.billing.planId = "free";
      state.billing.source = "trial-expired";
      state.billing.trialEndsAt = null;
      changed = true;
    }
  }

  if (changed && shouldPersist) persist();
  return changed;
}

function getBillingPlan(planId = state.billing.planId) {
  return billingPlans.find((plan) => plan.id === planId) || billingPlans[0];
}

function getBillingSnapshot() {
  syncBillingStatus(false);
  const plan = getBillingPlan();
  const billableProjects = state.projects.filter((project) => !project.isDemo).length;
  return {
    plan,
    billableProjects,
    usage: state.billing.usage,
    remaining: {
      projects: Math.max(0, plan.limits.projects - billableProjects),
      contentVersions: Math.max(0, plan.limits.contentVersions - state.billing.usage.contentVersions),
      indexPackages: Math.max(0, plan.limits.indexPackages - state.billing.usage.indexPackages),
    },
  };
}

function formatUsageLimit(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat("zh-CN").format(value) : "不限";
}

function getRemainingUsage(limit, used) {
  return Number.isFinite(limit) ? Math.max(0, limit - used) : Number.POSITIVE_INFINITY;
}

function getAllAssets() {
  const assetsById = new Map();
  [...state.generatedAssets, ...state.assets].forEach((asset) => {
    if (asset?.id && !assetsById.has(asset.id)) assetsById.set(asset.id, asset);
  });
  return [...assetsById.values()];
}

function getProjectAssets(projectId) {
  if (!projectId) return [];
  return getAllAssets().filter((asset) => asset.projectId === projectId);
}

function updateProfileSummary() {
  const profileLabel = document.querySelector("#profile-plan-label");
  if (!profileLabel) return;
  const snapshot = getBillingSnapshot();
  const sourceLabel =
    state.billing.source === "trial"
      ? "专业版试用"
      : state.billing.source === "preview"
        ? `${snapshot.plan.name} · 本地预览`
        : snapshot.plan.name;
  profileLabel.textContent =
    snapshot.plan.id === "free"
      ? `${sourceLabel} · 本月剩 ${formatUsageLimit(snapshot.remaining.contentVersions)} 份内容`
      : `${sourceLabel} · ${state.billing.interval === "yearly" ? "年付" : "月付"}`;
}

function openBilling(context = "account", options = {}) {
  billingContext = context;
  billingContextNeed = Math.max(0, Number(options.need) || 0);
  billingPreviewInterval = ["monthly", "yearly"].includes(state.billing.interval)
    ? state.billing.interval
    : "monthly";
  closeAllModals();
  modalBackdrop.hidden = false;
  billingModal.hidden = false;
  renderBillingModal();
  requestAnimationFrame(() => billingModal.querySelector("[data-close-modal]")?.focus());
}

function renderBillingModal() {
  if (!billingModalContent) return;
  const snapshot = getBillingSnapshot();
  const currentPlan = snapshot.plan;
  const periodLabel = formatBillingPeriod(state.billing.usage.periodKey);
  const trialDays =
    state.billing.source === "trial" && state.billing.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(state.billing.trialEndsAt).getTime() - Date.now()) / 86_400_000))
      : 0;
  const currentPrice =
    currentPlan.id === "free"
      ? "¥0"
      : `${formatCurrency(currentPlan[state.billing.interval === "yearly" ? "yearlyPrice" : "monthlyPrice"])}/${
          state.billing.interval === "yearly" ? "年" : "月"
        }`;

  billingModalContent.innerHTML = `
    <div class="billing-modal-header">
      <div>
        <span class="eyebrow">PLAN &amp; USAGE</span>
        <h2 id="billing-modal-title">套餐与用量</h2>
        <p>额度按北京时间自然月重置。当前为本地预览；正式发布后的扣款、续订与退款由 Microsoft Store 处理。</p>
      </div>
      <button class="icon-button" type="button" data-close-modal aria-label="关闭">${icon("x")}</button>
    </div>
    <div class="billing-modal-body">
      ${renderBillingContextAlert(snapshot)}

      <section class="billing-current" aria-label="当前套餐">
        <div class="billing-current-copy">
          <span class="billing-source-badge">${escapeHTML(getBillingSourceLabel())}</span>
          <div>
            <h3>${escapeHTML(currentPlan.name)}</h3>
            <p>${escapeHTML(currentPlan.description)}</p>
          </div>
        </div>
        <div class="billing-current-side">
          <strong>${escapeHTML(currentPrice)}</strong>
          <span>${
            state.billing.source === "trial"
              ? `免费试用中，剩余 ${trialDays} 天`
              : `当前周期：${escapeHTML(periodLabel)}`
          }</span>
        </div>
      </section>

      <section class="billing-usage" aria-labelledby="billing-usage-title">
        <div class="billing-section-heading">
          <div>
            <h3 id="billing-usage-title">本月用量</h3>
            <p>演示项目不占额度；已有内容不会因降级被删除。</p>
          </div>
          <span>${escapeHTML(periodLabel)}</span>
        </div>
        <div class="billing-usage-grid">
          ${renderBillingUsageItem("boxes", "自建项目", snapshot.billableProjects, currentPlan.limits.projects, "演示项目已排除")}
          ${renderBillingUsageItem("file-text", "渠道内容", state.billing.usage.contentVersions, currentPlan.limits.contentVersions, "每个成功生成的渠道版本计 1 份")}
          ${renderBillingUsageItem("file-code-2", "AI 索引包", state.billing.usage.indexPackages, currentPlan.limits.indexPackages, "每次生成或重新生成计 1 份")}
        </div>
      </section>

      <section class="billing-plans-section" aria-labelledby="billing-plans-title">
        <div class="billing-plan-heading">
          <div>
            <h3 id="billing-plans-title">选择适合发布节奏的套餐</h3>
            <p>年付按 10 个月计价。降级后仍可访问已有项目，但超限操作会暂停。</p>
          </div>
          <div class="billing-interval-toggle" role="group" aria-label="计费周期">
            <button type="button" data-billing-interval="monthly" class="${billingPreviewInterval === "monthly" ? "is-active" : ""}">月付</button>
            <button type="button" data-billing-interval="yearly" class="${billingPreviewInterval === "yearly" ? "is-active" : ""}">年付 · 省 2 个月</button>
          </div>
        </div>
        <div class="billing-plan-grid">
          ${billingPlans.map((plan) => renderBillingPlanCard(plan)).join("")}
        </div>
      </section>

      <div class="billing-store-note">
        <span>${icon("shield-check")}</span>
        <div>
          <strong>本地原型预览，不会产生真实扣款</strong>
          <p>正式发布后，套餐购买与续订将通过 Microsoft Store 完成。当前切换只用于验证额度和界面，Store 商品 ID 与购买凭证核验尚未接入。详见 <a href="./SUBSCRIPTION_TERMS.md">订阅条款</a> 与 <a href="./PRIVACY.md">隐私说明</a>。</p>
        </div>
      </div>
    </div>
  `;
  refreshIcons();
}

function renderBillingContextAlert(snapshot) {
  if (billingContext === "account") return "";
  const messages = {
    projects: {
      title: "项目额度已用完",
      detail: `${snapshot.plan.name}最多管理 ${formatUsageLimit(snapshot.plan.limits.projects)} 个自建项目。已有项目不会被删除。`,
    },
    content: {
      title: "渠道内容额度不足",
      detail:
        billingContextNeed > 0
          ? `本次需要 ${billingContextNeed} 份，本月仅剩 ${formatUsageLimit(snapshot.remaining.contentVersions)} 份。未生成的内容不会扣除额度。`
          : `本月仅剩 ${formatUsageLimit(snapshot.remaining.contentVersions)} 份渠道内容。`,
    },
    discovery: {
      title: "AI 索引包额度已用完",
      detail: `${snapshot.plan.name}每月可生成 ${formatUsageLimit(snapshot.plan.limits.indexPackages)} 份索引包。已有索引包仍可复制和使用。`,
    },
  };
  const message = messages[billingContext];
  if (!message) return "";
  return `
    <div class="billing-context-alert" role="status">
      <span>${icon("triangle-alert")}</span>
      <div>
        <strong>${escapeHTML(message.title)}</strong>
        <p>${escapeHTML(message.detail)}</p>
      </div>
    </div>
  `;
}

function renderBillingUsageItem(iconName, label, used, limit, detail) {
  const unlimited = !Number.isFinite(limit);
  const percent = unlimited ? 100 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const remaining = getRemainingUsage(limit, used);
  return `
    <article class="billing-usage-item ${used >= limit && !unlimited ? "is-exhausted" : ""}">
      <div class="billing-usage-item-head">
        <span>${icon(iconName)}</span>
        <div>
          <strong>${escapeHTML(label)}</strong>
          <p>${escapeHTML(detail)}</p>
        </div>
      </div>
      <div class="billing-usage-value">
        <strong>${new Intl.NumberFormat("zh-CN").format(used)}</strong>
        <span>/ ${escapeHTML(formatUsageLimit(limit))}</span>
      </div>
      <div class="billing-progress ${unlimited ? "is-unlimited" : ""}" aria-hidden="true">
        <i style="width:${percent}%"></i>
      </div>
      <small>${
        unlimited ? "当前套餐不限量" : remaining > 0 ? `剩余 ${formatUsageLimit(remaining)}` : "本月额度已用完"
      }</small>
    </article>
  `;
}

function renderBillingPlanCard(plan) {
  const interval = billingPreviewInterval;
  const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const isCurrent = plan.id === state.billing.planId;
  const trialAvailable = plan.id === "pro" && !state.billing.trialUsed;
  const isTrialPlan = plan.id === "pro" && state.billing.source === "trial";
  const monthlyEquivalent =
    interval === "yearly" && plan.yearlyPrice > 0 ? plan.yearlyPrice / 12 : null;
  const annualSaving = plan.monthlyPrice * 12 - plan.yearlyPrice;
  const button = isCurrent
    ? `<button class="button button--secondary" type="button" disabled>${icon("check")} 当前套餐</button>`
    : trialAvailable
      ? `<button class="button button--primary" type="button" data-start-trial>${icon("gift")} 免费试用 7 天</button>`
      : `<button class="button button--primary" type="button" data-preview-plan="${plan.id}">${icon("eye")} 预览${plan.id === "free" ? "免费版" : "此套餐"}</button>`;

  return `
    <article class="billing-plan-card ${plan.featured ? "billing-plan-card--featured" : ""}" data-billing-plan="${plan.id}">
      <div class="billing-plan-card-head">
        <span>${escapeHTML(plan.eyebrow)}</span>
        ${isTrialPlan ? `<em>试用中</em>` : plan.featured ? `<em>推荐</em>` : ""}
      </div>
      <h4>${escapeHTML(plan.name)}</h4>
      <p>${escapeHTML(plan.description)}</p>
      <div class="billing-plan-price">
        <strong>${escapeHTML(formatCurrency(price))}</strong>
        <span>${plan.id === "free" ? "永久" : interval === "yearly" ? "/ 年" : "/ 月"}</span>
      </div>
      <small class="billing-plan-equivalent">${
        monthlyEquivalent
          ? `约 ${escapeHTML(formatCurrency(monthlyEquivalent))}/月 · 比月付省 ${escapeHTML(formatCurrency(annualSaving))}`
          : plan.id === "free"
            ? "无需付款"
            : "可随时通过 Microsoft Store 取消续订"
      }</small>
      <ul class="billing-plan-features">
        ${plan.features.map((feature) => `<li>${icon("check")}<span>${escapeHTML(feature)}</span></li>`).join("")}
      </ul>
      <div class="billing-plan-footer">
        ${button}
        ${
          plan.id !== "free"
            ? `<button class="billing-store-pending" type="button" data-store-checkout>${icon("store")} Microsoft Store 订阅待接入</button>`
            : `<span class="billing-plan-caption">适合验证首个作品</span>`
        }
      </div>
    </article>
  `;
}

function formatCurrency(value) {
  return `¥${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatBillingPeriod(periodKey) {
  const [year, month] = String(periodKey || "").split("-");
  return year && month ? `${year} 年 ${Number(month)} 月` : "当前月份";
}

function getBillingSourceLabel() {
  return (
    {
      free: "免费套餐",
      preview: "本地套餐预览",
      trial: "专业版试用",
      "trial-expired": "试用已结束",
      store: "Microsoft Store 订阅",
    }[state.billing.source] || "免费套餐"
  );
}

function previewBillingPlan(planId) {
  const plan = billingPlans.find((item) => item.id === planId);
  if (!plan) return;
  state.billing.planId = plan.id;
  state.billing.interval = plan.id === "free" ? "monthly" : billingPreviewInterval;
  state.billing.source = plan.id === "free" ? "free" : "preview";
  state.billing.trialEndsAt = null;
  billingContext = "account";
  billingContextNeed = 0;
  persist();
  updateProfileSummary();
  renderBillingModal();
  showToast(
    `${plan.name}已设为本地预览`,
    plan.id === "free" ? "额度已切换，未删除任何已有项目或内容" : "不会扣款；正式订阅仍需 Microsoft Store 结算",
  );
}

function startProfessionalTrial() {
  if (state.billing.trialUsed) {
    showToast("试用资格已使用", "每个工作区只能领取一次专业版 7 天试用");
    return;
  }
  const endsAt = new Date(Date.now() + 7 * 86_400_000).toISOString();
  state.billing.planId = "pro";
  state.billing.interval = "monthly";
  state.billing.source = "trial";
  state.billing.trialUsed = true;
  state.billing.trialEndsAt = endsAt;
  billingContext = "account";
  billingContextNeed = 0;
  persist();
  updateProfileSummary();
  renderBillingModal();
  showToast("专业版试用已开始", "7 天内可使用专业版额度，到期后自动回到免费版");
}

function ensureProjectCreationAllowed() {
  const snapshot = getBillingSnapshot();
  if (snapshot.remaining.projects < 1) {
    openBilling("projects");
    return false;
  }
  if (snapshot.remaining.contentVersions < STARTER_CONTENT_COUNT) {
    openBilling("content", { need: STARTER_CONTENT_COUNT });
    return false;
  }
  return true;
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "aria-hidden": "true",
        "stroke-width": 1.8,
      },
    });
  }
}

function bindGlobalEvents() {
  document.addEventListener("click", handleDelegatedClick);
  document.addEventListener("change", handleDelegatedChange);
  document.addEventListener("input", handleDelegatedInput);
  document.addEventListener("submit", handleDelegatedSubmit);

  document.querySelector("#intake-form").addEventListener("submit", handleIntakeSubmit);
  scheduleForm.addEventListener("submit", handleScheduleSubmit);

  document.querySelector("#search-trigger").addEventListener("click", openCommand);
  document.querySelector("#signal-button").addEventListener("click", () => {
    showToast("渠道信号已刷新", "今日有 3 个渠道适合提高发布优先级");
  });
  document.querySelector("#notification-button").addEventListener("click", () => {
    showToast("没有新的阻塞项", "2 项内容等待你完成发布前审核");
  });
  document.querySelector("#profile-button").addEventListener("click", () => openBilling("account"));

  document.addEventListener("keydown", handleGlobalKeydown);
  modalBackdrop.addEventListener("click", closeAllModals);
  commandInput.addEventListener("input", () => {
    commandFocus = 0;
    renderCommandResults(commandInput.value);
  });
}

function handleDelegatedClick(event) {
  const openBillingButton = event.target.closest("[data-open-billing]");
  if (openBillingButton) {
    openBilling(openBillingButton.dataset.openBilling || "account");
    return;
  }

  const billingIntervalButton = event.target.closest("[data-billing-interval]");
  if (billingIntervalButton) {
    billingPreviewInterval = billingIntervalButton.dataset.billingInterval;
    renderBillingModal();
    return;
  }

  const previewPlanButton = event.target.closest("[data-preview-plan]");
  if (previewPlanButton) {
    previewBillingPlan(previewPlanButton.dataset.previewPlan);
    return;
  }

  const startTrialButton = event.target.closest("[data-start-trial]");
  if (startTrialButton) {
    startProfessionalTrial();
    return;
  }

  const storeCheckoutButton = event.target.closest("[data-store-checkout]");
  if (storeCheckoutButton) {
    showToast("Microsoft Store 结算尚未连接", "当前仅验证套餐与额度，不会产生扣款");
    return;
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    switchView(viewButton.dataset.view);
    return;
  }

  const openIntakeButton = event.target.closest("[data-open-intake]");
  if (openIntakeButton) {
    openIntake();
    return;
  }

  const closeButton = event.target.closest("[data-close-modal]");
  if (closeButton) {
    closeAllModals();
    return;
  }

  const projectButton = event.target.closest("[data-open-project]");
  if (projectButton) {
    openProjectDetail(projectButton.dataset.openProject);
    return;
  }

  const discoveryQueryButton = event.target.closest("[data-discovery-query]");
  if (discoveryQueryButton) {
    runDiscoveryProbe(discoveryQueryButton.dataset.discoveryQuery);
    return;
  }

  const generateDiscoveryButton = event.target.closest("[data-generate-discovery]");
  if (generateDiscoveryButton) {
    generateDiscoveryPackage();
    return;
  }

  const copyDiscoveryButton = event.target.closest("[data-copy-discovery]");
  if (copyDiscoveryButton) {
    copyDiscoveryPackage();
    return;
  }

  const channelButton = event.target.closest("[data-add-channel]");
  if (channelButton) {
    addChannelToStudio(channelButton.dataset.addChannel);
    return;
  }

  const assetButton = event.target.closest("[data-open-asset]");
  if (assetButton) {
    openAssetEditor(assetButton.dataset.openAsset);
    return;
  }

  const copyButton = event.target.closest("[data-copy-text]");
  if (copyButton) {
    copyToClipboard(copyButton.dataset.copyText, "文案已复制");
    return;
  }

  const generateButton = event.target.closest("[data-generate]");
  if (generateButton) {
    generateContentPack();
    return;
  }

  const queueButton = event.target.closest("[data-queue-asset]");
  if (queueButton) {
    queueAsset(queueButton.dataset.queueAsset);
    return;
  }

  const approveButton = event.target.closest("[data-approve-queue]");
  if (approveButton) {
    approveQueueItem(approveButton.dataset.approveQueue);
    return;
  }

  const publishButton = event.target.closest("[data-mark-published]");
  if (publishButton) {
    markPublished(publishButton.dataset.markPublished);
    return;
  }

  const removeQueueButton = event.target.closest("[data-remove-queue]");
  if (removeQueueButton) {
    removeQueueItem(removeQueueButton.dataset.removeQueue);
    return;
  }

  const filterButton = event.target.closest("[data-channel-filter]");
  if (filterButton) {
    channelFilter = filterButton.dataset.channelFilter;
    renderChannels();
    return;
  }

  const projectFilterButton = event.target.closest("[data-project-filter]");
  if (projectFilterButton) {
    projectFilter = projectFilterButton.dataset.projectFilter;
    renderProjects();
    return;
  }

  const queueFilterButton = event.target.closest("[data-queue-filter]");
  if (queueFilterButton) {
    queueFilter = queueFilterButton.dataset.queueFilter;
    renderQueue();
    return;
  }

  const segmentButton = event.target.closest("[data-setting]");
  if (segmentButton) {
    const key = segmentButton.dataset.setting;
    studioSettings[key] = segmentButton.dataset.value;
    renderStudio();
    return;
  }
  const commandResult = event.target.closest("[data-command-index]");
  if (commandResult) {
    executeCommand(Number(commandResult.dataset.commandIndex));
    return;
  }

  const saveAssetButton = event.target.closest("[data-save-asset]");
  if (saveAssetButton) {
    event.preventDefault();
    saveAssetEdit(saveAssetButton.dataset.saveAsset, saveAssetButton.closest("form"));
    return;
  }

  if (event.target === commandModal) {
    closeCommand();
  }
}

function handleDelegatedChange(event) {
  if (event.target.matches("[data-studio-project]")) {
    studioSettings.projectId = event.target.value;
    activeProjectId = event.target.value;
    const project = getProject(event.target.value);
    studioSettings.channels = project?.channels.slice(0, 3) || [];
    renderStudio();
    return;
  }

  if (event.target.matches("[data-discovery-project]")) {
    activeProjectId = event.target.value;
    discoveryQuery = "";
    discoveryProbeResult = null;
    renderDiscovery();
    return;
  }

  if (event.target.matches("[data-studio-channel]")) {
    const channelId = event.target.value;
    if (event.target.checked) {
      if (!studioSettings.channels.includes(channelId)) studioSettings.channels.push(channelId);
    } else {
      studioSettings.channels = studioSettings.channels.filter((id) => id !== channelId);
    }
    updateSelectedChannelCount();
  }

  if (event.target.matches("[data-studio-select]")) {
    studioSettings[event.target.dataset.studioSelect] = event.target.value;
  }

  if (event.target.matches("[data-asset-tone]")) {
    studioSettings.tone = event.target.value;
  }
}

function handleDelegatedSubmit(event) {
  if (!event.target.matches("[data-discovery-probe-form]")) return;
  event.preventDefault();
  const input = event.target.querySelector("#discovery-query-input");
  runDiscoveryProbe(input?.value || "");
}

function handleDelegatedInput(event) {
  if (event.target.matches("#channel-search")) {
    channelQuery = event.target.value.trim().toLowerCase();
    renderChannels();
    const search = document.querySelector("#channel-search");
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  }
  if (event.target.matches("#asset-content-input")) {
    const count = document.querySelector("#asset-character-count");
    if (count) count.textContent = `${event.target.value.length} 字符`;
  }
}

function handleGlobalKeydown(event) {
  const isCommandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  if (isCommandShortcut) {
    event.preventDefault();
    if (!commandModal.hidden) closeCommand();
    else openCommand();
    return;
  }

  if (event.key === "Escape") {
    if (!commandModal.hidden) closeCommand();
    else if (anyModalOpen()) closeAllModals();
    return;
  }

  if (!commandModal.hidden) {
    const results = getCommandResults(commandInput.value);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      commandFocus = Math.min(commandFocus + 1, Math.max(results.length - 1, 0));
      renderCommandResults(commandInput.value);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      commandFocus = Math.max(commandFocus - 1, 0);
      renderCommandResults(commandInput.value);
    }
    if (event.key === "Enter" && results[commandFocus]) {
      event.preventDefault();
      executeCommand(commandFocus);
    }
  }
}

function switchView(view) {
  if (!["overview", "projects", "channels", "discovery", "studio", "queue"].includes(view)) return;
  closeAllModals();
  currentView = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  updateNavigationCounts();
  if (currentView === "overview") renderOverview();
  if (currentView === "projects") renderProjects();
  if (currentView === "channels") renderChannels();
  if (currentView === "discovery") renderDiscovery();
  if (currentView === "studio") renderStudio();
  if (currentView === "queue") renderQueue();
  refreshIcons();
}

function updateNavigationCounts() {
  const projectCount = document.querySelector("#project-nav-count");
  const queueCount = document.querySelector("#queue-nav-count");
  if (projectCount) projectCount.textContent = state.projects.length;
  if (queueCount) {
    const pending = state.queue.filter((item) => item.status !== "published").length;
    queueCount.textContent = pending;
    queueCount.hidden = pending === 0;
  }
}

function viewHeader(eyebrow, title, description, meta = "") {
  return `
    <header class="view-header">
      <div>
        <span class="eyebrow">${escapeHTML(eyebrow)}</span>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(description)}</p>
      </div>
      ${
        meta
          ? `<div class="header-meta">${icon("calendar-days")}<span>${escapeHTML(meta)}</span></div>`
          : ""
      }
    </header>
  `;
}

function renderOverview() {
  const activeProject = getProject(activeProjectId) || state.projects[0];
  const reviewCount = state.queue.filter((item) => item.status === "review").length;
  const scheduledCount = state.queue.filter((item) => item.status === "scheduled").length;
  const recommendedChannels = getRecommendedChannels(activeProject, 4);
  const projectAssets = getProjectAssets(activeProject?.id);
  const coverage = activeProject ? Math.round((activeProject.channels.length / channelCatalog.length) * 100) : 0;
  const todayString = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(now);

  appContent.innerHTML = `
    ${viewHeader(
      "DISTRIBUTION DESK",
      "发布工作台",
      "Rita 判断项目该去哪里，为中英文 AI 生态生成真正适合渠道的内容。",
      `${todayString} · 数据为本地实时状态`,
    )}

    <section class="metrics-row" aria-label="关键指标">
      ${metricCard("boxes", "活跃项目", state.projects.length, "2 个本周新增")}
      ${metricCard("radio-tower", "已接渠道", channelCatalog.length, "8 个支持 API")}
      ${metricCard("file-text", "内容资产", getAllAssets().length, "含待入队渠道版本")}
      ${metricCard("circle-check", "待审核", reviewCount, scheduledCount ? `${scheduledCount} 项已排期` : "队列清空")}
    </section>

    ${
      activeProject
        ? `
      <section class="overview-grid">
        <article class="panel focus-card">
          <div class="panel-header">
            <div class="panel-title">${icon("rocket")}<h2>当前发布焦点</h2></div>
            <button class="text-button" type="button" data-open-project="${activeProject.id}">
              项目详情 ${icon("arrow-up-right")}
            </button>
          </div>
          <div class="focus-content">
            <div class="focus-copy">
              <div class="project-kicker">
                <span class="live-pill">${escapeHTML(activeProject.stage)}</span>
                <span>${escapeHTML(activeProject.type)}</span>
              </div>
              <div class="focus-title-line">
                <span class="project-monogram" style="--project-color:${activeProject.color}">${escapeHTML(initials(activeProject.name))}</span>
                <h2>${escapeHTML(activeProject.name)}</h2>
              </div>
              <p class="focus-tagline">${escapeHTML(activeProject.tagline)}</p>
              <div class="focus-meta">
                <span class="meta-tag">${icon("users")} ${escapeHTML(activeProject.audience)}</span>
                <span class="meta-tag">${icon("radio-tower")} ${activeProject.channels.length} 个目标渠道</span>
                <span class="meta-tag">${icon("files")} ${projectAssets.length} 份内容</span>
              </div>
              <div class="focus-actions">
                <button class="button button--primary" type="button" data-view="studio">
                  ${icon("wand-sparkles")} 生成渠道内容
                </button>
                <button class="button button--secondary" type="button" data-open-project="${activeProject.id}">
                  ${icon("chart-no-axes-combined")} 查看分发画像
                </button>
              </div>
            </div>
            <div class="launch-score-wrap">
              ${renderDistributionGraph(activeProject)}
              <div class="score-row">
                <div class="score-ring" style="--score:${activeProject.score}"><strong>${activeProject.score}</strong></div>
                <div class="score-copy">
                  <strong>发布就绪度</strong>
                  <span>${activeProject.channels.length} 个渠道已匹配</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside class="panel">
          <div class="panel-header">
            <div class="panel-title">${icon("crosshair")}<h2>下一步动作</h2></div>
            <span class="mode-badge mode-api">${reviewCount} 待处理</span>
          </div>
          ${renderTodoList(activeProject)}
        </aside>
      </section>

      <section class="section-grid">
        <article class="panel">
          <div class="panel-header">
            <div class="panel-title">${icon("radio-tower")}<h2>高匹配渠道</h2></div>
            <button class="text-button" type="button" data-view="channels">
              查看渠道库 ${icon("arrow-right")}
            </button>
          </div>
          <div class="channel-list">
            ${recommendedChannels.map((channel) => renderChannelRow(channel)).join("")}
          </div>
        </article>
        <article class="panel">
          <div class="panel-header">
            <div class="panel-title">${icon("list-checks")}<h2>发布队列</h2></div>
            <button class="text-button" type="button" data-view="queue">
              全部队列 ${icon("arrow-right")}
            </button>
          </div>
          ${renderCompactQueue()}
        </article>
      </section>

      <section class="signal-strip">
        <span class="signal-icon">${icon("radar")}</span>
        <div class="signal-copy">
          <strong>Rita 发现 3 个可提升动作</strong>
          <span>${escapeHTML(activeProject.name)} 的 GitHub 与 Hugging Face 版本可以共用同一组演示素材；Product Hunt 建议延后 48 小时。</span>
        </div>
        <button class="signal-link" type="button" data-view="channels">
          查看建议 ${icon("arrow-up-right")}
        </button>
      </section>
    `
        : renderEmptyProjects()
    }
  `;
}

function metricCard(iconName, label, value, change) {
  return `
    <div class="metric">
      <div class="metric-label">${icon(iconName)}<span>${escapeHTML(label)}</span></div>
      <div class="metric-value-row">
        <strong class="metric-value">${value}</strong>
        <span class="metric-change">${icon("trending-up")} ${escapeHTML(change)}</span>
      </div>
    </div>
  `;
}

function renderDistributionGraph(project) {
  const selected = getRecommendedChannels(project, 5);
  const nodes = [
    { x: 40, y: 38, label: shortChannelName(selected[0]?.name || "GitHub") },
    { x: 210, y: 35, label: shortChannelName(selected[1]?.name || "HF") },
    { x: 225, y: 130, label: shortChannelName(selected[2]?.name || "HN") },
    { x: 38, y: 137, label: shortChannelName(selected[3]?.name || "V2EX") },
    { x: 120, y: 12, label: shortChannelName(selected[4]?.name || "PH") },
  ];
  const colors = ["#205fd7", "#167457", "#dc6046", "#a96c0d", "#6751ac"];
  return `
    <div class="distribution-graph" role="img" aria-label="${escapeAttribute(project.name)} 的渠道覆盖图">
      <svg viewBox="0 0 260 170">
        <defs>
          <pattern id="dot-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#dce4de"></circle>
          </pattern>
        </defs>
        <rect width="260" height="170" fill="url(#dot-grid)"></rect>
        ${nodes
          .map(
            (node) =>
              `<line class="graph-line is-ready" x1="130" y1="86" x2="${node.x}" y2="${node.y}"></line>`,
          )
          .join("")}
        <circle cx="130" cy="86" r="24" fill="${project.color || "#205fd7"}" stroke="#ffffff" stroke-width="4"></circle>
        <circle cx="130" cy="86" r="34" fill="none" stroke="${project.color || "#205fd7"}" stroke-opacity="0.14"></circle>
        <text x="130" y="86" text-anchor="middle" dominant-baseline="middle" class="graph-center-label">${escapeHTML(initials(project.name))}</text>
        ${nodes
          .map(
            (node, index) => `
              <circle class="graph-node" cx="${node.x}" cy="${node.y}" r="9" fill="${colors[index]}"></circle>
              <text x="${node.x}" y="${node.y + (node.y < 20 ? -7 : 18)}" text-anchor="middle">${escapeHTML(node.label)}</text>
            `,
          )
          .join("")}
      </svg>
    </div>
  `;
}

function renderTodoList(project) {
  const relevantQueue = state.queue.filter((item) => item.projectId === project.id);
  const pending = relevantQueue.find((item) => item.status === "review");
  const ready = relevantQueue.find((item) => item.status === "ready");
  const scheduled = relevantQueue.find((item) => item.status === "scheduled");
  const todos = [
    pending && {
      iconName: "eye",
      variant: "amber",
      title: `审核 ${getChannel(pending.channelId)?.name} 版本`,
      detail: "检查价值主张、链接和发布规范",
      time: "今天",
      action: "review",
      id: pending.id,
    },
    ready && {
      iconName: "calendar-clock",
      variant: "",
      title: `为 ${getChannel(ready.channelId)?.name} 安排时间`,
      detail: "内容就绪，等待选择发布窗口",
      time: "本周",
      action: "schedule",
      id: ready.id,
    },
    scheduled && {
      iconName: "circle-check",
      variant: "green",
      title: `${getChannel(scheduled.channelId)?.name} 已进入排期`,
      detail: formatDateTime(scheduled.scheduledAt),
      time: "已排期",
      action: "queue",
      id: scheduled.id,
    },
    {
      iconName: "plus",
      variant: "",
      title: "补充一个渠道版本",
      detail: "为下一个高匹配渠道生成独立文案",
      time: "建议",
      action: "studio",
      id: "",
    },
  ].filter(Boolean);

  return `
    <div class="todo-list">
      ${todos
        .slice(0, 4)
        .map(
          (todo) => `
            <div class="todo-item">
              <span class="todo-icon ${todo.variant ? `todo-icon--${todo.variant}` : ""}">${icon(todo.iconName)}</span>
              <div class="todo-copy">
                <strong>${escapeHTML(todo.title)}</strong>
                <span>${escapeHTML(todo.detail)}</span>
              </div>
              ${
                todo.action === "studio"
                  ? `<button class="text-button" type="button" data-view="studio">生成 ${icon("arrow-right")}</button>`
                  : `<button class="text-button" type="button" data-view="queue">去处理 ${icon("arrow-right")}</button>`
              }
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderChannelRow(channel) {
  const alreadyQueued = state.queue.some(
    (item) => item.channelId === channel.id && item.projectId === activeProjectId && item.status !== "published",
  );
  return `
    <div class="channel-row">
      <span class="channel-mark" style="--channel-color:${channel.color};--channel-bg:${channel.bg}">${escapeHTML(channelShort(channel))}</span>
      <div class="channel-name">
        <strong>${escapeHTML(channel.name)}</strong>
        <span>${escapeHTML(channel.group)}</span>
      </div>
      <span class="channel-reach">${escapeHTML(channel.reach)}</span>
      <div class="fit-meter" aria-label="匹配度 ${channel.fit}">
        <span>${channel.fit}</span>
        <div class="fit-meter-track"><i style="width:${channel.fit}%"></i></div>
      </div>
      <button class="button button--small ${alreadyQueued ? "button--quiet" : "button--secondary"}" type="button" data-add-channel="${channel.id}" ${alreadyQueued ? "disabled" : ""}>
        ${alreadyQueued ? icon("check") + " 已加入" : icon("plus") + " 加入"}
      </button>
    </div>
  `;
}

function renderCompactQueue() {
  const items = state.queue.filter((item) => item.status !== "published").slice(0, 4);
  if (!items.length) {
    return `<div class="queue-empty">发布队列已经清空。</div>`;
  }
  return `
    <div class="todo-list">
      ${items
        .map((item) => {
          const asset = getAsset(item.assetId);
          const channel = getChannel(item.channelId);
          const project = getProject(item.projectId);
          return `
            <div class="todo-item">
              <span class="channel-mark" style="--channel-color:${channel?.color};--channel-bg:${channel?.bg}">${escapeHTML(channel ? channelShort(channel) : "?")}</span>
              <div class="todo-copy">
                <strong>${escapeHTML(asset?.title || "未命名内容")}</strong>
                <span>${escapeHTML(project?.name || "未知项目")} · ${escapeHTML(channel?.name || "渠道")}</span>
              </div>
              ${statusBadge(item.status)}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderProjects() {
  const filters = ["全部", "发布中", "待发布"];
  const projects = state.projects.filter((project) => {
    if (projectFilter === "全部") return true;
    return getProjectWorkflowState(project.id) === projectFilter;
  });

  appContent.innerHTML = `
    ${viewHeader(
      "PROJECT PORTFOLIO",
      "项目",
      "每个项目都有独立的定位、目标受众和渠道组合。",
      `${state.projects.length} 个项目正在管理`,
    )}
    <div class="toolbar">
      <div class="filter-group" aria-label="项目状态筛选">
        ${filters
          .map(
            (filter) =>
              `<button class="filter-button ${projectFilter === filter ? "is-active" : ""}" type="button" data-project-filter="${filter}" aria-pressed="${projectFilter === filter}">${filter}</button>`,
          )
          .join("")}
      </div>
      <button class="button button--primary" type="button" data-open-intake>${icon("plus")} 接入新项目</button>
    </div>
    <section class="projects-grid">
      ${
        projects.length
          ? projects.map(renderProjectCard).join("")
          : `
            <div class="empty-state projects-empty">
              <span class="empty-state-icon">${icon("list-filter")}</span>
              <h2>当前筛选下没有项目</h2>
              <p>切换到全部项目，或继续接入新的软件、模型与开源项目。</p>
              <button class="button button--secondary" type="button" data-project-filter="全部">${icon("rotate-ccw")} 清除筛选</button>
            </div>
          `
      }
      ${
        projectFilter === "全部"
          ? `
            <button class="empty-state" type="button" data-open-intake style="cursor:pointer;min-height:300px">
              <span class="empty-state-icon">${icon("circle-plus")}</span>
              <h2>接入下一个项目</h2>
              <p>从链接和一句话价值开始，Rita 会完成项目定位与渠道判断。</p>
              <span class="button button--secondary">${icon("link-2")} 添加项目链接</span>
            </button>
          `
          : ""
      }
    </section>
  `;
  requestAnimationFrame(drawProjectCanvases);
}

function getProjectWorkflowState(projectId) {
  const queueItems = state.queue.filter((item) => item.projectId === projectId);
  return queueItems.some((item) => ["scheduled", "published"].includes(item.status))
    ? "发布中"
    : "待发布";
}

function renderProjectCard(project) {
  const assets = getProjectAssets(project.id);
  const channels = project.channels.map(getChannel).filter(Boolean);
  return `
    <article class="project-card">
      <div class="project-visual" style="--project-color:${project.color}">
        <canvas data-project-canvas="${project.id}" aria-label="${escapeAttribute(project.name)} 项目封面"></canvas>
        <span class="project-stage">${escapeHTML(project.stage)}</span>
      </div>
      <div class="project-card-body">
        <div class="project-card-head">
          <div>
            <h3>${escapeHTML(project.name)}</h3>
            <p>${escapeHTML(project.tagline)}</p>
          </div>
          <div class="project-launch-score">
            <strong>${project.score}</strong>
            <span>就绪度</span>
          </div>
        </div>
        <div class="project-card-footer">
          <div class="channel-stack" aria-label="${channels.length} 个渠道">
            ${channels
              .slice(0, 4)
              .map(
                (channel) =>
                  `<span class="mini-channel" title="${escapeAttribute(channel.name)}" style="--channel-color:${channel.color};--channel-bg:${channel.bg}">${escapeHTML(channelShort(channel))}</span>`,
              )
              .join("")}
            ${channels.length > 4 ? `<span class="channel-overflow">+${channels.length - 4}</span>` : ""}
          </div>
          <button class="text-button" type="button" data-open-project="${project.id}">
            ${assets.length} 份内容 · 查看 ${icon("arrow-right")}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderChannels() {
  const categories = ["全部", "模型与 Agent", "开发者社区", "新品目录", "中文内容"];
  const filtered = channelCatalog.filter((channel) => {
    const categoryMatch = channelFilter === "全部" || channel.group === channelFilter;
    const queryMatch =
      !channelQuery ||
      `${channel.name} ${channel.group} ${channel.description} ${channel.audiences.join(" ")}`
        .toLowerCase()
        .includes(channelQuery);
    return categoryMatch && queryMatch;
  });

  appContent.innerHTML = `
    ${viewHeader(
      "CHANNEL DIRECTORY",
      "渠道库",
      "不是把同一段文案群发，而是找到受众、格式和发布规则真正匹配的入口。",
      `${channelCatalog.length} 个渠道 · 8 个 API 可用`,
    )}
    <div class="toolbar">
      <div class="filter-group" aria-label="渠道分类">
        ${categories
          .map(
            (category) =>
              `<button class="filter-button ${channelFilter === category ? "is-active" : ""}" type="button" data-channel-filter="${escapeAttribute(category)}">${escapeHTML(category)}</button>`,
          )
          .join("")}
      </div>
      <label class="inline-search">
        ${icon("search")}
        <input id="channel-search" type="search" placeholder="搜索渠道或受众" value="${escapeAttribute(channelQuery)}" />
      </label>
    </div>
    ${
      filtered.length
        ? `<section class="channel-grid">${filtered.map(renderChannelCard).join("")}</section>`
        : renderChannelEmptyState()
    }
  `;
}

function renderChannelCard(channel) {
  const isQueued = state.queue.some(
    (item) => item.channelId === channel.id && item.projectId === activeProjectId && item.status !== "published",
  );
  return `
    <article class="channel-card">
      <div class="channel-card-head">
        <div class="channel-card-title">
          <span class="channel-mark channel-mark--large" style="--channel-color:${channel.color};--channel-bg:${channel.bg}">${escapeHTML(channelShort(channel))}</span>
          <div>
            <h3>${escapeHTML(channel.name)}</h3>
            <span>${escapeHTML(channel.group)}</span>
          </div>
        </div>
        ${modeBadge(channel.mode)}
      </div>
      <p class="channel-card-description">${escapeHTML(channel.description)}</p>
      <div class="audience-pills">
        ${channel.audiences.map((audience) => `<span class="audience-pill">${escapeHTML(audience)}</span>`).join("")}
      </div>
      <div class="channel-card-meta">
        <span class="channel-card-score">当前项目匹配 <strong>${getProjectChannelFit(activeProjectId, channel)}</strong></span>
        <button class="button button--small ${isQueued ? "button--quiet" : "button--secondary"}" type="button" data-add-channel="${channel.id}" ${isQueued ? "disabled" : ""}>
          ${isQueued ? icon("check") + " 已加入" : icon("plus") + " 生成版本"}
        </button>
      </div>
    </article>
  `;
}

function renderChannelEmptyState() {
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${icon("search-x")}</span>
      <h2>没有找到匹配渠道</h2>
      <p>换一个分类或关键词。渠道库会持续监测新的模型平台、目录和开发者社区。</p>
      <button class="button button--secondary" type="button" data-channel-filter="全部">清除筛选</button>
    </div>
  `;
}

function renderDiscovery() {
  const project = getProject(activeProjectId) || state.projects[0];
  if (!project) {
    appContent.innerHTML = `
      ${viewHeader("AI DISCOVERY", "AI 搜索发现", "接入项目后，建立面向 AI 搜索与回答系统的可发现性档案。")}
      ${renderEmptyProjects()}
    `;
    return;
  }

  activeProjectId = project.id;
  const profile = getDiscoveryProfile(project);
  const queries = getDiscoveryQueries(project);
  const actions = getDiscoveryActions(project, profile);
  const packageContent = project.discoveryPackage?.content || "";
  const packageGeneratedAt = project.discoveryPackage?.generatedAt;

  appContent.innerHTML = `
    ${viewHeader(
      "AI DISCOVERY",
      "AI 搜索发现",
      "让 AI 在用户寻找相关软件、开源项目或模型时，能够找到、正确理解并引用你的项目。",
      "可发现性模拟，不代表具体 AI 产品实际排序",
    )}

    <div class="discovery-toolbar">
      <label class="field discovery-project-field">
        <span>当前优化项目</span>
        <select data-discovery-project>
          ${state.projects
            .map(
              (item) =>
                `<option value="${escapeAttribute(item.id)}" ${item.id === project.id ? "selected" : ""}>${escapeHTML(item.name)} · ${escapeHTML(item.type)}</option>`,
            )
            .join("")}
        </select>
      </label>
      <div class="discovery-toolbar-actions">
        <button class="button button--secondary" type="button" data-view="studio">
          ${icon("file-question")} 补充问题内容
        </button>
        <button class="button button--primary" type="button" data-generate-discovery>
          ${icon(profile.hasPackage ? "refresh-cw" : "braces")} ${profile.hasPackage ? "重新生成索引包" : "生成 AI 索引包"}
        </button>
      </div>
    </div>

    <section class="discovery-overview-grid">
      <article class="panel discovery-score-panel">
        <div class="panel-header">
          <div class="panel-title">${icon("gauge")}<h2>AI 可发现性</h2></div>
          <span class="mode-badge ${profile.score >= 82 ? "mode-api" : "mode-assisted"}">${profile.score >= 82 ? "基础良好" : "需要补充事实"}</span>
        </div>
        <div class="discovery-score-content">
          <div class="discovery-score-ring" style="--discovery-score:${profile.score}">
            <strong>${profile.score}</strong>
            <span>/ 100</span>
          </div>
          <div class="discovery-score-copy">
            <h3>${escapeHTML(project.name)} 的机器可读基础</h3>
            <p>AI 系统会综合项目主页、代码仓库、模型卡、第三方引用和明确的问题答案来判断相关性。</p>
          </div>
        </div>
        <div class="discovery-check-list">
          ${profile.checks.map(renderDiscoveryCheck).join("")}
        </div>
      </article>

      <article class="panel discovery-probe-panel">
        <div class="panel-header">
          <div class="panel-title">${icon("scan-search")}<h2>搜索问题模拟</h2></div>
          <span class="discovery-panel-caption">规则模拟</span>
        </div>
        <div class="discovery-probe-body">
          <p class="discovery-probe-intro">输入一个 AI 使用者可能提出的选型问题，查看项目事实是否足以进入候选答案。</p>
          <form class="discovery-probe-form" data-discovery-probe-form>
            <label class="discovery-probe-input" for="discovery-query-input">
              ${icon("search")}
              <input
                id="discovery-query-input"
                type="search"
                value="${escapeAttribute(discoveryQuery)}"
                placeholder="例如：适合远程团队的开源知识库有哪些？"
                autocomplete="off"
              />
            </label>
            <button class="button button--primary" type="submit">${icon("sparkles")} 评估</button>
          </form>
          <div class="discovery-query-chips" aria-label="示例搜索问题">
            ${queries
              .slice(0, 3)
              .map(
                (query) =>
                  `<button type="button" data-discovery-query="${escapeAttribute(query.text)}">${escapeHTML(query.text)}</button>`,
              )
              .join("")}
          </div>
          ${
            discoveryProbeResult
              ? renderDiscoveryProbeResult(discoveryProbeResult)
              : `
                <div class="discovery-probe-empty">
                  <span>${icon("message-square-text")}</span>
                  <div>
                    <strong>先从一个真实问题开始</strong>
                    <p>系统会检查项目名称、类型、受众和使用场景是否与问题形成明确对应。</p>
                  </div>
                </div>
              `
          }
          <p class="discovery-disclaimer">${icon("info")} 模拟结果用于优化公开内容和事实结构，不代表任何 AI 产品的真实排名。</p>
        </div>
      </article>
    </section>

    <section class="discovery-content-grid">
      <article class="panel">
        <div class="panel-header">
          <div class="panel-title">${icon("messages-square")}<h2>值得覆盖的搜索问题</h2></div>
          <span class="discovery-panel-caption">点击即可模拟</span>
        </div>
        <div class="discovery-opportunity-list">
          ${queries.map((query, index) => renderDiscoveryQuery(query, index)).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div class="panel-title">${icon("list-checks")}<h2>提升被引用概率</h2></div>
          <span class="discovery-panel-caption">${actions.length} 个动作</span>
        </div>
        <div class="discovery-action-list">
          ${actions.map(renderDiscoveryAction).join("")}
        </div>
      </article>
    </section>

    <section class="panel discovery-package-panel">
      <div class="panel-header">
        <div class="panel-title">${icon("file-code-2")}<h2>AI 可读项目索引包</h2></div>
        <div class="discovery-package-actions">
          ${
            packageContent
              ? `<span class="discovery-generated-at">生成于 ${escapeHTML(formatDateTime(packageGeneratedAt))}</span>
                 <button class="button button--secondary button--small" type="button" data-copy-discovery>${icon("copy")} 复制索引包</button>`
              : `<button class="button button--secondary button--small" type="button" data-generate-discovery>${icon("braces")} 开始生成</button>`
          }
        </div>
      </div>
      ${
        packageContent
          ? `<pre class="discovery-package-code"><code>${escapeHTML(packageContent)}</code></pre>`
          : `
            <div class="discovery-package-empty">
              <span>${icon("file-json-2")}</span>
              <div>
                <h3>建立一份可被机器稳定读取的项目事实卡</h3>
                <p>索引包会整合 canonical 链接、项目定位、目标用户、发布阶段、适用问题和 JSON-LD 结构化数据。</p>
              </div>
              <button class="button button--primary" type="button" data-generate-discovery>${icon("bring-to-front")} 生成索引包</button>
            </div>
          `
      }
    </section>
  `;
}

function renderDiscoveryCheck(check) {
  return `
    <div class="discovery-check ${check.done ? "is-done" : "is-missing"}">
      <span>${icon(check.done ? "circle-check" : "circle-dashed")}</span>
      <div>
        <strong>${escapeHTML(check.label)}</strong>
        <small>${escapeHTML(check.detail)}</small>
      </div>
    </div>
  `;
}

function renderDiscoveryProbeResult(result) {
  return `
    <div class="discovery-result discovery-result--${result.tone}">
      <div class="discovery-result-score">
        <strong>${result.score}</strong>
        <span>/100</span>
      </div>
      <div class="discovery-result-copy">
        <span class="discovery-result-kicker">问题与项目事实的匹配度</span>
        <h3>${escapeHTML(result.label)}</h3>
        <p>${escapeHTML(result.reason)}</p>
        ${
          result.matched.length
            ? `<div class="discovery-matched-terms">${result.matched
                .map((term) => `<span>${escapeHTML(term)}</span>`)
                .join("")}</div>`
            : ""
        }
        <div class="discovery-result-next">${icon("arrow-up-right")} ${escapeHTML(result.nextStep)}</div>
      </div>
    </div>
  `;
}

function renderDiscoveryQuery(query, index) {
  const variant = query.fit >= 85 ? "strong" : query.fit >= 72 ? "medium" : "gap";
  const label = query.fit >= 85 ? "强匹配" : query.fit >= 72 ? "可覆盖" : "待补事实";
  return `
    <button class="discovery-opportunity-row" type="button" data-discovery-query="${escapeAttribute(query.text)}">
      <span class="discovery-opportunity-rank">${String(index + 1).padStart(2, "0")}</span>
      <span class="discovery-opportunity-copy">
        <strong>${escapeHTML(query.text)}</strong>
        <span>${escapeHTML(query.intent)} · ${escapeHTML(query.detail)}</span>
      </span>
      <span class="discovery-opportunity-fit">
        <em class="discovery-fit-${variant}">${label}</em>
        <span class="discovery-fit-track"><i style="width:${query.fit}%"></i></span>
      </span>
    </button>
  `;
}

function renderDiscoveryAction(action) {
  const actionButton = action.generate
    ? `<button class="text-button" type="button" data-generate-discovery>${escapeHTML(action.buttonLabel)} ${icon("arrow-right")}</button>`
    : action.copy
      ? `<button class="text-button" type="button" data-copy-discovery>${escapeHTML(action.buttonLabel)} ${icon("arrow-right")}</button>`
      : `<button class="text-button" type="button" data-view="${escapeAttribute(action.view || "studio")}">${escapeHTML(action.buttonLabel)} ${icon("arrow-right")}</button>`;
  return `
    <div class="discovery-action-row">
      <span class="discovery-action-icon">${icon(action.icon)}</span>
      <div>
        <strong>${escapeHTML(action.title)}</strong>
        <p>${escapeHTML(action.detail)}</p>
      </div>
      ${actionButton}
    </div>
  `;
}

function getDiscoveryProfile(project) {
  const assets = getProjectAssets(project.id);
  const createdAt = new Date(project.createdAt || 0).getTime();
  const isFresh = Number.isFinite(createdAt) && now.getTime() - createdAt <= 90 * 24 * 60 * 60 * 1000;
  const checks = [
    {
      id: "canonical",
      label: "规范项目链接",
      detail: "为 AI 和搜索系统提供唯一可信来源",
      done: Boolean(project.url),
    },
    {
      id: "positioning",
      label: "一句话定位",
      detail: "明确项目为谁解决什么问题",
      done: project.tagline.length >= 18,
    },
    {
      id: "audience",
      label: "明确目标用户",
      detail: "让选型问题能与项目受众对应",
      done: Boolean(project.audience),
    },
    {
      id: "content",
      label: "至少两份问题内容",
      detail: "覆盖使用场景、常见问题或对比内容",
      done: assets.length >= 2,
    },
    {
      id: "sources",
      label: "多来源公开事实",
      detail: "通过代码仓库、模型卡或目录形成交叉引用",
      done: project.channels.length >= 3,
    },
    {
      id: "freshness",
      label: "近期更新信号",
      detail: "90 天内发布或更新，减少过期事实",
      done: isFresh,
    },
    {
      id: "machine",
      label: "AI 可读索引包",
      detail: "准备 llms.txt 风格事实卡与 JSON-LD",
      done: Boolean(project.discoveryPackage?.content),
    },
  ];
  const points =
    (checks[0].done ? 12 : 0) +
    (checks[1].done ? 10 : 0) +
    (checks[2].done ? 8 : 0) +
    (checks[3].done ? 8 : assets.length ? 4 : 0) +
    (checks[4].done ? 7 : project.channels.length ? 3 : 0) +
    (checks[5].done ? 5 : 0) +
    (checks[6].done ? 10 : 0);
  return {
    score: Math.min(98, 34 + points),
    checks,
    assets,
    isFresh,
    hasPackage: checks[6].done,
  };
}

function getDiscoveryQueries(project) {
  const audience = String(project.audience || "目标用户")
    .split(/[、,，/]/)
    .map((item) => item.trim())
    .find(Boolean) || "目标用户";
  const packageBonus = project.discoveryPackage?.content ? 4 : 0;
  return [
    {
      text: `${project.name} 是什么，适合哪些人？`,
      intent: "品牌实体理解",
      detail: "需要项目主页与统一简介",
      fit: 94,
    },
    {
      text: `适合${audience}的${project.type}有哪些？`,
      intent: "选型推荐",
      detail: "需要明确的受众与分类",
      fit: 87 + packageBonus,
    },
    {
      text: `${project.tagline.replace(/[。.!！]+$/, "")}，有哪些工具可以做到？`,
      intent: "问题解决",
      detail: "需要场景化 FAQ 与示例",
      fit: 79 + packageBonus,
    },
    {
      text: `${project.name} 有哪些替代方案，和同类项目有什么区别？`,
      intent: "比较决策",
      detail: "需要公开对比页与限制说明",
      fit: 63 + packageBonus,
    },
    {
      text: `2026 年值得关注的${project.type}有哪些？`,
      intent: "时效发现",
      detail: "需要版本、更新日期与外部引用",
      fit: project.score >= 88 ? 74 + packageBonus : 67 + packageBonus,
    },
  ];
}

function getDiscoveryActions(project, profile) {
  const actions = [];
  if (!profile.hasPackage) {
    actions.push({
      icon: "braces",
      title: "生成可被机器读取的项目事实卡",
      detail: "把 canonical 链接、定位、受众和适用问题整理成统一索引包。",
      buttonLabel: "生成",
      generate: true,
    });
  } else {
    actions.push({
      icon: "copy",
      title: "把索引包同步到项目主页",
      detail: "发布到 README、模型卡或官网，并持续保持 canonical 链接一致。",
      buttonLabel: "复制",
      copy: true,
    });
  }
  actions.push({
    icon: "git-compare-arrows",
    title: "增加选型对比与替代方案",
    detail: "覆盖“和同类有什么区别”“什么时候不该使用”等高意图问题。",
    buttonLabel: "补充",
    view: "studio",
  });
  actions.push({
    icon: "badge-check",
    title: "建立可引用的证据段落",
    detail:
      project.type.includes("模型")
        ? "公开评测方法、能力边界、硬件要求与可复现样例，避免模型补全未知参数。"
        : "公开真实使用场景、限制、安装方式和可复现结果，便于 AI 精确引用。",
    buttonLabel: "准备",
    view: "studio",
  });
  return actions;
}

function runDiscoveryProbe(query) {
  const project = getProject(activeProjectId) || state.projects[0];
  if (!project) return;
  const normalizedQuery = String(query || "").trim();
  const input = document.querySelector("#discovery-query-input");
  const finalQuery = normalizedQuery || input?.value.trim() || "";
  if (!finalQuery) {
    showToast("输入一个搜索问题", "例如：适合中文团队的开源智能体框架有哪些？");
    input?.focus();
    return;
  }
  discoveryQuery = finalQuery;
  discoveryProbeResult = analyzeDiscoveryQuery(project, finalQuery);
  renderDiscovery();
}

function analyzeDiscoveryQuery(project, query) {
  const normalized = query.toLowerCase();
  const profile = getDiscoveryProfile(project);
  const projectText = `${project.name} ${project.type} ${project.audience} ${project.tagline}`.toLowerCase();
  const vocabulary = [
    "AI",
    "智能体",
    "Agent",
    "模型",
    "开源",
    "开发者",
    "工程师",
    "研究者",
    "团队",
    "企业",
    "产品经理",
    "创作者",
    "工作流",
    "知识库",
    "会议",
    "中文",
    "多模态",
    "端侧",
    "工具",
    "软件",
    "框架",
    "SaaS",
    "API",
    "SDK",
  ];
  const matched = [...new Set(
    vocabulary.filter(
      (term) => projectText.includes(term.toLowerCase()) && normalized.includes(term.toLowerCase()),
    ),
  )];
  const nameMatched = normalized.includes(project.name.toLowerCase());
  if (nameMatched) matched.unshift(project.name);

  let score = profile.score - 10;
  if (nameMatched) score += 18;
  score += Math.min(22, matched.length * 5);
  if (/推荐|有哪些|哪个|适合|寻找|帮我找|选型/.test(query)) score += 4;
  const asksComparison = /对比|替代|区别|vs|更好/.test(normalized);
  const asksEvidence = /评测|benchmark|准确率|效果|性能|许可|license|价格|收费/.test(normalized);
  if (asksComparison) score -= 5;
  if (asksEvidence) score -= 4;
  score = Math.max(42, Math.min(97, score));

  const tone = score >= 82 ? "strong" : score >= 68 ? "medium" : "weak";
  const label =
    score >= 82
      ? "具备进入候选答案的事实基础"
      : score >= 68
        ? "可以被理解，但证据还不够完整"
        : "与当前公开事实的关联较弱";
  const reason = matched.length
    ? `问题命中 ${matched.slice(0, 4).join("、")} 等项目事实，AI 更容易把搜索意图与 ${project.name} 对应起来。`
    : `问题尚未命中 ${project.name} 的分类、受众或使用场景词，需要更明确的公开内容建立关联。`;
  const nextStep = asksComparison
    ? "补充与同类项目的对比页，并明确适用和不适用场景。"
    : asksEvidence
      ? "补充可复现的评测、性能或成本证据，并放在稳定链接中。"
      : profile.hasPackage
        ? "保持索引包、项目主页与发布日期一致，并争取第三方引用。"
        : "先生成 AI 可读索引包，再同步到项目主页和模型卡。";

  return { score, tone, label, reason, nextStep, matched };
}

function generateDiscoveryPackage() {
  const project = getProject(activeProjectId) || state.projects[0];
  if (!project) return;
  const snapshot = getBillingSnapshot();
  if (snapshot.remaining.indexPackages < 1) {
    openBilling("discovery");
    return;
  }
  project.discoveryPackage = {
    generatedAt: new Date().toISOString(),
    content: buildDiscoveryPackage(project),
  };
  state.billing.usage.indexPackages += 1;
  persist();
  updateProfileSummary();
  renderDiscovery();
  const remaining = getRemainingUsage(snapshot.plan.limits.indexPackages, state.billing.usage.indexPackages);
  showToast(
    "AI 索引包已生成",
    Number.isFinite(remaining)
      ? `包含项目事实卡、搜索问题与 JSON-LD；本月剩余 ${formatUsageLimit(remaining)} 份`
      : "包含项目事实卡、搜索问题与 JSON-LD 结构化数据",
  );
}

function copyDiscoveryPackage() {
  const project = getProject(activeProjectId) || state.projects[0];
  if (!project) return;
  if (!project.discoveryPackage?.content) {
    showToast("还没有 AI 索引包", "请先生成索引包，再复制到项目主页或模型卡");
    return;
  }
  copyToClipboard(project.discoveryPackage.content, "AI 索引包已复制");
}

function buildDiscoveryPackage(project) {
  const generatedAt = new Date();
  const generatedDate = generatedAt.toISOString().slice(0, 10);
  const schemaType = project.type.includes("开源") ? "SoftwareSourceCode" : "SoftwareApplication";
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: project.name,
    description: `${project.tagline} 面向${project.audience}。`,
    url: project.url,
    applicationCategory: project.type,
    audience: {
      "@type": "Audience",
      audienceType: project.audience,
    },
    dateModified: generatedDate,
    keywords: [project.type, ...project.audience.split(/[、,，/]/).map((item) => item.trim()).filter(Boolean)],
  };
  const queryLines = getDiscoveryQueries(project)
    .slice(0, 4)
    .map((query) => `- ${query.text}`)
    .join("\n");

  return `# ${project.name} - AI Discovery Card

> Canonical entity for AI assistants and search systems. Prefer the canonical URL when citing this project.

## Canonical facts

- Name: ${project.name}
- Category: ${project.type}
- Canonical URL: ${project.url}
- One-line description: ${project.tagline}
- Intended audience: ${project.audience}
- Release stage: ${project.stage}
- Last verified: ${generatedDate}
- Public channels: ${project.channels.map(getChannel).filter(Boolean).map((channel) => channel.name).join(", ")}

## Questions this project should be considered for

${queryLines}

## Citation guidance

- Prefer the canonical URL above when linking to the project.
- Use only the capabilities, limitations, pricing, licensing, and benchmark claims documented at the source.
- If a required fact is not present, state that it is not documented instead of inferring it.
- Keep the project name, category, audience, and one-line description consistent across public sources.

## Structured data (JSON-LD)

${JSON.stringify(schema, null, 2)}`;
}

function renderStudio() {
  const project = getProject(studioSettings.projectId) || state.projects[0];
  if (!project) {
    appContent.innerHTML = `
      ${viewHeader("CONTENT STUDIO", "内容工坊", "先接入一个项目，再生成渠道版本。")}
      ${renderEmptyProjects()}
    `;
    return;
  }

  studioSettings.projectId = project.id;
  const generatedForProject = state.generatedAssets.filter((asset) => asset.projectId === project.id);
  const projectAssets = getProjectAssets(project.id);
  const displayAssets = generatedForProject.length
    ? projectAssets
    : projectAssets.slice(0, 4);
  const availableChannels = getRecommendedChannels(project, 8);
  const snapshot = getBillingSnapshot();
  const contentRemaining = snapshot.remaining.contentVersions;

  appContent.innerHTML = `
    ${viewHeader(
      "CONTENT STUDIO",
      "内容工坊",
      "从同一个事实源出发，为每个渠道重新组织叙事、格式与行动号召。",
      `${getProjectChannelFit(project.id, getChannel("github"))}% 技术渠道匹配`,
    )}
    <section class="studio-layout">
      <aside class="panel studio-controls">
        <div class="control-section">
          <label class="control-label">发布项目 <span>${escapeHTML(project.type)}</span></label>
          <select class="control-select" data-studio-project>
            ${state.projects
              .map(
                (item) =>
                  `<option value="${escapeAttribute(item.id)}" ${item.id === project.id ? "selected" : ""}>${escapeHTML(item.name)}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="control-section">
          <div class="control-label">目标渠道 <span id="selected-channel-count">${studioSettings.channels.length} 个已选</span></div>
          <div class="channel-checks">
            ${availableChannels
              .map((channel) => {
                const selected = studioSettings.channels.includes(channel.id);
                return `
                  <label class="channel-check">
                    <input type="checkbox" value="${channel.id}" data-studio-channel ${selected ? "checked" : ""} />
                    <span class="channel-mark" style="--channel-color:${channel.color};--channel-bg:${channel.bg}">${escapeHTML(channelShort(channel))}</span>
                    <span class="channel-check-copy">
                      <strong>${escapeHTML(channel.name)}</strong>
                      <span>${escapeHTML(channel.channelFormat)}</span>
                    </span>
                  </label>
                `;
              })
              .join("")}
          </div>
        </div>
        <div class="control-section">
          <div class="control-label">表达方式</div>
          <div class="segmented" style="display:flex;width:100%">
            ${["技术可信", "简洁直接", "故事感"]
              .map(
                (tone) =>
                  `<button class="segment-button ${studioSettings.tone === tone ? "is-active" : ""}" type="button" data-setting="tone" data-value="${tone}">${tone}</button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="control-section">
          <label class="control-label">发布目标</label>
          <select class="control-select" data-studio-select="goal">
            ${["首发", "获取种子用户", "寻找开源贡献者", "产品更新"]
              .map(
                (goal) =>
                  `<option ${studioSettings.goal === goal ? "selected" : ""}>${goal}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="studio-quota">
          <span>${icon("gauge")} 本月剩余 ${escapeHTML(formatUsageLimit(contentRemaining))} 份</span>
          <button class="text-button" type="button" data-open-billing="content">查看额度 ${icon("arrow-up-right")}</button>
        </div>
        <button class="button button--primary generate-button" type="button" data-generate>
          ${icon("sparkles")} 生成 ${studioSettings.channels.length} 个渠道版本
        </button>
        <p class="studio-quota-note">本次将使用 ${studioSettings.channels.length} 份额度，生成失败不扣除。</p>
      </aside>
      <section class="studio-main">
        ${
          displayAssets.length
            ? `
              <div class="asset-heading">
                <div>
                  <h2>${generatedForProject.length ? "新生成的内容包" : "已有内容资产"}</h2>
                  <p>${generatedForProject.length ? "每个版本都已按渠道格式重新组织，可继续手动编辑。" : `${displayAssets.length} 个版本，其中 ${displayAssets.filter((a) => a.status === "review").length} 个等待审核。`}</p>
                </div>
                <button class="button button--secondary button--small" type="button" data-view="queue">
                  ${icon("send")} 打开队列
                </button>
              </div>
              <div class="asset-grid">
                ${displayAssets.map(renderAssetCard).join("")}
              </div>
            `
            : `
              <div class="studio-empty">
                <div class="studio-empty-illustration" aria-hidden="true">
                  <span class="prompt-line"></span>
                  <span class="prompt-spark">${icon("sparkles")}</span>
                </div>
                <h2>准备一套渠道内容</h2>
                <p>选择左侧渠道，生成能直接审核和编辑的版本。</p>
                <button class="button button--primary" type="button" data-generate style="margin-top:16px">
                  ${icon("wand-sparkles")} 生成第一版
                </button>
              </div>
            `
        }
      </section>
    </section>
  `;
}

function updateSelectedChannelCount() {
  const count = document.querySelector("#selected-channel-count");
  if (count) count.textContent = `${studioSettings.channels.length} 个已选`;
}

function renderAssetCard(asset) {
  const channel = getChannel(asset.channelId);
  const isQueued = state.queue.some((item) => item.assetId === asset.id);
  return `
    <article class="asset-card">
      <div class="asset-card-head">
        <div class="asset-channel">
          <span class="channel-mark" style="--channel-color:${channel?.color};--channel-bg:${channel?.bg}">${escapeHTML(channel ? channelShort(channel) : "?")}</span>
          <div>
            <strong>${escapeHTML(channel?.name || "未知渠道")}</strong>
            <span>${escapeHTML(channel?.channelFormat || "渠道内容")}</span>
          </div>
        </div>
        <span class="asset-format">${escapeHTML(studioSettings.language === "English" ? "EN" : "ADAPTED")}</span>
      </div>
      <h3 class="asset-title">${escapeHTML(asset.title)}</h3>
      <p class="asset-body">${escapeHTML(asset.body)}</p>
      <div class="asset-tags">
        ${(asset.tags || []).slice(0, 4).map((tag) => `<span class="asset-tag">#${escapeHTML(tag)}</span>`).join("")}
      </div>
      <div class="asset-card-footer">
        <span class="asset-count">${asset.body.length} 字符 · ${statusLabel(asset.status)}</span>
        <div class="asset-actions">
          <button class="button button--quiet button--small" type="button" data-open-asset="${asset.id}" title="编辑文案">${icon("pencil")}</button>
          <button class="button button--secondary button--small" type="button" data-queue-asset="${asset.id}" ${isQueued ? "disabled" : ""}>
            ${isQueued ? icon("check") + " 已加入" : icon("plus") + " 入队"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderQueue() {
  const allItems = state.queue;
  const stats = {
    review: allItems.filter((item) => item.status === "review").length,
    ready: allItems.filter((item) => item.status === "ready").length,
    scheduled: allItems.filter((item) => item.status === "scheduled").length,
    published: allItems.filter((item) => item.status === "published").length,
  };
  const filters = ["全部", "待审核", "可发布", "已排期", "已发布"];
  const filteredItems = allItems.filter((item) => {
    if (queueFilter === "全部") return true;
    return statusLabel(item.status) === queueFilter;
  });

  appContent.innerHTML = `
    ${viewHeader(
      "PUBLISH QUEUE",
      "发布队列",
      "Rita 准备内容，你保留最后的发布决定。每个外部动作都有清晰的当前状态。",
      "时间均按 Asia/Shanghai 显示",
    )}
    <section class="queue-summary">
      ${queueSummaryItem("eye", "待审核", stats.review, "amber")}
      ${queueSummaryItem("circle-check-big", "可发布", stats.ready, "")}
      ${queueSummaryItem("calendar-clock", "已排期", stats.scheduled, "violet")}
      ${queueSummaryItem("badge-check", "已发布", stats.published, "green")}
    </section>
    <div class="toolbar">
      <div class="filter-group">
        ${filters
          .map(
            (filter) =>
              `<button class="filter-button ${queueFilter === filter ? "is-active" : ""}" type="button" data-queue-filter="${filter}">${filter}</button>`,
          )
          .join("")}
      </div>
      <button class="button button--secondary" type="button" data-view="studio">${icon("plus")} 生成新内容</button>
    </div>
    <section class="panel data-panel">
      ${
        filteredItems.length
          ? `
            <table class="data-table">
              <thead>
                <tr>
                  <th>内容</th>
                  <th>项目</th>
                  <th>渠道</th>
                  <th>状态</th>
                  <th>计划时间</th>
                  <th style="text-align:right">操作</th>
                </tr>
              </thead>
              <tbody>
                ${filteredItems.map(renderQueueRow).join("")}
              </tbody>
            </table>
          `
          : `<div class="queue-empty">当前筛选下没有内容。</div>`
      }
    </section>
  `;
}

function queueSummaryItem(iconName, label, value, variant) {
  return `
    <div class="queue-summary-item">
      <span class="queue-summary-icon ${variant ? `queue-summary-icon--${variant}` : ""}">${icon(iconName)}</span>
      <div class="queue-summary-copy">
        <strong>${value}</strong>
        <span>${escapeHTML(label)}</span>
      </div>
    </div>
  `;
}

function renderQueueRow(item) {
  const asset = getAsset(item.assetId);
  const project = getProject(item.projectId);
  const channel = getChannel(item.channelId);
  return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:9px;min-width:230px">
          <button class="icon-button" type="button" data-open-asset="${asset?.id}" style="width:30px;height:30px" aria-label="预览内容">
            ${icon("file-text")}
          </button>
          <div style="min-width:0">
            <strong style="display:block;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px">${escapeHTML(asset?.title || "未命名内容")}</strong>
            <span class="table-muted" style="display:block;margin-top:2px;font-size:8px">${asset?.body.length || 0} 字符</span>
          </div>
        </div>
      </td>
      <td>
        <div class="queue-project">
          <span class="project-monogram" style="--project-color:${project?.color || "#205fd7"}">${escapeHTML(project ? initials(project.name) : "?")}</span>
          <span>${escapeHTML(project?.name || "未知项目")}</span>
        </div>
      </td>
      <td>
        <div class="table-channel" style="min-width:110px">
          <span class="channel-mark" style="--channel-color:${channel?.color};--channel-bg:${channel?.bg}">${escapeHTML(channel ? channelShort(channel) : "?")}</span>
          <strong>${escapeHTML(channel?.name || "未知渠道")}</strong>
        </div>
      </td>
      <td>${statusBadge(item.status)}</td>
      <td class="table-muted">${item.scheduledAt ? formatDateTime(item.scheduledAt) : "未排期"}</td>
      <td>
        <div class="queue-actions">
          ${
            item.status === "review"
              ? `<button class="button button--success button--small" type="button" data-approve-queue="${item.id}">${icon("check")} 审核通过</button>`
              : ""
          }
          ${
            item.status === "ready"
              ? `<button class="button button--secondary button--small" type="button" data-approve-queue="${item.id}">${icon("calendar-clock")} 排期</button>`
              : ""
          }
          ${
            item.status === "scheduled"
              ? `<button class="button button--secondary button--small" type="button" data-mark-published="${item.id}">${icon("external-link")} 标记已发布</button>`
              : ""
          }
          <button class="icon-button" type="button" data-remove-queue="${item.id}" style="width:30px;height:30px" title="移除" aria-label="从队列移除">${icon("trash-2")}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderEmptyProjects() {
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${icon("package-open")}</span>
      <h2>先接入第一个项目</h2>
      <p>无论是软件、模型还是开源项目，都可以从一句价值主张开始建立分发计划。</p>
      <button class="button button--primary" type="button" data-open-intake>${icon("plus")} 接入项目</button>
    </div>
  `;
}

function openIntake() {
  if (!ensureProjectCreationAllowed()) return;
  document.querySelector("#intake-form").hidden = false;
  document.querySelector("#analysis-state").hidden = true;
  document.querySelector("#intake-form").reset();
  modalBackdrop.hidden = false;
  intakeModal.hidden = false;
  document.querySelector("#intake-form input")?.focus();
  refreshIcons();
}

async function handleIntakeSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const projectInput = {
    name: String(formData.get("name") || "").trim(),
    url: String(formData.get("url") || "").trim(),
    tagline: String(formData.get("tagline") || "").trim(),
    type: String(formData.get("type") || "AI 应用"),
    stage: String(formData.get("stage") || "Beta 内测"),
    audience: String(formData.get("audience") || "").trim(),
  };
  if (!projectInput.name || !projectInput.url || !projectInput.tagline || !projectInput.audience) return;
  if (!ensureProjectCreationAllowed()) return;

  form.hidden = true;
  document.querySelector("#analysis-state").hidden = false;
  refreshIcons();
  const steps = [...document.querySelectorAll(".analysis-step")];
  steps.forEach((step, index) => {
    step.className = `analysis-step${index === 0 ? " is-running" : ""}`;
    step.querySelector("span").innerHTML = icon(index === 0 ? "loader-circle" : "circle");
  });
  refreshIcons();

  for (let index = 0; index < 3; index += 1) {
    await wait(650);
    if (steps[index]) {
      steps[index].className = "analysis-step is-done";
      steps[index].querySelector("span").innerHTML = icon("check");
    }
    if (steps[index + 1]) {
      steps[index + 1].className = "analysis-step is-running";
      steps[index + 1].querySelector("span").innerHTML = icon("loader-circle");
    }
    refreshIcons();
  }

  await wait(400);
  if (!ensureProjectCreationAllowed()) return;
  const project = createAnalyzedProject(projectInput);
  const starterAssets = createStarterAssets(project);
  state.projects.unshift(project);
  activeProjectId = project.id;
  studioSettings.projectId = project.id;
  studioSettings.channels = project.channels.slice(0, 3);
  state.assets.unshift(...starterAssets);
  state.billing.usage.contentVersions += starterAssets.length;
  persist();
  closeAllModals();
  currentView = "overview";
  syncViewButtons();
  render();
  updateProfileSummary();
  showToast(
    "项目已接入",
    `${project.name} 已生成 ${starterAssets.length} 份起步内容，并计入本月内容额度`,
  );
}

function createAnalyzedProject(input) {
  const channelIds = chooseChannelsForProject(input);
  const scoreBase = input.type.includes("模型") ? 88 : input.type.includes("开源") ? 86 : 81;
  const completeness =
    (input.tagline.length >= 25 ? 2 : 0) + (input.audience.length >= 6 ? 2 : 0) + (input.url.startsWith("https://") ? 2 : 0);
  const palette = ["#205fd7", "#167457", "#6751ac", "#dc6046", "#a96d0d"];
  return {
    id: `project-${Date.now()}`,
    ...input,
    color: palette[state.projects.length % palette.length],
    score: Math.min(96, scoreBase + completeness),
    channels: channelIds,
    createdAt: new Date().toISOString(),
    source: detectSource(input.url),
  };
}

function chooseChannelsForProject(input) {
  const text = `${input.type} ${input.audience} ${input.tagline}`.toLowerCase();
  const base = ["github", "hackernews"];
  if (/模型|model|多模态|llm|大模型/.test(text)) base.push("huggingface", "modelscope", "zhihu");
  else base.push("producthunt", "v2ex", "futurepedia");
  if (/agent|智能体|bot|工作流/.test(text)) base.push("coze", "poe", "dify");
  if (/中文|国内|小红书|创作者/.test(text)) base.push("jike", "xiaohongshu");
  return [...new Set(base)].slice(0, 7);
}

function detectSource(url) {
  if (url.includes("github.com")) return "github";
  if (url.includes("huggingface.co") || url.includes("modelscope")) return "model";
  if (url.includes("producthunt.com")) return "producthunt";
  return "website";
}

function createStarterAssets(project) {
  const channelIds = project.channels.slice(0, 3);
  return channelIds.map((channelId, index) => {
    const channel = getChannel(channelId);
    const variant = buildChannelContent(project, channel, studioSettings.tone);
    return {
      id: `asset-${Date.now()}-${index}`,
      projectId: project.id,
      channelId,
      title: variant.title,
      body: variant.body,
      tags: variant.tags,
      status: "review",
      createdAt: new Date().toISOString(),
    };
  });
}

function openProjectDetail(projectId) {
  const project = getProject(projectId);
  if (!project) return;
  activeProjectId = project.id;
  const assets = getProjectAssets(project.id);
  const channels = getRecommendedChannels(project, 5);
  detailModalContent.innerHTML = `
    <div class="detail-hero" style="--project-color:${project.color}">
      <canvas data-detail-canvas="${project.id}"></canvas>
      <button class="icon-button detail-close" type="button" data-close-modal aria-label="关闭">${icon("x")}</button>
      <div class="detail-hero-content">
        <div>
          <span class="eyebrow" style="color:rgba(255,255,255,.7)">${escapeHTML(project.type)} · ${escapeHTML(project.stage)}</span>
          <h2 id="detail-modal-title">${escapeHTML(project.name)}</h2>
          <p>${escapeHTML(project.tagline)}</p>
        </div>
        <div class="detail-score">
          <strong>${project.score}</strong>
          <span>发布就绪度</span>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-stats">
        <div class="detail-stat"><span>目标用户</span><strong style="font-size:10px">${escapeHTML(project.audience)}</strong></div>
        <div class="detail-stat"><span>渠道组合</span><strong>${project.channels.length} 个</strong></div>
        <div class="detail-stat"><span>内容资产</span><strong>${assets.length} 份</strong></div>
      </div>
      <div class="detail-section-title">
        <h3>建议分发顺序</h3>
        <span>按当前项目适配度排序</span>
      </div>
      <div class="detail-channel-list">
        ${channels.map((channel) => renderDetailChannel(project, channel)).join("")}
      </div>
      <div class="detail-footer">
        <a href="${escapeAttribute(project.url)}" target="_blank" rel="noreferrer">${icon("link-2")} ${escapeHTML(project.url)}</a>
        <div class="detail-footer-actions">
          <button class="button button--secondary" type="button" data-add-channel="${channels[0]?.id || "github"}">${icon("plus")} 生成内容</button>
          <button class="button button--primary" type="button" data-view="studio">${icon("wand-sparkles")} 进入内容工坊</button>
        </div>
      </div>
    </div>
  `;
  modalBackdrop.hidden = false;
  detailModal.hidden = false;
  refreshIcons();
  requestAnimationFrame(() => drawSingleProjectCanvas(document.querySelector(`[data-detail-canvas="${project.id}"]`), project));
}

function renderDetailChannel(project, channel) {
  const fit = getProjectChannelFit(project.id, channel);
  return `
    <div class="detail-channel-row">
      <span class="channel-mark" style="--channel-color:${channel.color};--channel-bg:${channel.bg}">${escapeHTML(channelShort(channel))}</span>
      <div>
        <strong>${escapeHTML(channel.name)}</strong>
        <span>${escapeHTML(channel.channelFormat)} · ${escapeHTML(channel.reach)}</span>
      </div>
      <div class="fit-meter">
        <span>${fit}</span>
        <div class="fit-meter-track"><i style="width:${fit}%"></i></div>
      </div>
      ${modeBadge(channel.mode)}
    </div>
  `;
}

function openAssetEditor(assetId) {
  const asset = getAsset(assetId);
  if (!asset) return;
  const channel = getChannel(asset.channelId);
  const project = getProject(asset.projectId);
  assetModalContent.innerHTML = `
    <div class="asset-preview-header">
      <div class="asset-preview-channel">
        <span class="channel-mark channel-mark--large" style="--channel-color:${channel?.color};--channel-bg:${channel?.bg}">${escapeHTML(channel ? channelShort(channel) : "?")}</span>
        <div>
          <strong id="asset-modal-title">${escapeHTML(channel?.name || "渠道内容")}</strong>
          <span>${escapeHTML(project?.name || "未知项目")} · ${escapeHTML(channel?.channelFormat || "")}</span>
        </div>
      </div>
      <button class="icon-button" type="button" data-close-modal aria-label="关闭">${icon("x")}</button>
    </div>
    <form class="asset-editor" id="asset-edit-form">
      <label class="field">
        <span>标题</span>
        <input id="asset-title-input" name="title" value="${escapeAttribute(asset.title)}" maxlength="120" />
      </label>
      <label class="field">
        <span>正文</span>
        <textarea id="asset-content-input" name="body">${escapeHTML(asset.body)}</textarea>
      </label>
      <div class="asset-editor-meta">
        <span id="asset-character-count">${asset.body.length} 字符</span>
        <span>${channel?.mode === "api" ? "接口可用，仍需账号授权" : channel?.mode === "assisted" ? "发布时需浏览器辅助确认" : "需人工完成平台提交"}</span>
      </div>
      <div class="asset-editor-actions">
        <button class="button button--quiet" type="button" data-close-modal>取消</button>
        <button class="button button--secondary" type="button" id="copy-asset-body-button">${icon("copy")} 复制正文</button>
        <button class="button button--primary" type="submit" data-save-asset="${asset.id}">${icon("save")} 保存内容</button>
      </div>
    </form>
  `;
  const form = assetModalContent.querySelector("#asset-edit-form");
  assetModalContent.querySelector("#copy-asset-body-button").addEventListener("click", () => {
    copyToClipboard(assetModalContent.querySelector("#asset-content-input").value, "文案已复制");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveAssetEdit(asset.id, form);
  });
  modalBackdrop.hidden = false;
  assetModal.hidden = false;
  refreshIcons();
}

function saveAssetEdit(assetId, form) {
  const asset = getAsset(assetId);
  if (!asset) return;
  const selectedForm = form || assetModalContent.querySelector("#asset-edit-form");
  const title = selectedForm?.querySelector("#asset-title-input")?.value.trim();
  const body = selectedForm?.querySelector("#asset-content-input")?.value.trim();
  if (!title || !body) return;
  asset.title = title;
  asset.body = body;
  persist();
  closeAllModals();
  render();
  showToast("内容已保存", "草稿与发布队列都会使用这个版本");
}

function addChannelToStudio(channelId) {
  const channel = getChannel(channelId);
  if (!channel) return;
  if (detailModal.hidden === false) closeAllModals();
  if (!studioSettings.channels.includes(channelId)) studioSettings.channels.push(channelId);
  studioSettings.projectId = activeProjectId;
  currentView = "studio";
  syncViewButtons();
  render();
  showToast("已加入内容工坊", `${channel.name} 将生成一个独立渠道版本`);
}

function generateContentPack() {
  const project = getProject(studioSettings.projectId);
  if (!project) return;
  const selectedChannels = [...new Set(studioSettings.channels)].map(getChannel).filter(Boolean);
  if (!selectedChannels.length) {
    showToast("选择一个渠道", "至少选择一个目标渠道再生成内容");
    return;
  }
  const snapshot = getBillingSnapshot();
  if (snapshot.remaining.contentVersions < selectedChannels.length) {
    openBilling("content", { need: selectedChannels.length });
    return;
  }
  const generatedAt = Date.now();
  const generatedAssets = selectedChannels.map((channel, index) => {
    const variant = buildChannelContent(project, channel, studioSettings.tone);
    return {
      id: `asset-${generatedAt}-${index}`,
      projectId: project.id,
      channelId: channel.id,
      title: variant.title,
      body: variant.body,
      tags: variant.tags,
      status: "review",
      createdAt: new Date(generatedAt).toISOString(),
    };
  });
  state.generatedAssets.unshift(...generatedAssets);
  state.billing.usage.contentVersions += generatedAssets.length;
  persist();
  updateProfileSummary();
  renderStudio();
  showToast(`已生成 ${generatedAssets.length} 个版本`, "内容已按渠道格式拆分，等待加入审核队列");
}

function buildChannelContent(project, channel, tone) {
  const audience = project.audience || "目标用户";
  const name = project.name;
  const tagline = project.tagline.replace(/[。.!！]+$/, "");
  const tonePrefix =
    tone === "简洁直接"
      ? "直接说重点："
      : tone === "故事感"
        ? "我们花了很长时间解决一个具体问题。"
        : "我们把这件事当作工程问题来做：";
  const templates = {
    github: {
      title: `${name} 发布：${tagline}`,
      body: `${name} is now available.\n\n${tagline}.\n\nThis release focuses on making the project practical for ${audience}: clear setup, reproducible examples, and operational guardrails from day one. The repository includes quickstart paths, architecture notes, and examples that mirror real production constraints.\n\nWhat is included:\n- A focused core with a small, inspectable API\n- End-to-end examples and benchmark notes\n- Troubleshooting guidance for common deployment paths\n\nIf your team is working on this problem, try the quickstart and share a reproducible issue or use case.`,
      tags: ["open-source", project.type.replace(/\s+/g, "-").toLowerCase()],
    },
    huggingface: {
      title: `${name} · ${tagline}`,
      body: `${name} 面向 ${audience}，核心目标是：${tagline}。\n\n${tonePrefix}${project.type === "基础模型" ? "本次发布包含模型卡、推理示例、能力边界和评测说明。" : "本次发布提供可直接运行的示例、部署说明与关键能力边界。"}建议在使用前结合真实业务样本完成评估。\n\n适合场景：原型验证、内测工作流与需要快速接入的 AI 产品。欢迎通过讨论区提交可复现问题、评测结果和集成场景。`,
      tags: ["ai", "open-source", shortSlug(project.type)],
    },
    modelscope: {
      title: `${name}：面向${audience}的${project.type}`,
      body: `【项目简介】\n${name} 的核心价值是：${tagline}。\n\n【适用人群】\n${audience}。\n\n【本次发布】\n提供快速体验入口、关键能力说明与部署建议。项目更关注真实工作流中的可用性，而不是只展示单一 Demo。\n\n【建议下一步】\n从示例开始验证，再使用你的业务数据检查效果、延迟与资源占用。遇到可复现问题，欢迎附上环境信息提交反馈。`,
      tags: ["中文", "模型", shortSlug(project.type)],
    },
    hackernews: {
      title: `Show HN: ${name} – ${tagline}`,
      body: `We built ${name} because the existing workflow broke down for ${audience}.\n\n${tagline}. The current release is intentionally narrow: a focused core, reproducible examples, and enough operational detail to evaluate it in a real project.\n\nThe most useful feedback for us would be about the core API, failure modes, and deployment assumptions. We are sharing the architecture notes and benchmark methodology alongside the code so the tradeoffs are inspectable.`,
      tags: [],
    },
    producthunt: {
      title: `${name} — ${tagline}`,
      body: `Hi Product Hunt!\n\n${name} helps ${audience} turn a difficult workflow into something repeatable. ${tagline}.\n\nWe are launching with a focused first release: the workflows that matter most, clear examples, and a fast path from setup to a useful result.\n\nWe would love feedback on the onboarding experience and the first problem you try to solve with it.`,
      tags: [],
    },
    v2ex: {
      title: `分享一个我们做的${project.type}：${name}`,
      body: `最近在解决一个面向${audience}的具体问题，做出了 ${name}。\n\n一句话介绍：${tagline}。\n\n这次发布主要想把它做成能真正进入工作流的东西，所以优先补了示例、边界说明和失败时的诊断信息。不是“一键解决所有问题”的定位，更适合先在明确场景里验证。\n\n欢迎从使用体验、技术方案和部署成本几个角度拍砖。`,
      tags: ["分享创造"],
    },
    poe: {
      title: `${name}｜${tagline}`,
      body: `你好，我是 ${name}。\n\n我可以帮助${audience}完成与「${tagline}」相关的任务。\n\n使用建议：先输入你的目标、已有材料与限制条件，我会给出结构化结果；需要继续调整时，直接告诉我偏好的方向。当前版本更适合明确任务的辅助与快速迭代。`,
      tags: [],
    },
    coze: {
      title: `${name} · ${project.type}体验入口`,
      body: `用 ${name} 把「${tagline}」变成可重复执行的工作流。\n\n适合${audience}。开始对话后，描述你的目标与当前材料，Agent 会按步骤完成分析、整理与输出。需要接入业务数据时，可在工作流中替换对应节点。`,
      tags: [],
    },
    dify: {
      title: `${name}：${tagline}`,
      body: `${name} 是一个面向${audience}的 ${project.type} 模板/插件。\n\n它把输入校验、核心处理、结果检查拆成可观察的节点，方便团队替换模型、接入知识库或加入人工审核。建议先在测试工作区验证输入输出，再发布到生产环境。`,
      tags: [],
    },
    zhihu: {
      title: `如何为${audience}解决这个问题？我们做了 ${name}`,
      body: `在讨论 ${name} 之前，先说清楚它要解决的问题：${tagline}。\n\n很多同类方案的问题不在演示，而在边界。真实工作流需要知道输入不完整时怎么办、失败能否复现、成本是否可解释。我们在第一版里优先处理这些问题。\n\n${name} 适合${audience}先做明确场景的验证。它不替代业务判断，但能把重复工作变成可检查的流程。后续我们会继续公开评测口径与限制。`,
      tags: [],
    },
    jike: {
      title: `做了一个给${audience}的新工具：${name}`,
      body: `${tagline}。\n\n这次最想解决的，是让结果从“看起来很厉害”变成“真的能进入日常工作流”。第一版已经把示例、限制和诊断信息放在一起。\n\n适合拿来验证一个明确场景，也欢迎写下你最想让它做的下一步。`,
      tags: ["AI", project.type],
    },
    xiaohongshu: {
      title: `给${audience}的效率新搭子｜${name}`,
      body: `最近试了一个新思路：${tagline}。\n\n${name} 比较适合从一个具体任务开始，不需要先搭一套很重的流程。我的建议是先准备真实材料，用小范围结果判断是否值得继续接入。\n\n它不会替你做完所有判断，但能明显缩短从想法到第一版结果的路径。\n\n#AI工具 #效率工具 #${project.type}`,
      tags: ["AI工具", "效率工具"],
    },
    futurepedia: {
      title: `${name} — ${tagline}`,
      body: `${name} is an AI ${project.type.toLowerCase()} for ${audience}. It helps users move from a described task to a structured, reviewable result.\n\nCore use cases include rapid prototyping, repeatable knowledge work, and structured content generation. The product supports a focused workflow with visible inputs and editable outputs.`,
      tags: [],
    },
    theresanaiforthat: {
      title: `${name} for ${audience}`,
      body: `Use ${name} when you need to ${tagline.toLowerCase()}. Start with a clear input, review the structured output, then iterate with domain-specific constraints.`,
      tags: [],
    },
  };
  return (
    templates[channel.id] || {
      title: `${name} · ${tagline}`,
      body: `${tagline}。\n\n${name} 面向 ${audience}，提供可验证、可编辑的 ${project.type} 使用路径。欢迎查看项目并提交反馈。`,
      tags: [],
    }
  );
}

function queueAsset(assetId) {
  const asset = getAsset(assetId);
  if (!asset) return;
  if (!state.assets.some((item) => item.id === asset.id)) state.assets.push(asset);
  state.generatedAssets = state.generatedAssets.filter((item) => item.id !== asset.id);
  const existing = state.queue.find((item) => item.assetId === asset.id);
  if (existing) {
    persist();
    render();
    showToast("已经在队列中", "这条内容不需要重复加入");
    return;
  }
  state.queue.unshift({
    id: `queue-${Date.now()}`,
    assetId: asset.id,
    projectId: asset.projectId,
    channelId: asset.channelId,
    status: "review",
    scheduledAt: null,
    createdAt: new Date().toISOString(),
  });
  persist();
  render();
  showToast("已加入发布队列", "状态为待审核，不会自动对外发布");
}

function approveQueueItem(queueId) {
  const item = state.queue.find((entry) => entry.id === queueId);
  if (!item) return;
  if (item.status === "review") {
    item.status = "ready";
    const asset = getAsset(item.assetId);
    if (asset) asset.status = item.status;
    showToast("审核已通过", "内容可以进入排期，仍需明确选择发布时间");
  } else if (item.status === "ready") {
    openScheduleModal(queueId);
    return;
  }
  persist();
  render();
}

function openScheduleModal(queueId) {
  const item = state.queue.find((entry) => entry.id === queueId);
  if (!item || item.status !== "ready") return;
  const asset = getAsset(item.assetId);
  const project = getProject(item.projectId);
  const channel = getChannel(item.channelId);
  if (!asset || !channel) return;

  scheduleModal.dataset.queueId = queueId;
  scheduleSummary.innerHTML = `
    <div class="schedule-summary-copy">
      <span class="channel-mark" style="--channel-color:${channel.color};--channel-bg:${channel.bg}">${escapeHTML(channelShort(channel))}</span>
      <div>
        <strong>${escapeHTML(asset.title)}</strong>
        <span>${escapeHTML(project?.name || "未知项目")} · ${escapeHTML(channel.name)}</span>
      </div>
    </div>
    ${statusBadge(item.status)}
  `;
  scheduleAtInput.value = toDateTimeLocalValue(getDefaultScheduleDate());
  scheduleAtInput.min = toDateTimeLocalValue(new Date(Date.now() + 60_000));
  modalBackdrop.hidden = false;
  scheduleModal.hidden = false;
  refreshIcons();
  requestAnimationFrame(() => scheduleAtInput.focus());
}

function handleScheduleSubmit(event) {
  event.preventDefault();
  const queueId = scheduleModal.dataset.queueId;
  const item = state.queue.find((entry) => entry.id === queueId);
  if (!item || !scheduleAtInput.value) return;
  const scheduledAt = new Date(scheduleAtInput.value);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + 60_000) {
    showToast("发布时间不可用", "请选择晚于当前时间至少一分钟的发布窗口");
    scheduleAtInput.focus();
    return;
  }

  item.status = "scheduled";
  item.scheduledAt = scheduledAt.toISOString();
  const asset = getAsset(item.assetId);
  if (asset) asset.status = item.status;
  persist();
  closeAllModals();
  render();
  showToast("已安排发布窗口", formatDateTime(item.scheduledAt));
}

function getDefaultScheduleDate() {
  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + 1);
  scheduled.setHours(10, 30, 0, 0);
  return scheduled;
}

function toDateTimeLocalValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function markPublished(queueId) {
  const item = state.queue.find((entry) => entry.id === queueId);
  if (!item) return;
  item.status = "published";
  item.publishedAt = new Date().toISOString();
  const asset = getAsset(item.assetId);
  if (asset) asset.status = "published";
  persist();
  render();
  showToast("已记录人工发布", "系统不会声称完成了未经授权的平台操作");
}

function removeQueueItem(queueId) {
  state.queue = state.queue.filter((entry) => entry.id !== queueId);
  persist();
  render();
  showToast("已从队列移除", "原始内容资产仍然保留");
}

function openCommand() {
  modalBackdrop.hidden = false;
  commandModal.hidden = false;
  commandInput.value = "";
  commandFocus = 0;
  renderCommandResults("");
  requestAnimationFrame(() => commandInput.focus());
  refreshIcons();
}

function closeCommand() {
  commandModal.hidden = true;
  if (!anyModalOpen()) modalBackdrop.hidden = true;
}

function getCommandResults(query) {
  const normalized = query.trim().toLowerCase();
  const actions = [
    {
      type: "action",
      icon: "plus",
      title: "接入新项目",
      subtitle: "创建项目并生成渠道建议",
      action: () => {
        closeCommand();
        openIntake();
      },
    },
    {
      type: "action",
      icon: "wand-sparkles",
      title: "生成渠道内容",
      subtitle: "打开内容工坊",
      action: () => {
        closeCommand();
        switchView("studio");
      },
    },
    {
      type: "action",
      icon: "scan-search",
      title: "优化 AI 搜索发现",
      subtitle: "检查可发现性、模拟问题并生成索引包",
      action: () => {
        closeCommand();
        switchView("discovery");
      },
    },
    {
      type: "action",
      icon: "send",
      title: "查看发布队列",
      subtitle: "审核与排期",
      action: () => {
        closeCommand();
        switchView("queue");
      },
    },
  ];
  const projectResults = state.projects.map((project) => ({
    type: "project",
    icon: "boxes",
    title: project.name,
    subtitle: project.tagline,
    action: () => {
      closeCommand();
      openProjectDetail(project.id);
    },
    search: `${project.name} ${project.tagline} ${project.audience} ${project.type}`,
  }));
  const channelResults = channelCatalog.map((channel) => ({
    type: "channel",
    icon: "radio-tower",
    title: channel.name,
    subtitle: channel.description,
    action: () => {
      closeCommand();
      activeProjectId = studioSettings.projectId || activeProjectId;
      addChannelToStudio(channel.id);
    },
    search: `${channel.name} ${channel.description} ${channel.group}`,
  }));
  const all = [...actions, ...projectResults, ...channelResults];
  return normalized
    ? all.filter((result) => `${result.title} ${result.subtitle} ${result.search || ""}`.toLowerCase().includes(normalized))
    : all.slice(0, 6);
}

function renderCommandResults(query) {
  const results = getCommandResults(query);
  commandFocus = Math.min(commandFocus, Math.max(results.length - 1, 0));
  if (!results.length) {
    commandResults.innerHTML = `<div class="command-empty">没有找到相关内容</div>`;
    return;
  }
  const groups = { action: "快捷操作", project: "项目", channel: "渠道" };
  let previousType = "";
  commandResults.innerHTML = results
    .map((result, index) => {
      const heading =
        result.type !== previousType ? `<div class="command-group-label">${groups[result.type]}</div>` : "";
      previousType = result.type;
      return `
        ${heading}
        <button class="command-result ${index === commandFocus ? "is-focused" : ""}" type="button" data-command-index="${index}">
          <span class="command-result-icon">${icon(result.icon)}</span>
          <span class="command-result-copy">
            <strong>${escapeHTML(result.title)}</strong>
            <span>${escapeHTML(result.subtitle)}</span>
          </span>
          <span>↵</span>
        </button>
      `;
    })
    .join("");
  refreshIcons();
}

function executeCommand(index) {
  const results = getCommandResults(commandInput.value);
  results[index]?.action();
}

function closeAllModals() {
  intakeModal.hidden = true;
  detailModal.hidden = true;
  assetModal.hidden = true;
  scheduleModal.hidden = true;
  commandModal.hidden = true;
  billingModal.hidden = true;
  modalBackdrop.hidden = true;
}

function anyModalOpen() {
  return [intakeModal, detailModal, assetModal, scheduleModal, commandModal, billingModal].some(
    (modal) => !modal.hidden,
  );
}

function showToast(title, message) {
  if (toastRegion.children.length >= 3) {
    toastRegion.firstElementChild?.remove();
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-icon">${icon("sparkles")}</span>
    <span class="toast-copy"><strong>${escapeHTML(title)}</strong><span>${escapeHTML(message)}</span></span>
    <button class="toast-close" type="button" aria-label="关闭通知">${icon("x")}</button>
  `;
  toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
  toastRegion.appendChild(toast);
  refreshIcons();
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(5px)";
    window.setTimeout(() => toast.remove(), 180);
  }, 4200);
}

function copyToClipboard(text, successMessage) {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(successMessage, "可以直接粘贴到你确认过的发布平台"))
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast(successMessage, "可以直接粘贴到你确认过的发布平台");
    });
}

function syncViewButtons() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === currentView);
  });
}

function getProject(projectId) {
  return state.projects.find((project) => project.id === projectId);
}

function getChannel(channelId) {
  return channelCatalog.find((channel) => channel.id === channelId);
}

function getAsset(assetId) {
  return getAllAssets().find((asset) => asset.id === assetId);
}

function getRecommendedChannels(project, limit = channelCatalog.length) {
  if (!project) return [];
  return channelCatalog
    .map((channel) => ({ ...channel, projectFit: getProjectChannelFit(project.id, channel) }))
    .sort((a, b) => b.projectFit - a.projectFit)
    .slice(0, limit);
}

function getProjectChannelFit(projectId, channel) {
  if (!channel) return 0;
  const project = getProject(projectId);
  if (!project) return channel.fit;
  let adjustment = 0;
  const isModel = /模型|model/.test(`${project.type} ${project.tagline}`.toLowerCase());
  const isOpenSource = /开源|swift|framework|框架|sdk/i.test(`${project.type} ${project.tagline}`);
  const isAgent = /agent|智能体|bot|工作流/i.test(`${project.type} ${project.tagline}`);
  if (isModel && ["huggingface", "modelscope", "zhihu"].includes(channel.id)) adjustment += 5;
  if (isOpenSource && ["github", "hackernews", "v2ex"].includes(channel.id)) adjustment += 4;
  if (isAgent && ["coze", "poe", "dify"].includes(channel.id)) adjustment += 4;
  if (/中文|国内/.test(project.audience) && ["modelscope", "v2ex", "jike", "zhihu"].includes(channel.id)) adjustment += 3;
  return Math.min(99, channel.fit + adjustment);
}

function statusBadge(status) {
  const label = statusLabel(status);
  const variant =
    status === "review"
      ? "status-review"
      : status === "ready"
        ? "status-ready"
        : status === "scheduled"
          ? "status-scheduled"
          : "status-published";
  return `<span class="status-badge ${variant}">${escapeHTML(label)}</span>`;
}

function statusLabel(status) {
  return (
    {
      review: "待审核",
      ready: "可发布",
      scheduled: "已排期",
      published: "已发布",
    }[status] || "草稿"
  );
}

function modeBadge(mode) {
  const modes = {
    api: { className: "mode-api", label: "API 接入" },
    assisted: { className: "mode-assisted", label: "浏览器辅助" },
    manual: { className: "mode-manual", label: "人工发布" },
  };
  const selected = modes[mode] || modes.manual;
  return `<span class="mode-badge ${selected.className}">${selected.label}</span>`;
}

function channelShort(channel) {
  const overrides = {
    huggingface: "HF",
    github: "GH",
    producthunt: "PH",
    modelscope: "MS",
    poe: "P",
    coze: "C",
    dify: "D",
    hackernews: "HN",
    v2ex: "V2",
    jike: "即",
    zhihu: "知",
    futurepedia: "FP",
    theresanaiforthat: "TAA",
    xiaohongshu: "红",
  };
  return overrides[channel.id] || initials(channel.name);
}

function shortChannelName(name) {
  return name.replace("Hugging Face", "HF").replace("Product Hunt", "PH").replace("ModelScope 魔搭", "ModelScope");
}

function initials(value) {
  const clean = String(value || "").trim();
  if (!clean) return "?";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

function shortSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
}

function formatDateTime(value) {
  if (!value) return "未排期";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function icon(name) {
  return `<i data-lucide="${escapeAttribute(name)}"></i>`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("\n", " ");
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function drawProjectCanvases() {
  document.querySelectorAll("[data-project-canvas]").forEach((canvas) => {
    const project = getProject(canvas.dataset.projectCanvas);
    if (project) drawSingleProjectCanvas(canvas, project);
  });
}

function drawSingleProjectCanvas(canvas, project) {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(rect.width, 320);
  const height = Math.max(rect.height, 100);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const base = project.color || "#205fd7";
  const colors = colorVariants(base);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const random = seededRandom(hashString(project.id));
  for (let index = 0; index < 13; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 28 + random() * 92;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, colors[index % colors.length]);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  const step = 22;
  for (let x = -height; x < width + height; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.2;
  const nodeCount = 5 + Math.floor(random() * 4);
  const points = Array.from({ length: nodeCount }, () => ({
    x: 20 + random() * (width - 40),
    y: 18 + random() * (height - 36),
  }));
  points.forEach((point, index) => {
    const other = points[(index + 1) % points.length];
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(other.x, other.y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.3, 0, Math.PI * 2);
    ctx.fill();
  });

  const vignette = ctx.createLinearGradient(0, 0, width, height);
  vignette.addColorStop(0, "rgba(5,10,8,0)");
  vignette.addColorStop(1, "rgba(5,10,8,0.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function colorVariants(hex) {
  const [r, g, b] = hexToRgb(hex);
  return [
    `rgba(${Math.min(255, r + 65)},${Math.min(255, g + 65)},${Math.min(255, b + 65)},0.58)`,
    `rgba(${Math.max(0, r - 44)},${Math.max(0, g - 28)},${Math.max(0, b - 18)},0.52)`,
    `rgba(${Math.min(255, r + 18)},${Math.min(255, g + 95)},${Math.min(255, b + 30)},0.36)`,
  ];
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}
