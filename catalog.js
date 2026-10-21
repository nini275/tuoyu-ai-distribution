const searchForm = document.querySelector("#catalog-search-form");
const submitForm = document.querySelector("#catalog-submit-form");
const queryInput = document.querySelector("#catalog-query");
const categorySelect = document.querySelector("#catalog-category");
const sponsoredInput = document.querySelector("#include-sponsored");
const resultsRegion = document.querySelector("#catalog-results");
const resultCount = document.querySelector("#catalog-result-count");
const liveState = document.querySelector("#catalog-live-state");
const categoryOptions = document.querySelector("#catalog-category-options");

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

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "未提供";
  return Number.isFinite(Number(value)) ? new Intl.NumberFormat("zh-CN").format(value) : "未提供";
}

function formatDate(value) {
  if (!value) return "未提供";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "未提供"
    : new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

function setLiveState(message, isError = false) {
  liveState.textContent = message;
  liveState.classList.toggle("is-error", isError);
}

function renderResults(results, query) {
  resultCount.textContent = `${results.length} 个结果${query ? ` · ${query}` : " · 全部已审核项目"}`;
  if (!results.length) {
    resultsRegion.innerHTML = `
      <div class="catalog-empty">
        <i data-lucide="search-x"></i>
        <strong>没有匹配的已审核项目</strong>
        <span>尝试更短的关键词、全部分类，或提交一个新的项目。</span>
      </div>
    `;
    refreshIcons();
    return;
  }

  resultsRegion.innerHTML = results
    .map((tool) => {
      const links = [
        tool.links.repository
          ? `<a href="${escapeHTML(tool.links.repository)}" target="_blank" rel="noreferrer"><i data-lucide="github"></i>GitHub</a>`
          : "",
        tool.links.website
          ? `<a href="${escapeHTML(tool.links.website)}" target="_blank" rel="noreferrer"><i data-lucide="external-link"></i>官网</a>`
          : "",
      ].join("");
      return `
        <article class="catalog-tool-card ${tool.isPaidPlacement ? "is-sponsored" : ""}">
          <div class="catalog-tool-card-head">
            <div>
              <h3>${escapeHTML(tool.name)}</h3>
              <span class="catalog-tool-category">${escapeHTML(tool.category)}</span>
            </div>
            ${tool.isPaidPlacement ? `<span class="catalog-placement-badge">推广</span>` : `<span class="catalog-score"><strong>${Math.round(tool.ranking.finalScore)}</strong><span>匹配分</span></span>`}
          </div>
          <p>${escapeHTML(tool.description)}</p>
          <div class="catalog-tool-tags">
            ${(tool.tags || []).slice(0, 5).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}
          </div>
          <div class="catalog-tool-card-footer">
            <span class="catalog-tool-stats">
              ${tool.isPaidPlacement ? `推广前 ${tool.ranking.baseScore.toFixed(1)} 分 · 加权 +${tool.ranking.paidBoost}` : `基础 ${tool.ranking.baseScore.toFixed(1)} 分`}<br />
              GitHub Stars：${escapeHTML(formatNumber(tool.github.stars))} · 更新：${escapeHTML(formatDate(tool.github.lastUpdated))}
            </span>
            <div class="catalog-tool-links">${links || "<span>暂无外链</span>"}</div>
          </div>
        </article>
      `;
    })
    .join("");
  refreshIcons();
}

async function searchCatalog() {
  const params = new URLSearchParams();
  const query = queryInput.value.trim();
  if (query) params.set("q", query);
  if (categorySelect.value) params.set("category", categorySelect.value);
  params.set("includeSponsored", String(sponsoredInput.checked));
  params.set("limit", "20");
  setLiveState("正在搜索目录");
  try {
    const response = await fetch(`/api/catalog/search?${params}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "目录搜索失败");
    renderResults(payload.results, query);
    setLiveState("目录在线");
  } catch (error) {
    resultCount.textContent = "搜索失败";
    resultsRegion.innerHTML = `
      <div class="catalog-empty">
        <i data-lucide="server-off"></i>
        <strong>暂时无法连接目录服务</strong>
        <span>${escapeHTML(error.message)}</span>
      </div>
    `;
    setLiveState("目录离线", true);
    refreshIcons();
  }
}

async function loadCategories() {
  try {
    const response = await fetch("/api/catalog/categories");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "分类读取失败");
    for (const category of payload.categories) {
      categorySelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)} · ${category.count}</option>`,
      );
      categoryOptions.insertAdjacentHTML(
        "beforeend",
        `<option value="${escapeHTML(category.name)}"></option>`,
      );
    }
  } catch {
    setLiveState("分类暂不可用", true);
  }
}

function splitList(value) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function setFormStatus(message, isError = false) {
  const region = document.querySelector("#catalog-form-status");
  region.hidden = false;
  region.textContent = message;
  region.classList.toggle("is-error", isError);
}

async function submitTool(event) {
  event.preventDefault();
  const button = document.querySelector("#catalog-submit-button");
  const data = new FormData(submitForm);
  const body = {
    name: data.get("name"),
    description: data.get("description"),
    repoUrl: data.get("repoUrl"),
    websiteUrl: data.get("websiteUrl"),
    category: data.get("category"),
    tags: splitList(data.get("tags")),
    useCases: splitList(data.get("useCases")),
    githubStars: data.get("githubStars") || null,
  };
  button.disabled = true;
  setFormStatus("正在提交并执行基础校验...");
  try {
    const response = await fetch("/api/catalog/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) {
      const details = payload.details?.length ? `：${payload.details.join("；")}` : "";
      throw new Error(`${payload.message || "提交失败"}${details}`);
    }
    setFormStatus(
      `已提交“${payload.submission.name}”。当前状态：待审核，审核通过前不会出现在 MCP 搜索结果中。`,
    );
    submitForm.reset();
  } catch (error) {
    setFormStatus(error.message, true);
  } finally {
    button.disabled = false;
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchCatalog();
});
submitForm.addEventListener("submit", submitTool);
document.querySelector("#catalog-clear-filters").addEventListener("click", () => {
  queryInput.value = "";
  categorySelect.value = "";
  sponsoredInput.checked = true;
  searchCatalog();
});

refreshIcons();
Promise.all([loadCategories(), searchCatalog()]).then(refreshIcons);
