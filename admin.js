const TOKEN_STORAGE_KEY = "tuoyu-catalog-admin-token";
const authPanel = document.querySelector("#admin-auth-panel");
const authForm = document.querySelector("#admin-auth-form");
const authMessage = document.querySelector("#admin-auth-message");
const tokenInput = document.querySelector("#admin-token-input");
const connectButton = document.querySelector("#admin-connect-button");
const dashboard = document.querySelector("#admin-dashboard");
const logoutButton = document.querySelector("#admin-logout");
const refreshButton = document.querySelector("#admin-refresh");
const searchInput = document.querySelector("#admin-search-input");
const statusFilter = document.querySelector("#admin-status-filter");
const toolList = document.querySelector("#admin-tool-list");
const recordCount = document.querySelector("#admin-record-count");
const listMessage = document.querySelector("#admin-list-message");

const state = {
  token: "",
  tools: [],
  query: "",
  status: "pending",
  busy: false,
};

const statusLabels = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
  paused: "已暂停",
};

const promotionLabels = {
  none: "无推广",
  boost: "加权 +8",
  featured: "重点推广 +15",
};

function refreshIcons() {
  window.lucide?.createIcons({
    attrs: {
      "aria-hidden": "true",
      "stroke-width": 1.8,
    },
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value, includeTime = false) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function showMessage(element, message, type = "info") {
  element.hidden = false;
  element.textContent = message;
  element.dataset.type = type;
}

function hideMessage(element) {
  element.hidden = true;
  element.textContent = "";
  delete element.dataset.type;
}

function getStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function storeToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // A blocked storage API should not prevent an in-memory admin session.
  }
}

async function adminRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${state.token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    lockDashboard("管理员 Token 无效或已失效，请重新连接。");
  }
  if (!response.ok) {
    throw new Error(payload.message || `请求失败（HTTP ${response.status}）`);
  }
  return payload;
}

function lockDashboard(message) {
  state.token = "";
  state.tools = [];
  storeToken("");
  dashboard.hidden = true;
  authPanel.hidden = false;
  logoutButton.hidden = true;
  tokenInput.value = "";
  tokenInput.focus();
  if (message) showMessage(authMessage, message, "error");
  refreshIcons();
}

function updateStats() {
  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    paused: 0,
    promoted: 0,
  };
  for (const tool of state.tools) {
    if (Object.hasOwn(counts, tool.status)) counts[tool.status] += 1;
    if (tool.status === "approved" && tool.promotionActive) counts.promoted += 1;
  }
  document.querySelector("#admin-stat-pending").textContent = String(counts.pending);
  document.querySelector("#admin-stat-approved").textContent = String(counts.approved);
  document.querySelector("#admin-stat-rejected").textContent = String(counts.rejected);
  document.querySelector("#admin-stat-paused").textContent = String(counts.paused);
  document.querySelector("#admin-stat-promoted").textContent = String(counts.promoted);
}

function renderTool(tool) {
  const lastUpdated = tool.lastUpdated ? tool.lastUpdated.slice(0, 10) : "";
  const repoLink = tool.repoUrl
    ? `<a href="${escapeHTML(tool.repoUrl)}" target="_blank" rel="noreferrer">GitHub <i data-lucide="external-link"></i></a>`
    : "";
  const websiteLink = tool.websiteUrl
    ? `<a href="${escapeHTML(tool.websiteUrl)}" target="_blank" rel="noreferrer">官网 <i data-lucide="external-link"></i></a>`
    : "";
  const flags = tool.reviewFlags.length
    ? tool.reviewFlags.map((flag) => `<span>${escapeHTML(flag)}</span>`).join("")
    : "<span>无自动标记</span>";

  return `
    <article class="admin-tool-card">
      <form class="admin-review-form" data-tool-id="${escapeHTML(tool.id)}">
        <div class="admin-tool-head">
          <div>
            <div class="admin-tool-title-line">
              <h3>${escapeHTML(tool.name)}</h3>
              <span class="admin-status-badge" data-status="${escapeHTML(tool.status)}">${escapeHTML(statusLabels[tool.status] || tool.status)}</span>
              ${tool.isSeed ? "<span class=\"admin-seed-badge\">种子记录</span>" : ""}
            </div>
            <span class="admin-tool-category">${escapeHTML(tool.category)}</span>
          </div>
          <div class="admin-tool-links">${repoLink}${websiteLink}</div>
        </div>

        <p class="admin-tool-description">${escapeHTML(tool.description)}</p>

        <div class="admin-review-flags" aria-label="自动审核标记">
          <strong>自动标记</strong>
          ${flags}
        </div>

        <div class="admin-tool-metadata">
          <span>提交：${escapeHTML(formatDate(tool.submittedAt, true))}</span>
          <span>更新：${escapeHTML(formatDate(tool.updatedAt, true))}</span>
          <span>项目 ID：${escapeHTML(tool.id)}</span>
        </div>

        <div class="admin-review-grid">
          <label>
            <span>审核状态</span>
            <select name="status">
              ${Object.entries(statusLabels)
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${tool.status === value ? "selected" : ""}>${label}</option>`,
                )
                .join("")}
            </select>
          </label>
          <label>
            <span>推广等级</span>
            <select name="promotionTier">
              ${Object.entries(promotionLabels)
                .map(
                  ([value, label]) =>
                    `<option value="${value}" ${tool.promotionTier === value ? "selected" : ""}>${label}</option>`,
                )
                .join("")}
            </select>
          </label>
          <label>
            <span>GitHub Stars</span>
            <input name="githubStars" type="number" min="0" max="1000000000" step="1" value="${tool.githubStars ?? ""}" placeholder="核验后填写" />
          </label>
          <label>
            <span>最近更新时间</span>
            <input name="lastUpdated" type="date" value="${escapeHTML(lastUpdated)}" />
          </label>
          <label class="admin-promotion-toggle">
            <input name="promotionActive" type="checkbox" ${tool.promotionActive ? "checked" : ""} />
            <span>启用付费推广加权</span>
          </label>
          <label class="admin-note-field">
            <span>审核备注</span>
            <textarea name="reviewNote" rows="3" maxlength="1000" placeholder="记录链接、许可证、指标或推广核验结果">${escapeHTML(tool.reviewNote)}</textarea>
          </label>
        </div>

        <div class="admin-card-actions">
          <button
            class="admin-delete-button"
            type="button"
            data-action="delete"
            aria-label="永久删除 ${escapeHTML(tool.name)}"
          >
            <i data-lucide="trash-2"></i>
            <span>删除</span>
          </button>
          <span class="admin-save-message" role="status" hidden></span>
          <button class="button button--primary" type="submit">
            <i data-lucide="save"></i>
            <span>保存审核</span>
          </button>
        </div>
      </form>
    </article>
  `;
}

function syncPromotionControls(form) {
  const status = form.elements.status.value;
  const tier = form.elements.promotionTier.value;
  const active = form.elements.promotionActive;
  const approved = status === "approved";
  form.elements.promotionTier.disabled = !approved;
  active.disabled = !approved || tier === "none";
  if (!approved || tier === "none") active.checked = false;
}

function renderTools() {
  updateStats();
  const query = state.query.toLowerCase();
  const visible = state.tools.filter((tool) => {
    if (state.status !== "all" && tool.status !== state.status) return false;
    if (!query) return true;
    return [
      tool.name,
      tool.description,
      tool.category,
      tool.id,
      ...(tool.tags || []),
      ...(tool.useCases || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  recordCount.textContent = `${visible.length} 个项目`;
  if (!visible.length) {
    toolList.innerHTML = `
      <div class="catalog-empty">
        <i data-lucide="inbox"></i>
        <strong>当前筛选没有项目</strong>
        <span>切换状态或清除搜索关键词。</span>
      </div>
    `;
    refreshIcons();
    return;
  }

  toolList.innerHTML = visible.map(renderTool).join("");
  for (const form of toolList.querySelectorAll(".admin-review-form")) {
    syncPromotionControls(form);
  }
  refreshIcons();
}

async function loadTools() {
  if (!state.token || state.busy) return false;
  state.busy = true;
  refreshButton.disabled = true;
  hideMessage(listMessage);
  try {
    const payload = await adminRequest("/api/admin/tools");
    state.tools = payload.tools;
    dashboard.hidden = false;
    authPanel.hidden = true;
    logoutButton.hidden = false;
    renderTools();
    return true;
  } catch (error) {
    if (state.token) showMessage(listMessage, error.message, "error");
    return false;
  } finally {
    state.busy = false;
    refreshButton.disabled = false;
    refreshIcons();
  }
}

async function connect(event) {
  event.preventDefault();
  const token = tokenInput.value.trim();
  if (token.length < 16) {
    showMessage(authMessage, "管理员 Token 至少需要 16 个字符。", "error");
    return;
  }
  state.token = token;
  connectButton.disabled = true;
  hideMessage(authMessage);
  try {
    const connected = await loadTools();
    if (connected && state.token) {
      storeToken(token);
      showMessage(listMessage, "审核数据已载入。", "success");
    }
  } finally {
    connectButton.disabled = false;
  }
}

async function saveReview(form) {
  if (state.busy) return;
  const message = form.querySelector(".admin-save-message");
  const button = form.querySelector('button[type="submit"]');
  const id = form.dataset.toolId;
  const githubStarsValue = form.elements.githubStars.value.trim();
  const body = {
    status: form.elements.status.value,
    promotionTier: form.elements.promotionTier.value,
    promotionActive: form.elements.promotionActive.checked,
    reviewNote: form.elements.reviewNote.value.trim(),
    githubStars: githubStarsValue ? Number(githubStarsValue) : null,
    lastUpdated: form.elements.lastUpdated.value
      ? `${form.elements.lastUpdated.value}T00:00:00.000Z`
      : null,
  };

  state.busy = true;
  button.disabled = true;
  hideMessage(message);
  try {
    const payload = await adminRequest(`/api/admin/tools/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    state.tools = state.tools.map((tool) => (tool.id === id ? payload.tool : tool));
    renderTools();
    showMessage(listMessage, `“${payload.tool.name}”的审核信息已保存。`, "success");
  } catch (error) {
    if (state.token) showMessage(message, error.message, "error");
  } finally {
    state.busy = false;
    if (document.body.contains(form)) button.disabled = false;
    refreshIcons();
  }
}

async function deleteTool(button) {
  if (state.busy) return;
  const form = button.closest(".admin-review-form");
  if (!form) return;
  const id = form.dataset.toolId;
  const tool = state.tools.find((item) => item.id === id);
  const name = tool?.name || id;
  if (
    !window.confirm(
      `确定永久删除“${name}”？该项目的审核记录、推广状态和目录数据都会被删除，且无法撤销。`,
    )
  ) {
    return;
  }

  const message = form.querySelector(".admin-save-message");
  const saveButton = form.querySelector('button[type="submit"]');
  state.busy = true;
  button.disabled = true;
  saveButton.disabled = true;
  hideMessage(message);
  try {
    await adminRequest(`/api/admin/tools/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    state.tools = state.tools.filter((item) => item.id !== id);
    renderTools();
    showMessage(listMessage, `“${name}”已从目录中永久删除。`, "success");
  } catch (error) {
    if (state.token) showMessage(message, error.message, "error");
  } finally {
    state.busy = false;
    if (document.body.contains(form)) {
      button.disabled = false;
      saveButton.disabled = false;
    }
    refreshIcons();
  }
}

authForm.addEventListener("submit", connect);
logoutButton.addEventListener("click", () => lockDashboard());
refreshButton.addEventListener("click", loadTools);
searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  renderTools();
});
statusFilter.addEventListener("change", () => {
  state.status = statusFilter.value;
  renderTools();
});
toolList.addEventListener("change", (event) => {
  const form = event.target.closest(".admin-review-form");
  if (form) syncPromotionControls(form);
});
toolList.addEventListener("submit", (event) => {
  const form = event.target.closest(".admin-review-form");
  if (!form) return;
  event.preventDefault();
  saveReview(form);
});
toolList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  deleteTool(button);
});

refreshIcons();
const storedToken = getStoredToken();
if (storedToken) {
  state.token = storedToken;
  loadTools().then(refreshIcons);
}
