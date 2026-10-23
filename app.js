const STORAGE_KEY = "tuoyu-distribution-workspace-v1";
const WORKSPACE_VERSION = 2;
const STARTER_CONTENT_COUNT = 3;
const billingPeriodFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).catch((error) => {
      console.warn("TuoYu offline shell registration failed.", error);
    });
  });
}

const billingPlans = [
  {
    id: "free",
    name: "Free",
    eyebrow: "START",
    description: "Validate your project positioning and launch path.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      projects: 1,
      contentVersions: 20,
      indexPackages: 1,
    },
    features: [
      "1 active workspace project",
      "20 channel drafts per month",
      "1 AI discovery package per month",
      "14 channel matches with manual publishing",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    eyebrow: "CREATOR",
    description: "For teams shipping product, model, and open-source releases.",
    monthlyPrice: 49,
    yearlyPrice: 399,
    featured: true,
    limits: {
      projects: 10,
      contentVersions: 300,
      indexPackages: Number.POSITIVE_INFINITY,
    },
    features: [
      "10 active workspace projects",
      "300 channel drafts per month",
      "Unlimited AI discovery packages",
      "Review, scheduling, and publishing history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "PRO",
    description: "For high-volume releases and multi-project operations.",
    monthlyPrice: 149,
    yearlyPrice: 1299,
    limits: {
      projects: 50,
      contentVersions: 2000,
      indexPackages: Number.POSITIVE_INFINITY,
    },
    features: [
      "50 active workspace projects",
      "2,000 channel drafts per month",
      "Unlimited AI discovery packages",
      "Built for batch distribution and long-term operations",
    ],
  },
];

const channelCatalog = [
  {
    id: "huggingface",
    name: "Hugging Face",
    group: "Models & Agents",
    description: "Model cards, Spaces, and open-source AI project visibility",
    audiences: ["AI engineers", "Researchers"],
    reach: "Global AI developers",
    mode: "api",
    color: "#8a6b16",
    bg: "#fff5cf",
    fit: 94,
    channelFormat: "Model card / Space description",
  },
  {
    id: "github",
    name: "GitHub",
    group: "Developer communities",
    description: "Distribute through releases, README files, and organization updates",
    audiences: ["Engineers", "Open-source developers"],
    reach: "Global developers",
    mode: "api",
    color: "#303a36",
    bg: "#eef1ef",
    fit: 92,
    channelFormat: "Release notes",
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    group: "Launch directories",
    description: "A launch channel for early adopters and tool hunters",
    audiences: ["Product managers", "Early adopters"],
    reach: "Global product community",
    mode: "manual",
    color: "#c14b2e",
    bg: "#fff0ea",
    fit: 84,
    channelFormat: "Launch post",
  },
  {
    id: "modelscope",
    name: "ModelScope",
    group: "Models & Agents",
    description: "Discovery and evaluation channel for models and Spaces",
    audiences: ["AI engineers", "Researchers"],
    reach: "AI developers",
    mode: "api",
    color: "#6751ac",
    bg: "#f0ecff",
    fit: 90,
    channelFormat: "Model overview",
  },
  {
    id: "poe",
    name: "Poe",
    group: "Models & Agents",
    description: "Distribution platform for bots and AI application users",
    audiences: ["AI users", "Creators"],
    reach: "AI consumers",
    mode: "assisted",
    color: "#5541a2",
    bg: "#f1edff",
    fit: 79,
    channelFormat: "Bot profile",
  },
  {
    id: "coze",
    name: "Coze",
    group: "Models & Agents",
    description: "App-store-style distribution for agents, bots, and workflows",
    audiences: ["Business users", "AI creators"],
    reach: "AI users",
    mode: "assisted",
    color: "#216959",
    bg: "#e5f4ef",
    fit: 82,
    channelFormat: "Agent overview",
  },
  {
    id: "dify",
    name: "Dify Marketplace",
    group: "Models & Agents",
    description: "Bring plugins, templates, and workflows into enterprise AI",
    audiences: ["AI engineers", "Enterprise teams"],
    reach: "Enterprise AI users",
    mode: "manual",
    color: "#2469a5",
    bg: "#e8f2fb",
    fit: 76,
    channelFormat: "Plugin documentation",
  },
  {
    id: "hackernews",
    name: "Hacker News",
    group: "Developer communities",
    description: "High-quality technical discussion driven by real results",
    audiences: ["Engineers", "Founders"],
    reach: "Technical decision-makers",
    mode: "api",
    color: "#d85d27",
    bg: "#fff0e8",
    fit: 86,
    channelFormat: "Show HN",
  },
  {
    id: "v2ex",
    name: "V2EX",
    group: "Developer communities",
    description: "Developer discussion, project sharing, and product feedback",
    audiences: ["Engineers", "Independent developers"],
    reach: "Developer community",
    mode: "api",
    color: "#46555d",
    bg: "#eef2f4",
    fit: 80,
    channelFormat: "Discussion post",
  },
  {
    id: "jike",
    name: "Jike",
    group: "Community channels",
    description: "Reach technology communities through updates and product stories",
    audiences: ["Product managers", "Technology professionals"],
    reach: "Technology community",
    mode: "assisted",
    color: "#c99600",
    bg: "#fff8d9",
    fit: 74,
    channelFormat: "Community update",
  },
  {
    id: "zhihu",
    name: "Zhihu",
    group: "Community channels",
    description: "Build long-term search visibility with questions and in-depth analysis",
    audiences: ["Professional users", "Knowledge seekers"],
    reach: "Search users",
    mode: "manual",
    color: "#2269b6",
    bg: "#e9f2fc",
    fit: 69,
    channelFormat: "Q&A article",
  },
  {
    id: "futurepedia",
    name: "Futurepedia",
    group: "Launch directories",
    description: "AI tool directory for high-intent search use cases",
    audiences: ["AI users", "Product managers"],
    reach: "Global AI users",
    mode: "manual",
    color: "#558139",
    bg: "#edf7e7",
    fit: 77,
    channelFormat: "Tool listing",
  },
  {
    id: "theresanaiforthat",
    name: "There's An AI For That",
    group: "Launch directories",
    description: "Task-focused AI tool discovery platform",
    audiences: ["AI users", "Content creators"],
    reach: "Global AI users",
    mode: "manual",
    color: "#8a4724",
    bg: "#fff1e9",
    fit: 72,
    channelFormat: "Task description",
  },
  {
    id: "xiaohongshu",
    name: "Xiaohongshu",
    group: "Community channels",
    description: "Reach creators and general users through real use cases",
    audiences: ["Creators", "General users"],
    reach: "Content community",
    mode: "assisted",
    color: "#c83d45",
    bg: "#ffedee",
    fit: 64,
    channelFormat: "Use-case note",
  },
];

const now = new Date();
const demoProjects = [
  {
    id: "agentloom",
    name: "Agentloom",
    url: "https://github.com/agentloom/agentloom",
    tagline: "Observable workflow primitives for testable multi-agent collaboration.",
    type: "Open-source framework",
    stage: "General availability",
    audience: "AI engineers, agent developers",
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
    tagline: "A lightweight multimodal model for edge devices that runs with 2.8 GB of VRAM.",
    type: "Foundation model",
    stage: "Open-source launch",
    audience: "Model researchers, edge AI developers",
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
    title: "Agentloom v1.0: Observable workflow primitives for multi-agent systems",
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
    title: "Lumen-3B: A lightweight multimodal foundation model",
    body:
      "Lumen-3B is a lightweight multimodal model trained for edge deployments. It focuses on low-memory inference, image-text understanding, and structured output.\n\nThe model supports visual question answering, document understanding, and lightweight OCR assistance. With 4-bit quantization, it can run with about 2.8 GB of VRAM. The release package includes inference examples, an evaluation card, and deployment notes.\n\nIt is designed for on-device knowledge bases, screenshot understanding, and offline assistance. Run a second evaluation with your own production samples before deployment.",
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
let projectFilter = "All";
let channelFilter = "All";
let channelQuery = "";
let queueFilter = "All";
let discoveryQuery = "";
let discoveryProbeResult = null;
let studioSettings = {
  projectId: state.projects[0]?.id || "",
  channels: ["github", "huggingface", "hackernews"],
  tone: "Technical",
  language: "Auto",
  goal: "Launch",
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
  return Number.isFinite(value) ? new Intl.NumberFormat("en-US").format(value) : "Unlimited";
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
      ? "Pro trial"
      : state.billing.source === "preview"
        ? `${snapshot.plan.name} · Local preview`
        : snapshot.plan.name;
  profileLabel.textContent =
    snapshot.plan.id === "free"
      ? `${sourceLabel} · ${formatUsageLimit(snapshot.remaining.contentVersions)} drafts left this month`
      : `${sourceLabel} · ${state.billing.interval === "yearly" ? "Yearly" : "Monthly"}`;
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
          state.billing.interval === "yearly" ? "year" : "month"
        }`;

  billingModalContent.innerHTML = `
    <div class="billing-modal-header">
      <div>
        <span class="eyebrow">PLAN &amp; USAGE</span>
        <h2 id="billing-modal-title">Plans and usage</h2>
        <p>Usage resets each calendar month in the Asia/Shanghai time zone. This is a local preview; billing, renewals, and refunds after public release will be handled by Microsoft Store.</p>
      </div>
      <button class="icon-button" type="button" data-close-modal aria-label="Close">${icon("x")}</button>
    </div>
    <div class="billing-modal-body">
      ${renderBillingContextAlert(snapshot)}

      <section class="billing-current" aria-label="Current plan">
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
              ? `Free trial · ${trialDays} days remaining`
              : `Current period: ${escapeHTML(periodLabel)}`
          }</span>
        </div>
      </section>

      <section class="billing-usage" aria-labelledby="billing-usage-title">
        <div class="billing-section-heading">
          <div>
            <h3 id="billing-usage-title">Usage this month</h3>
            <p>Demo projects do not count toward limits. Existing content is never deleted when you downgrade.</p>
          </div>
          <span>${escapeHTML(periodLabel)}</span>
        </div>
        <div class="billing-usage-grid">
          ${renderBillingUsageItem("boxes", "Workspace projects", snapshot.billableProjects, currentPlan.limits.projects, "Demo projects excluded")}
          ${renderBillingUsageItem("file-text", "Channel drafts", state.billing.usage.contentVersions, currentPlan.limits.contentVersions, "Each successfully generated channel draft counts as one")}
          ${renderBillingUsageItem("file-code-2", "AI discovery packages", state.billing.usage.indexPackages, currentPlan.limits.indexPackages, "Each generation or regeneration counts as one")}
        </div>
      </section>

      <section class="billing-plans-section" aria-labelledby="billing-plans-title">
        <div class="billing-plan-heading">
          <div>
            <h3 id="billing-plans-title">Choose a plan that matches your release cadence</h3>
            <p>Yearly billing is priced at 10 months. After a downgrade, existing projects remain accessible, but actions above the new limits are paused.</p>
          </div>
          <div class="billing-interval-toggle" role="group" aria-label="Billing interval">
            <button type="button" data-billing-interval="monthly" class="${billingPreviewInterval === "monthly" ? "is-active" : ""}">Monthly</button>
            <button type="button" data-billing-interval="yearly" class="${billingPreviewInterval === "yearly" ? "is-active" : ""}">Yearly · Save 2 months</button>
          </div>
        </div>
        <div class="billing-plan-grid">
          ${billingPlans.map((plan) => renderBillingPlanCard(plan)).join("")}
        </div>
      </section>

      <div class="billing-store-note">
        <span>${icon("shield-check")}</span>
        <div>
          <strong>Local prototype preview. No real charge will be made.</strong>
          <p>After public release, plan purchases and renewals will be completed through Microsoft Store. The current switch only validates limits and interface behavior; Store product IDs and purchase receipt verification are not connected yet. See the <a href="./SUBSCRIPTION_TERMS.md">Subscription Terms</a> and <a href="./PRIVACY.md">Privacy Notice</a>.</p>
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
      title: "Project limit reached",
      detail: `${snapshot.plan.name} supports up to ${formatUsageLimit(snapshot.plan.limits.projects)} workspace projects. Existing projects will not be deleted.`,
    },
    content: {
      title: "Not enough channel draft credits",
      detail:
        billingContextNeed > 0
          ? `This action needs ${billingContextNeed} credits, but only ${formatUsageLimit(snapshot.remaining.contentVersions)} remain this month. Credits are not deducted for failed generations.`
          : `Only ${formatUsageLimit(snapshot.remaining.contentVersions)} channel draft credits remain this month.`,
    },
    discovery: {
      title: "AI discovery package limit reached",
      detail: `${snapshot.plan.name} includes ${formatUsageLimit(snapshot.plan.limits.indexPackages)} discovery packages per month. Existing packages can still be copied and used.`,
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
        <strong>${new Intl.NumberFormat("en-US").format(used)}</strong>
        <span>/ ${escapeHTML(formatUsageLimit(limit))}</span>
      </div>
      <div class="billing-progress ${unlimited ? "is-unlimited" : ""}" aria-hidden="true">
        <i style="width:${percent}%"></i>
      </div>
      <small>${
        unlimited ? "Unlimited on this plan" : remaining > 0 ? `${formatUsageLimit(remaining)} remaining` : "Monthly limit reached"
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
    ? `<button class="button button--secondary" type="button" disabled>${icon("check")} Current plan</button>`
    : trialAvailable
      ? `<button class="button button--primary" type="button" data-start-trial>${icon("gift")} Start 7-day free trial</button>`
      : `<button class="button button--primary" type="button" data-preview-plan="${plan.id}">${icon("eye")} Preview ${plan.id === "free" ? "Free" : "plan"}</button>`;

  return `
    <article class="billing-plan-card ${plan.featured ? "billing-plan-card--featured" : ""}" data-billing-plan="${plan.id}">
      <div class="billing-plan-card-head">
        <span>${escapeHTML(plan.eyebrow)}</span>
        ${isTrialPlan ? `<em>Trial active</em>` : plan.featured ? `<em>Recommended</em>` : ""}
      </div>
      <h4>${escapeHTML(plan.name)}</h4>
      <p>${escapeHTML(plan.description)}</p>
      <div class="billing-plan-price">
        <strong>${escapeHTML(formatCurrency(price))}</strong>
        <span>${plan.id === "free" ? "forever" : interval === "yearly" ? "/ year" : "/ month"}</span>
      </div>
      <small class="billing-plan-equivalent">${
        monthlyEquivalent
          ? `About ${escapeHTML(formatCurrency(monthlyEquivalent))}/month · Save ${escapeHTML(formatCurrency(annualSaving))} versus monthly`
          : plan.id === "free"
            ? "No payment required"
            : "Cancel renewal anytime through Microsoft Store"
      }</small>
      <ul class="billing-plan-features">
        ${plan.features.map((feature) => `<li>${icon("check")}<span>${escapeHTML(feature)}</span></li>`).join("")}
      </ul>
      <div class="billing-plan-footer">
        ${button}
        ${
          plan.id !== "free"
            ? `<button class="billing-store-pending" type="button" data-store-checkout>${icon("store")} Microsoft Store subscription not connected</button>`
            : `<span class="billing-plan-caption">Best for validating your first project</span>`
        }
      </div>
    </article>
  `;
}

function formatCurrency(value) {
  return `¥${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatBillingPeriod(periodKey) {
  const [year, month] = String(periodKey || "").split("-");
  return year && month
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", timeZone: "UTC" }).format(
        new Date(Date.UTC(Number(year), Number(month) - 1, 1)),
      )
    : "Current month";
}

function getBillingSourceLabel() {
  return (
    {
      free: "Free plan",
      preview: "Local plan preview",
      trial: "Pro trial",
      "trial-expired": "Trial ended",
      store: "Microsoft Store subscription",
    }[state.billing.source] || "Free plan"
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
    `${plan.name} is now previewed locally`,
    plan.id === "free"
      ? "Limits were updated. No existing projects or content were deleted."
      : "No charge was made. Public subscriptions will be billed through Microsoft Store.",
  );
}

function startProfessionalTrial() {
  if (state.billing.trialUsed) {
    showToast("Trial already used", "Each workspace can claim one 7-day Pro trial.");
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
  showToast("Your Pro trial has started", "Pro limits are available for 7 days. The workspace will return to Free when the trial ends.");
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
    showToast("Channel signals refreshed", "Three channels are strong candidates for a higher priority today.");
  });
  document.querySelector("#notification-button").addEventListener("click", () => {
    showToast("No new blockers", "Two drafts are waiting for your pre-publish review.");
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
    showToast("Microsoft Store checkout is not connected", "This build only validates plans and limits. No charge will be made.");
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
    copyToClipboard(copyButton.dataset.copyText, "Draft copied");
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
    if (count) count.textContent = `${event.target.value.length} characters`;
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
  const todayString = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(now);

  appContent.innerHTML = `
    ${viewHeader(
      "DISTRIBUTION DESK",
      "Distribution desk",
      "Rita identifies where each project belongs and creates channel-native content for the global AI ecosystem.",
      `${todayString} · Live local workspace data`,
    )}

    <section class="metrics-row" aria-label="Key metrics">
      ${metricCard("boxes", "Active projects", state.projects.length, "2 added this week")}
      ${metricCard("radio-tower", "Connected channels", channelCatalog.length, "8 API-ready")}
      ${metricCard("file-text", "Content assets", getAllAssets().length, "Includes drafts not yet queued")}
      ${metricCard("circle-check", "In review", reviewCount, scheduledCount ? `${scheduledCount} scheduled` : "Queue clear")}
    </section>

    ${
      activeProject
        ? `
      <section class="overview-grid">
        <article class="panel focus-card">
          <div class="panel-header">
            <div class="panel-title">${icon("rocket")}<h2>Current launch focus</h2></div>
            <button class="text-button" type="button" data-open-project="${activeProject.id}">
              Project details ${icon("arrow-up-right")}
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
                <span class="meta-tag">${icon("radio-tower")} ${activeProject.channels.length} target channels</span>
                <span class="meta-tag">${icon("files")} ${projectAssets.length} content assets</span>
              </div>
              <div class="focus-actions">
                <button class="button button--primary" type="button" data-view="studio">
                  ${icon("wand-sparkles")} Generate channel content
                </button>
                <button class="button button--secondary" type="button" data-open-project="${activeProject.id}">
                  ${icon("chart-no-axes-combined")} View distribution profile
                </button>
              </div>
            </div>
            <div class="launch-score-wrap">
              ${renderDistributionGraph(activeProject)}
              <div class="score-row">
                <div class="score-ring" style="--score:${activeProject.score}"><strong>${activeProject.score}</strong></div>
                <div class="score-copy">
                  <strong>Launch readiness</strong>
                  <span>${activeProject.channels.length} channels matched</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside class="panel">
          <div class="panel-header">
            <div class="panel-title">${icon("crosshair")}<h2>Next actions</h2></div>
            <span class="mode-badge mode-api">${reviewCount} pending</span>
          </div>
          ${renderTodoList(activeProject)}
        </aside>
      </section>

      <section class="section-grid">
        <article class="panel">
          <div class="panel-header">
            <div class="panel-title">${icon("radio-tower")}<h2>High-fit channels</h2></div>
            <button class="text-button" type="button" data-view="channels">
              Browse channel library ${icon("arrow-right")}
            </button>
          </div>
          <div class="channel-list">
            ${recommendedChannels.map((channel) => renderChannelRow(channel)).join("")}
          </div>
        </article>
        <article class="panel">
          <div class="panel-header">
            <div class="panel-title">${icon("list-checks")}<h2>Publishing queue</h2></div>
            <button class="text-button" type="button" data-view="queue">
              View full queue ${icon("arrow-right")}
            </button>
          </div>
          ${renderCompactQueue()}
        </article>
      </section>

      <section class="signal-strip">
        <span class="signal-icon">${icon("radar")}</span>
        <div class="signal-copy">
          <strong>Rita found 3 actions that could improve the launch</strong>
          <span>The GitHub and Hugging Face versions of ${escapeHTML(activeProject.name)} can share the same demo assets. Product Hunt should launch 48 hours later.</span>
        </div>
        <button class="signal-link" type="button" data-view="channels">
          Review recommendations ${icon("arrow-up-right")}
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
    <div class="distribution-graph" role="img" aria-label="Channel coverage for ${escapeAttribute(project.name)}">
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
      title: `Review the ${getChannel(pending.channelId)?.name} draft`,
      detail: "Check the value proposition, links, and publishing rules",
      time: "Today",
      action: "review",
      id: pending.id,
    },
    ready && {
      iconName: "calendar-clock",
      variant: "",
      title: `Schedule ${getChannel(ready.channelId)?.name}`,
      detail: "The draft is ready for a publishing window",
      time: "This week",
      action: "schedule",
      id: ready.id,
    },
    scheduled && {
      iconName: "circle-check",
      variant: "green",
      title: `${getChannel(scheduled.channelId)?.name} is scheduled`,
      detail: formatDateTime(scheduled.scheduledAt),
      time: "Scheduled",
      action: "queue",
      id: scheduled.id,
    },
    {
      iconName: "plus",
      variant: "",
      title: "Add another channel draft",
      detail: "Create channel-native copy for the next high-fit channel",
      time: "Suggested",
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
                  ? `<button class="text-button" type="button" data-view="studio">Generate ${icon("arrow-right")}</button>`
                  : `<button class="text-button" type="button" data-view="queue">Open queue ${icon("arrow-right")}</button>`
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
      <div class="fit-meter" aria-label="Match score ${channel.fit}">
        <span>${channel.fit}</span>
        <div class="fit-meter-track"><i style="width:${channel.fit}%"></i></div>
      </div>
      <button class="button button--small ${alreadyQueued ? "button--quiet" : "button--secondary"}" type="button" data-add-channel="${channel.id}" ${alreadyQueued ? "disabled" : ""}>
        ${alreadyQueued ? icon("check") + " Added" : icon("plus") + " Add"}
      </button>
    </div>
  `;
}

function renderCompactQueue() {
  const items = state.queue.filter((item) => item.status !== "published").slice(0, 4);
  if (!items.length) {
    return `<div class="queue-empty">The publishing queue is clear.</div>`;
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
                <strong>${escapeHTML(asset?.title || "Untitled content")}</strong>
                <span>${escapeHTML(project?.name || "Unknown project")} · ${escapeHTML(channel?.name || "Channel")}</span>
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
  const filters = ["All", "Publishing", "Not published"];
  const projects = state.projects.filter((project) => {
    if (projectFilter === "All") return true;
    return getProjectWorkflowState(project.id) === projectFilter;
  });

  appContent.innerHTML = `
    ${viewHeader(
      "PROJECT PORTFOLIO",
      "Projects",
      "Each project has its own positioning, target audience, and channel mix.",
      `${state.projects.length} projects under management`,
    )}
    <div class="toolbar">
      <div class="filter-group" aria-label="Filter projects by status">
        ${filters
          .map(
            (filter) =>
              `<button class="filter-button ${projectFilter === filter ? "is-active" : ""}" type="button" data-project-filter="${filter}" aria-pressed="${projectFilter === filter}">${filter}</button>`,
          )
          .join("")}
      </div>
      <button class="button button--primary" type="button" data-open-intake>${icon("plus")} Add project</button>
    </div>
    <section class="projects-grid">
      ${
        projects.length
          ? projects.map(renderProjectCard).join("")
          : `
            <div class="empty-state projects-empty">
              <span class="empty-state-icon">${icon("list-filter")}</span>
              <h2>No projects match this filter</h2>
              <p>Show all projects or add another software, model, or open-source project.</p>
              <button class="button button--secondary" type="button" data-project-filter="All">${icon("rotate-ccw")} Clear filter</button>
            </div>
          `
      }
      ${
        projectFilter === "All"
          ? `
            <button class="empty-state" type="button" data-open-intake style="cursor:pointer;min-height:300px">
              <span class="empty-state-icon">${icon("circle-plus")}</span>
              <h2>Add your next project</h2>
              <p>Start with a link and a one-line value proposition. Rita will handle positioning and channel matching.</p>
              <span class="button button--secondary">${icon("link-2")} Add project link</span>
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
    ? "Publishing"
    : "Not published";
}

function renderProjectCard(project) {
  const assets = getProjectAssets(project.id);
  const channels = project.channels.map(getChannel).filter(Boolean);
  return `
    <article class="project-card">
      <div class="project-visual" style="--project-color:${project.color}">
        <canvas data-project-canvas="${project.id}" aria-label="${escapeAttribute(project.name)} project cover"></canvas>
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
            <span>Ready</span>
          </div>
        </div>
        <div class="project-card-footer">
          <div class="channel-stack" aria-label="${channels.length} channels">
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
            ${assets.length} content assets · View ${icon("arrow-right")}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderChannels() {
  const categories = ["All", "Models & Agents", "Developer communities", "Launch directories", "Community channels"];
  const filtered = channelCatalog.filter((channel) => {
    const categoryMatch = channelFilter === "All" || channel.group === channelFilter;
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
      "Channel library",
      "Do not broadcast the same copy everywhere. Find channels where audience, format, and publishing rules genuinely match.",
      `${channelCatalog.length} channels · 8 API-ready`,
    )}
    <div class="toolbar">
      <div class="filter-group" aria-label="Channel categories">
        ${categories
          .map(
            (category) =>
              `<button class="filter-button ${channelFilter === category ? "is-active" : ""}" type="button" data-channel-filter="${escapeAttribute(category)}">${escapeHTML(category)}</button>`,
          )
          .join("")}
      </div>
      <label class="inline-search">
        ${icon("search")}
        <input id="channel-search" type="search" placeholder="Search channels or audiences" value="${escapeAttribute(channelQuery)}" />
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
        <span class="channel-card-score">Current project fit <strong>${getProjectChannelFit(activeProjectId, channel)}</strong></span>
        <button class="button button--small ${isQueued ? "button--quiet" : "button--secondary"}" type="button" data-add-channel="${channel.id}" ${isQueued ? "disabled" : ""}>
          ${isQueued ? icon("check") + " Added" : icon("plus") + " Generate draft"}
        </button>
      </div>
    </article>
  `;
}

function renderChannelEmptyState() {
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${icon("search-x")}</span>
      <h2>No matching channels</h2>
      <p>Try another category or keyword. The channel library will keep tracking new model platforms, directories, and developer communities.</p>
      <button class="button button--secondary" type="button" data-channel-filter="All">Clear filters</button>
    </div>
  `;
}

function renderDiscovery() {
  const project = getProject(activeProjectId) || state.projects[0];
  if (!project) {
    appContent.innerHTML = `
      ${viewHeader("AI DISCOVERY", "AI search discovery", "Add a project to build a discoverability profile for AI search and answer systems.")}
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
      "AI search discovery",
      "Help AI systems find, understand, and cite your project when users search for relevant software, open-source projects, or models.",
      "Discoverability simulation. This does not represent the actual ranking of any AI product.",
    )}

    <div class="discovery-toolbar">
      <label class="field discovery-project-field">
        <span>Project being optimized</span>
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
          ${icon("file-question")} Add question content
        </button>
        <button class="button button--primary" type="button" data-generate-discovery>
          ${icon(profile.hasPackage ? "refresh-cw" : "braces")} ${profile.hasPackage ? "Regenerate discovery package" : "Generate AI discovery package"}
        </button>
      </div>
    </div>

    <section class="discovery-overview-grid">
      <article class="panel discovery-score-panel">
        <div class="panel-header">
          <div class="panel-title">${icon("gauge")}<h2>AI discoverability</h2></div>
          <span class="mode-badge ${profile.score >= 82 ? "mode-api" : "mode-assisted"}">${profile.score >= 82 ? "Strong foundation" : "More facts needed"}</span>
        </div>
        <div class="discovery-score-content">
          <div class="discovery-score-ring" style="--discovery-score:${profile.score}">
            <strong>${profile.score}</strong>
            <span>/ 100</span>
          </div>
          <div class="discovery-score-copy">
            <h3>Machine-readable foundation for ${escapeHTML(project.name)}</h3>
            <p>AI systems evaluate relevance using project pages, repositories, model cards, third-party citations, and explicit answers to user questions.</p>
          </div>
        </div>
        <div class="discovery-check-list">
          ${profile.checks.map(renderDiscoveryCheck).join("")}
        </div>
      </article>

      <article class="panel discovery-probe-panel">
        <div class="panel-header">
          <div class="panel-title">${icon("scan-search")}<h2>Search question simulation</h2></div>
          <span class="discovery-panel-caption">Rule-based simulation</span>
        </div>
        <div class="discovery-probe-body">
          <p class="discovery-probe-intro">Enter a selection question an AI user might ask, then see whether the project facts are strong enough to enter a candidate answer.</p>
          <form class="discovery-probe-form" data-discovery-probe-form>
            <label class="discovery-probe-input" for="discovery-query-input">
              ${icon("search")}
              <input
                id="discovery-query-input"
                type="search"
                value="${escapeAttribute(discoveryQuery)}"
                placeholder="Example: Which open-source knowledge bases work well for remote teams?"
                autocomplete="off"
              />
            </label>
            <button class="button button--primary" type="submit">${icon("sparkles")} Evaluate</button>
          </form>
          <div class="discovery-query-chips" aria-label="Example search questions">
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
                    <strong>Start with a real user question</strong>
                    <p>The system checks whether the project name, type, audience, and use cases map clearly to the question.</p>
                  </div>
                </div>
              `
          }
          <p class="discovery-disclaimer">${icon("info")} Simulation results help improve public content and factual structure. They do not represent actual rankings in any AI product.</p>
        </div>
      </article>
    </section>

    <section class="discovery-content-grid">
      <article class="panel">
        <div class="panel-header">
          <div class="panel-title">${icon("messages-square")}<h2>Search questions worth covering</h2></div>
          <span class="discovery-panel-caption">Select to simulate</span>
        </div>
        <div class="discovery-opportunity-list">
          ${queries.map((query, index) => renderDiscoveryQuery(query, index)).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div class="panel-title">${icon("list-checks")}<h2>Improve citation readiness</h2></div>
          <span class="discovery-panel-caption">${actions.length} actions</span>
        </div>
        <div class="discovery-action-list">
          ${actions.map(renderDiscoveryAction).join("")}
        </div>
      </article>
    </section>

    <section class="panel discovery-package-panel">
      <div class="panel-header">
        <div class="panel-title">${icon("file-code-2")}<h2>AI-readable project index package</h2></div>
        <div class="discovery-package-actions">
          ${
            packageContent
              ? `<span class="discovery-generated-at">Generated ${escapeHTML(formatDateTime(packageGeneratedAt))}</span>
                 <button class="button button--secondary button--small" type="button" data-copy-discovery>${icon("copy")} Copy package</button>`
              : `<button class="button button--secondary button--small" type="button" data-generate-discovery>${icon("braces")} Start generating</button>`
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
                <h3>Create a stable machine-readable project fact card</h3>
                <p>The package combines the canonical URL, positioning, target audience, release stage, relevant questions, and JSON-LD structured data.</p>
              </div>
              <button class="button button--primary" type="button" data-generate-discovery>${icon("bring-to-front")} Generate package</button>
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
        <span class="discovery-result-kicker">Question-to-fact match score</span>
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
  const label = query.fit >= 85 ? "Strong match" : query.fit >= 72 ? "Can cover" : "Facts needed";
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
      label: "Canonical project URL",
      detail: "Provide one trusted source for AI and search systems",
      done: Boolean(project.url),
    },
    {
      id: "positioning",
      label: "One-line positioning",
      detail: "State who the project serves and what problem it solves",
      done: project.tagline.length >= 18,
    },
    {
      id: "audience",
      label: "Clear target audience",
      detail: "Connect selection questions to the people the project serves",
      done: Boolean(project.audience),
    },
    {
      id: "content",
      label: "At least two question-focused assets",
      detail: "Cover use cases, common questions, or comparisons",
      done: assets.length >= 2,
    },
    {
      id: "sources",
      label: "Public facts across multiple sources",
      detail: "Cross-reference the repository, model card, or directories",
      done: project.channels.length >= 3,
    },
    {
      id: "freshness",
      label: "Recent update signal",
      detail: "Publish or update within 90 days to avoid stale facts",
      done: isFresh,
    },
    {
      id: "machine",
      label: "AI-readable discovery package",
      detail: "Provide an llms.txt-style fact card and JSON-LD",
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
  const audience = String(project.audience || "target users")
    .split(/[,/]/)
    .map((item) => item.trim())
    .find(Boolean) || "target users";
  const packageBonus = project.discoveryPackage?.content ? 4 : 0;
  return [
    {
      text: `What is ${project.name}, and who is it for?`,
      intent: "Brand and entity understanding",
      detail: "Requires a project page and consistent description",
      fit: 94,
    },
    {
      text: `Which ${project.type} options are best for ${audience}?`,
      intent: "Selection recommendation",
      detail: "Requires a clear audience and category",
      fit: 87 + packageBonus,
    },
    {
      text: `Which tools can achieve this: ${project.tagline.replace(/[.!]+$/, "")}?`,
      intent: "Problem solving",
      detail: "Requires use-case FAQs and examples",
      fit: 79 + packageBonus,
    },
    {
      text: `What alternatives exist to ${project.name}, and how does it compare?`,
      intent: "Comparison decision",
      detail: "Requires public comparisons and limitation notes",
      fit: 63 + packageBonus,
    },
    {
      text: `Which ${project.type} projects are worth watching in 2026?`,
      intent: "Timely discovery",
      detail: "Requires version, update dates, and external citations",
      fit: project.score >= 88 ? 74 + packageBonus : 67 + packageBonus,
    },
  ];
}

function getDiscoveryActions(project, profile) {
  const actions = [];
  if (!profile.hasPackage) {
    actions.push({
      icon: "braces",
      title: "Generate a machine-readable project fact card",
      detail: "Combine the canonical URL, positioning, audience, and relevant questions into one discovery package.",
      buttonLabel: "Generate",
      generate: true,
    });
  } else {
    actions.push({
      icon: "copy",
      title: "Sync the package to the project page",
      detail: "Publish it in the README, model card, or website, and keep the canonical URL consistent.",
      buttonLabel: "Copy",
      copy: true,
    });
  }
  actions.push({
    icon: "git-compare-arrows",
    title: "Add selection comparisons and alternatives",
    detail: "Cover high-intent questions such as how it differs from similar tools and when it should not be used.",
    buttonLabel: "Add",
    view: "studio",
  });
  actions.push({
    icon: "badge-check",
    title: "Create citable evidence sections",
    detail:
      /model/i.test(project.type)
        ? "Publish evaluation methods, capability boundaries, hardware requirements, and reproducible examples so AI does not infer unknown parameters."
        : "Publish real use cases, limitations, installation steps, and reproducible results so AI can cite them accurately.",
    buttonLabel: "Prepare",
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
    showToast("Enter a search question", "Example: Which open-source agent frameworks work well for distributed product teams?");
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
    "Agent",
    "Model",
    "Open source",
    "Developer",
    "Engineer",
    "Researcher",
    "Team",
    "Enterprise",
    "Product manager",
    "Creator",
    "Workflow",
    "Knowledge base",
    "Meeting",
    "Multimodal",
    "Edge",
    "Tool",
    "Software",
    "Framework",
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
  if (/recommend|which|best|suitable|find|looking for|choose/i.test(query)) score += 4;
  const asksComparison = /compare|alternative|difference|versus|\bvs\b|better/i.test(normalized);
  const asksEvidence = /benchmark|accuracy|result|performance|license|pricing|cost/i.test(normalized);
  if (asksComparison) score -= 5;
  if (asksEvidence) score -= 4;
  score = Math.max(42, Math.min(97, score));

  const tone = score >= 82 ? "strong" : score >= 68 ? "medium" : "weak";
  const label =
    score >= 82
      ? "Strong enough for a candidate answer"
      : score >= 68
        ? "Understandable, but the evidence is incomplete"
        : "Weak connection to the currently public facts";
  const reason = matched.length
    ? `The query matches project facts from ${matched.slice(0, 4).join(", ")}, making it easier for AI to connect the search intent with ${project.name}.`
    : `The query does not yet match ${project.name}'s category, audience, or use-case terms. Publish clearer public content to establish that connection.`;
  const nextStep = asksComparison
    ? "Add a comparison page and clearly state when the project is and is not a good fit."
    : asksEvidence
      ? "Publish reproducible benchmark, performance, or cost evidence at a stable URL."
      : profile.hasPackage
        ? "Keep the discovery package, project page, and release date consistent, and seek third-party citations."
        : "Generate an AI-readable discovery package, then publish it on the project page and model card.";

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
    "AI discovery package generated",
    Number.isFinite(remaining)
      ? `Includes a project fact card, search questions, and JSON-LD. ${formatUsageLimit(remaining)} package credits remain this month.`
      : "Includes a project fact card, search questions, and JSON-LD structured data.",
  );
}

function copyDiscoveryPackage() {
  const project = getProject(activeProjectId) || state.projects[0];
  if (!project) return;
  if (!project.discoveryPackage?.content) {
    showToast("No AI discovery package yet", "Generate a package before copying it to the project page or model card.");
    return;
  }
  copyToClipboard(project.discoveryPackage.content, "AI discovery package copied");
}

function buildDiscoveryPackage(project) {
  const generatedAt = new Date();
  const generatedDate = generatedAt.toISOString().slice(0, 10);
  const schemaType = /open[- ]source/i.test(project.type) ? "SoftwareSourceCode" : "SoftwareApplication";
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: project.name,
    description: `${project.tagline} Intended for ${project.audience}.`,
    url: project.url,
    applicationCategory: project.type,
    audience: {
      "@type": "Audience",
      audienceType: project.audience,
    },
    dateModified: generatedDate,
    keywords: [project.type, ...project.audience.split(/[,/]/).map((item) => item.trim()).filter(Boolean)],
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
      ${viewHeader("CONTENT STUDIO", "Content Studio", "Connect a project to generate channel-ready versions.")}
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
      "Content Studio",
      "Turn one source of truth into channel-specific narratives, formats, and calls to action.",
      `${getProjectChannelFit(project.id, getChannel("github"))}% technical channel fit`,
    )}
    <section class="studio-layout">
      <aside class="panel studio-controls">
        <div class="control-section">
          <label class="control-label">Publishing project <span>${escapeHTML(project.type)}</span></label>
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
          <div class="control-label">Target channels <span id="selected-channel-count">${studioSettings.channels.length} selected</span></div>
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
          <div class="control-label">Tone</div>
          <div class="segmented" style="display:flex;width:100%">
            ${["Technical", "Concise", "Story-driven"]
              .map(
                (tone) =>
                  `<button class="segment-button ${studioSettings.tone === tone ? "is-active" : ""}" type="button" data-setting="tone" data-value="${tone}">${tone}</button>`,
              )
              .join("")}
          </div>
        </div>
        <div class="control-section">
          <label class="control-label">Publishing goal</label>
          <select class="control-select" data-studio-select="goal">
            ${["Launch", "Acquire early users", "Find open-source contributors", "Product update"]
              .map(
                (goal) =>
                  `<option ${studioSettings.goal === goal ? "selected" : ""}>${goal}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="studio-quota">
          <span>${icon("gauge")} ${escapeHTML(formatUsageLimit(contentRemaining))} left this month</span>
          <button class="text-button" type="button" data-open-billing="content">View usage ${icon("arrow-up-right")}</button>
        </div>
        <button class="button button--primary generate-button" type="button" data-generate>
          ${icon("sparkles")} Generate ${studioSettings.channels.length} channel versions
        </button>
        <p class="studio-quota-note">This will use ${studioSettings.channels.length} content credits. Failed generations are not charged.</p>
      </aside>
      <section class="studio-main">
        ${
          displayAssets.length
            ? `
              <div class="asset-heading">
                <div>
                  <h2>${generatedForProject.length ? "New content pack" : "Existing content assets"}</h2>
                  <p>${generatedForProject.length ? "Each version is formatted for its channel and remains available for manual editing." : `${displayAssets.length} versions, including ${displayAssets.filter((a) => a.status === "review").length} awaiting review.`}</p>
                </div>
                <button class="button button--secondary button--small" type="button" data-view="queue">
                  ${icon("send")} Open queue
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
                <h2>Prepare a channel content pack</h2>
                <p>Select channels on the left to generate review- and edit-ready versions.</p>
                <button class="button button--primary" type="button" data-generate style="margin-top:16px">
                  ${icon("wand-sparkles")} Generate first draft
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
  if (count) count.textContent = `${studioSettings.channels.length} selected`;
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
            <strong>${escapeHTML(channel?.name || "Unknown channel")}</strong>
            <span>${escapeHTML(channel?.channelFormat || "Channel content")}</span>
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
        <span class="asset-count">${asset.body.length} characters · ${statusLabel(asset.status)}</span>
        <div class="asset-actions">
          <button class="button button--quiet button--small" type="button" data-open-asset="${asset.id}" title="Edit content">${icon("pencil")}</button>
          <button class="button button--secondary button--small" type="button" data-queue-asset="${asset.id}" ${isQueued ? "disabled" : ""}>
            ${isQueued ? icon("check") + " Added" : icon("plus") + " Add to queue"}
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
  const filters = ["All", "Pending", "Ready", "Scheduled", "Published"];
  const filteredItems = allItems.filter((item) => {
    if (queueFilter === "All") return true;
    return statusLabel(item.status) === queueFilter;
  });

  appContent.innerHTML = `
    ${viewHeader(
      "PUBLISH QUEUE",
      "Publishing Queue",
      "Rita prepares the content while you keep the final publishing decision. Every external action has a clear current state.",
      "All times are shown in Asia/Shanghai",
    )}
    <section class="queue-summary">
      ${queueSummaryItem("eye", "Pending", stats.review, "amber")}
      ${queueSummaryItem("circle-check-big", "Ready", stats.ready, "")}
      ${queueSummaryItem("calendar-clock", "Scheduled", stats.scheduled, "violet")}
      ${queueSummaryItem("badge-check", "Published", stats.published, "green")}
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
      <button class="button button--secondary" type="button" data-view="studio">${icon("plus")} Generate content</button>
    </div>
    <section class="panel data-panel">
      ${
        filteredItems.length
          ? `
            <table class="data-table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Project</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Scheduled time</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredItems.map(renderQueueRow).join("")}
              </tbody>
            </table>
          `
          : `<div class="queue-empty">No content matches the current filter.</div>`
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
          <button class="icon-button" type="button" data-open-asset="${asset?.id}" style="width:30px;height:30px" aria-label="Preview content">
            ${icon("file-text")}
          </button>
          <div style="min-width:0">
            <strong style="display:block;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px">${escapeHTML(asset?.title || "Untitled content")}</strong>
            <span class="table-muted" style="display:block;margin-top:2px;font-size:8px">${asset?.body.length || 0} characters</span>
          </div>
        </div>
      </td>
      <td>
        <div class="queue-project">
          <span class="project-monogram" style="--project-color:${project?.color || "#205fd7"}">${escapeHTML(project ? initials(project.name) : "?")}</span>
          <span>${escapeHTML(project?.name || "Unknown project")}</span>
        </div>
      </td>
      <td>
        <div class="table-channel" style="min-width:110px">
          <span class="channel-mark" style="--channel-color:${channel?.color};--channel-bg:${channel?.bg}">${escapeHTML(channel ? channelShort(channel) : "?")}</span>
          <strong>${escapeHTML(channel?.name || "Unknown channel")}</strong>
        </div>
      </td>
      <td>${statusBadge(item.status)}</td>
      <td class="table-muted">${item.scheduledAt ? formatDateTime(item.scheduledAt) : "Not scheduled"}</td>
      <td>
        <div class="queue-actions">
          ${
            item.status === "review"
              ? `<button class="button button--success button--small" type="button" data-approve-queue="${item.id}">${icon("check")} Approve</button>`
              : ""
          }
          ${
            item.status === "ready"
              ? `<button class="button button--secondary button--small" type="button" data-approve-queue="${item.id}">${icon("calendar-clock")} Schedule</button>`
              : ""
          }
          ${
            item.status === "scheduled"
              ? `<button class="button button--secondary button--small" type="button" data-mark-published="${item.id}">${icon("external-link")} Mark as published</button>`
              : ""
          }
          <button class="icon-button" type="button" data-remove-queue="${item.id}" style="width:30px;height:30px" title="Remove" aria-label="Remove from queue">${icon("trash-2")}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderEmptyProjects() {
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${icon("package-open")}</span>
      <h2>Connect your first project</h2>
      <p>Start a distribution plan from a single value proposition, whether you are publishing software, a model, or an open-source project.</p>
      <button class="button button--primary" type="button" data-open-intake>${icon("plus")} Connect project</button>
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
    type: String(formData.get("type") || "AI app"),
    stage: String(formData.get("stage") || "Beta"),
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
    "Project connected",
    `${project.name} generated ${starterAssets.length} starter assets and used the corresponding content credits for this month`,
  );
}

function createAnalyzedProject(input) {
  const channelIds = chooseChannelsForProject(input);
  const scoreBase = /model/i.test(input.type) ? 88 : /open.source/i.test(input.type) ? 86 : 81;
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
  if (/model|multimodal|llm|foundation/.test(text)) base.push("huggingface", "modelscope", "zhihu");
  else base.push("producthunt", "v2ex", "futurepedia");
  if (/agent|bot|workflow|automation/.test(text)) base.push("coze", "poe", "dify");
  if (/creator|consumer|social|community/.test(text)) base.push("jike", "xiaohongshu");
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
      <button class="icon-button detail-close" type="button" data-close-modal aria-label="Close">${icon("x")}</button>
      <div class="detail-hero-content">
        <div>
          <span class="eyebrow" style="color:rgba(255,255,255,.7)">${escapeHTML(project.type)} · ${escapeHTML(project.stage)}</span>
          <h2 id="detail-modal-title">${escapeHTML(project.name)}</h2>
          <p>${escapeHTML(project.tagline)}</p>
        </div>
        <div class="detail-score">
          <strong>${project.score}</strong>
          <span>Publishing readiness</span>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-stats">
        <div class="detail-stat"><span>Target audience</span><strong style="font-size:10px">${escapeHTML(project.audience)}</strong></div>
        <div class="detail-stat"><span>Channel mix</span><strong>${project.channels.length}</strong></div>
        <div class="detail-stat"><span>Content assets</span><strong>${assets.length}</strong></div>
      </div>
      <div class="detail-section-title">
        <h3>Recommended publishing order</h3>
        <span>Ranked by fit for this project</span>
      </div>
      <div class="detail-channel-list">
        ${channels.map((channel) => renderDetailChannel(project, channel)).join("")}
      </div>
      <div class="detail-footer">
        <a href="${escapeAttribute(project.url)}" target="_blank" rel="noreferrer">${icon("link-2")} ${escapeHTML(project.url)}</a>
        <div class="detail-footer-actions">
          <button class="button button--secondary" type="button" data-add-channel="${channels[0]?.id || "github"}">${icon("plus")} Generate content</button>
          <button class="button button--primary" type="button" data-view="studio">${icon("wand-sparkles")} Open Content Studio</button>
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
          <strong id="asset-modal-title">${escapeHTML(channel?.name || "Channel content")}</strong>
          <span>${escapeHTML(project?.name || "Unknown project")} · ${escapeHTML(channel?.channelFormat || "")}</span>
        </div>
      </div>
      <button class="icon-button" type="button" data-close-modal aria-label="Close">${icon("x")}</button>
    </div>
    <form class="asset-editor" id="asset-edit-form">
      <label class="field">
        <span>Title</span>
        <input id="asset-title-input" name="title" value="${escapeAttribute(asset.title)}" maxlength="120" />
      </label>
      <label class="field">
        <span>Body</span>
        <textarea id="asset-content-input" name="body">${escapeHTML(asset.body)}</textarea>
      </label>
      <div class="asset-editor-meta">
        <span id="asset-character-count">${asset.body.length} characters</span>
        <span>${channel?.mode === "api" ? "API available; account authorization is still required" : channel?.mode === "assisted" ? "Browser-assisted confirmation is required when publishing" : "Manual submission on the platform is required"}</span>
      </div>
      <div class="asset-editor-actions">
        <button class="button button--quiet" type="button" data-close-modal>Cancel</button>
        <button class="button button--secondary" type="button" id="copy-asset-body-button">${icon("copy")} Copy body</button>
        <button class="button button--primary" type="submit" data-save-asset="${asset.id}">${icon("save")} Save content</button>
      </div>
    </form>
  `;
  const form = assetModalContent.querySelector("#asset-edit-form");
  assetModalContent.querySelector("#copy-asset-body-button").addEventListener("click", () => {
    copyToClipboard(assetModalContent.querySelector("#asset-content-input").value, "Content copied");
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
  showToast("Content saved", "Drafts and the publishing queue will use this version");
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
  showToast("Added to Content Studio", `${channel.name} will receive a dedicated channel version`);
}

function generateContentPack() {
  const project = getProject(studioSettings.projectId);
  if (!project) return;
  const selectedChannels = [...new Set(studioSettings.channels)].map(getChannel).filter(Boolean);
  if (!selectedChannels.length) {
    showToast("Select a channel", "Choose at least one target channel before generating content");
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
  showToast(`Generated ${generatedAssets.length} versions`, "Content was adapted to each channel format and is awaiting queue review");
}

function buildChannelContent(project, channel, tone) {
  const audience = project.audience || "the target audience";
  const name = project.name;
  const tagline = project.tagline.replace(/[.!]+$/, "");
  const tonePrefix =
    tone === "Concise"
      ? "The short version:"
      : tone === "Story-driven"
        ? "We spent a long time working through one specific problem."
        : "We approached this as an engineering problem:";
  const templates = {
    github: {
      title: `${name} launch: ${tagline}`,
      body: `${name} is now available.\n\n${tagline}.\n\nThis release focuses on making the project practical for ${audience}: clear setup, reproducible examples, and operational guardrails from day one. The repository includes quickstart paths, architecture notes, and examples that mirror real production constraints.\n\nWhat is included:\n- A focused core with a small, inspectable API\n- End-to-end examples and benchmark notes\n- Troubleshooting guidance for common deployment paths\n\nIf your team is working on this problem, try the quickstart and share a reproducible issue or use case.`,
      tags: ["open-source", project.type.replace(/\s+/g, "-").toLowerCase()],
    },
    huggingface: {
      title: `${name} · ${tagline}`,
      body: `${name} is designed for ${audience}. Its core goal is to ${tagline}.\n\n${tonePrefix} ${/foundation model/i.test(project.type) ? "This release includes a model card, inference examples, capability boundaries, and evaluation notes." : "This release provides runnable examples, deployment guidance, and clear capability boundaries."} Evaluate it against representative business samples before production use.\n\nIt is suited to prototyping, internal workflow validation, and AI products that need a fast integration path. Share reproducible issues, benchmark results, and integration scenarios in the discussion area.`,
      tags: ["ai", "open-source", shortSlug(project.type)],
    },
    modelscope: {
      title: `${name}: a ${project.type} for ${audience}`,
      body: `PROJECT OVERVIEW\n${name} delivers one core value: ${tagline}.\n\nWHO IT IS FOR\n${audience}.\n\nTHIS RELEASE\nA quick trial path, key capability notes, and deployment guidance are included. The project prioritizes usefulness in real workflows rather than a single polished demo.\n\nNEXT STEP\nStart with the examples, then use your own data to evaluate quality, latency, and resource usage. If you encounter a reproducible issue, include environment details in your report.`,
      tags: ["model", "ai", shortSlug(project.type)],
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
      title: `Sharing ${name}, a ${project.type} we built`,
      body: `We recently worked through a specific problem for ${audience} and built ${name}.\n\nOne-line summary: ${tagline}.\n\nOur priority for this release was making it useful inside real workflows, so we focused first on examples, explicit boundaries, and useful diagnostics when something fails. It is not positioned as a one-click solution for every problem; it is better suited to validation within a clearly defined scenario.\n\nFeedback on usability, the technical approach, and deployment cost is welcome.`,
      tags: ["show-and-tell"],
    },
    poe: {
      title: `${name} | ${tagline}`,
      body: `Hello, I am ${name}.\n\nI help ${audience} complete tasks related to "${tagline}."\n\nSuggested workflow: provide your goal, existing materials, and constraints to receive a structured result. If you need changes, tell me which direction you prefer. The current version is best suited to well-defined tasks and rapid iteration.`,
      tags: [],
    },
    coze: {
      title: `${name} · ${project.type} experience`,
      body: `Use ${name} to turn "${tagline}" into a repeatable workflow.\n\nBuilt for ${audience}. After starting a conversation, describe your goal and current materials, and the agent will analyze, organize, and produce the output step by step. When business data is required, replace the relevant workflow node with your own integration.`,
      tags: [],
    },
    dify: {
      title: `${name}: ${tagline}`,
      body: `${name} is a ${project.type} template and plugin for ${audience}.\n\nIt separates input validation, core processing, and output checks into observable nodes, making it easier for teams to replace models, connect knowledge bases, or add human review. Validate inputs and outputs in a test workspace before deploying to production.`,
      tags: [],
    },
    zhihu: {
      title: `How do you solve this problem for ${audience}? We built ${name}`,
      body: `Before discussing ${name}, it helps to state the problem clearly: ${tagline}.\n\nThe weakness in many comparable tools is not the demo; it is the boundaries. Real workflows need answers about incomplete input, reproducible failures, and explainable cost. We prioritized those questions in the first release.\n\n${name} is intended for ${audience} to validate a clearly defined scenario. It does not replace business judgment, but it can turn repetitive work into an inspectable process. We will continue to publish our evaluation method and limitations.`,
      tags: [],
    },
    jike: {
      title: `A new tool for ${audience}: ${name}`,
      body: `${tagline}.\n\nOur main goal is to move beyond an impressive-looking demo and make the result genuinely useful in daily workflows. The first release includes examples, limitations, and diagnostics in one place.\n\nIt is ready for validation in a clearly defined scenario. We would also like to hear what you want it to do next.`,
      tags: ["AI", project.type],
    },
    xiaohongshu: {
      title: `A faster workflow for ${audience} | ${name}`,
      body: `We recently tested a new approach: ${tagline}.\n\n${name} works best when you start with one concrete task instead of building a heavy process first. Start with real materials, then use the initial results to decide whether a deeper integration is worthwhile.\n\nIt will not make every judgment for you, but it can shorten the path from an idea to a useful first result.\n\n#AItools #productivity #${project.type.replace(/\s+/g, "")}`,
      tags: ["AI tools", "productivity"],
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
      body: `${tagline}.\n\n${name} gives ${audience} a verifiable, editable path for using this ${project.type}. Explore the project and share your feedback.`,
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
    showToast("Already in the queue", "This content does not need to be added again");
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
  showToast("Added to the publishing queue", "The status is Pending; nothing will be published automatically");
}

function approveQueueItem(queueId) {
  const item = state.queue.find((entry) => entry.id === queueId);
  if (!item) return;
  if (item.status === "review") {
    item.status = "ready";
    const asset = getAsset(item.assetId);
    if (asset) asset.status = item.status;
    showToast("Approved", "The content is ready to schedule; you still need to select a publishing time");
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
        <span>${escapeHTML(project?.name || "Unknown project")} · ${escapeHTML(channel.name)}</span>
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
    showToast("Publishing time unavailable", "Choose a publishing window at least one minute in the future");
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
  showToast("Publishing window scheduled", formatDateTime(item.scheduledAt));
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
  showToast("Manual publication recorded", "The system will not claim that an unauthorized platform action occurred");
}

function removeQueueItem(queueId) {
  state.queue = state.queue.filter((entry) => entry.id !== queueId);
  persist();
  render();
  showToast("Removed from queue", "The original content asset is still available");
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
      title: "Connect a new project",
      subtitle: "Create a project and generate channel recommendations",
      action: () => {
        closeCommand();
        openIntake();
      },
    },
    {
      type: "action",
      icon: "wand-sparkles",
      title: "Generate channel content",
      subtitle: "Open Content Studio",
      action: () => {
        closeCommand();
        switchView("studio");
      },
    },
    {
      type: "action",
      icon: "scan-search",
      title: "Improve AI search discovery",
      subtitle: "Check discoverability, simulate questions, and generate an index pack",
      action: () => {
        closeCommand();
        switchView("discovery");
      },
    },
    {
      type: "action",
      icon: "send",
      title: "View the publishing queue",
      subtitle: "Review and schedule content",
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
    commandResults.innerHTML = `<div class="command-empty">No matching results</div>`;
    return;
  }
  const groups = { action: "Quick actions", project: "Projects", channel: "Channels" };
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
    <button class="toast-close" type="button" aria-label="Dismiss notification">${icon("x")}</button>
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
    .then(() => showToast(successMessage, "You can now paste it into the publishing platform you approved"))
    .catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast(successMessage, "You can now paste it into the publishing platform you approved");
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
  const isModel = /model|multimodal|llm/.test(`${project.type} ${project.tagline}`.toLowerCase());
  const isOpenSource = /open.source|swift|framework|sdk/i.test(`${project.type} ${project.tagline}`);
  const isAgent = /agent|bot|workflow|automation/i.test(`${project.type} ${project.tagline}`);
  if (isModel && ["huggingface", "modelscope", "zhihu"].includes(channel.id)) adjustment += 5;
  if (isOpenSource && ["github", "hackernews", "v2ex"].includes(channel.id)) adjustment += 4;
  if (isAgent && ["coze", "poe", "dify"].includes(channel.id)) adjustment += 4;
  if (/consumer|creator|community|social/i.test(project.audience) && ["modelscope", "v2ex", "jike", "zhihu"].includes(channel.id)) adjustment += 3;
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
      review: "Pending",
      ready: "Ready",
      scheduled: "Scheduled",
      published: "Published",
    }[status] || "Draft"
  );
}

function modeBadge(mode) {
  const modes = {
    api: { className: "mode-api", label: "API access" },
    assisted: { className: "mode-assisted", label: "Browser-assisted" },
    manual: { className: "mode-manual", label: "Manual publishing" },
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
    jike: "J",
    zhihu: "Z",
    futurepedia: "FP",
    theresanaiforthat: "TAA",
    xiaohongshu: "X",
  };
  return overrides[channel.id] || initials(channel.name);
}

function shortChannelName(name) {
  return name.replace("Hugging Face", "HF").replace("Product Hunt", "PH");
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
    .replace(/[^a-z0-9-]/g, "");
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
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
