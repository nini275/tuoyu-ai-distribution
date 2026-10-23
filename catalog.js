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
  if (value === null || value === undefined || value === "") return "Not available";
  return Number.isFinite(Number(value)) ? new Intl.NumberFormat("en-US").format(value) : "Not available";
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-US", {
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
  resultCount.textContent = `${results.length} result${results.length === 1 ? "" : "s"}${
    query ? ` · ${query}` : " · All approved projects"
  }`;
  if (!results.length) {
    resultsRegion.innerHTML = `
      <div class="catalog-empty">
        <i data-lucide="search-x"></i>
        <strong>No approved projects match</strong>
        <span>Try a shorter keyword, all categories, or submit a new project.</span>
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
          ? `<a href="${escapeHTML(tool.links.website)}" target="_blank" rel="noreferrer"><i data-lucide="external-link"></i>Website</a>`
          : "",
      ].join("");
      return `
        <article class="catalog-tool-card ${tool.isPaidPlacement ? "is-sponsored" : ""}">
          <div class="catalog-tool-card-head">
            <div>
              <h3>${escapeHTML(tool.name)}</h3>
              <span class="catalog-tool-category">${escapeHTML(tool.category)}</span>
            </div>
            ${tool.isPaidPlacement ? `<span class="catalog-placement-badge">Paid promotion</span>` : `<span class="catalog-score"><strong>${Math.round(tool.ranking.finalScore)}</strong><span>Match score</span></span>`}
          </div>
          <p>${escapeHTML(tool.description)}</p>
          <div class="catalog-tool-tags">
            ${(tool.tags || []).slice(0, 5).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}
          </div>
          <div class="catalog-tool-card-footer">
            <span class="catalog-tool-stats">
              ${tool.isPaidPlacement ? `Before promotion: ${tool.ranking.baseScore.toFixed(1)} · Boost +${tool.ranking.paidBoost}` : `Base score: ${tool.ranking.baseScore.toFixed(1)}`}<br />
              GitHub Stars: ${escapeHTML(formatNumber(tool.github.stars))} · Updated: ${escapeHTML(formatDate(tool.github.lastUpdated))}
            </span>
            <div class="catalog-tool-links">${links || "<span>No external links</span>"}</div>
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
  setLiveState("Searching catalog");
  try {
    const response = await fetch(`/api/catalog/search?${params}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Catalog search failed");
    renderResults(payload.results, query);
    setLiveState("Catalog online");
  } catch (error) {
    resultCount.textContent = "Search failed";
    resultsRegion.innerHTML = `
      <div class="catalog-empty">
        <i data-lucide="server-off"></i>
        <strong>Unable to connect to the catalog service</strong>
        <span>${escapeHTML(error.message)}</span>
      </div>
    `;
    setLiveState("Catalog offline", true);
    refreshIcons();
  }
}

async function loadCategories() {
  try {
    const response = await fetch("/api/catalog/categories");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Unable to load categories");
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
    setLiveState("Categories unavailable", true);
  }
}

function splitList(value) {
  return String(value || "")
    .split(/[,;\n]/)
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
  setFormStatus("Submitting and running basic validation...");
  try {
    const response = await fetch("/api/catalog/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) {
      const details = payload.details?.length ? `: ${payload.details.join("; ")}` : "";
      throw new Error(`${payload.message || "Submission failed"}${details}`);
    }
    setFormStatus(
      `Submitted "${payload.submission.name}". Current status: pending review. It will not appear in MCP search results until approved.`,
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
