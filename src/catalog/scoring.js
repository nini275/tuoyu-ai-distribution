const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "一个",
  "一些",
  "什么",
  "可以",
  "如何",
  "帮我",
  "推荐",
  "有没有",
  "适合",
]);

const PROMOTION_BOOSTS = Object.freeze({
  none: 0,
  boost: 8,
  featured: 15,
});

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  const latinTokens = normalized.match(/[a-z0-9][a-z0-9.+#_-]*/g) || [];
  const chineseSegments = normalized.match(/[\u3400-\u9fff]{2,}/g) || [];
  const chineseTokens = chineseSegments.flatMap((segment) => {
    if (segment.length <= 6) return [segment];
    const grams = [];
    for (let index = 0; index < segment.length - 1; index += 1) {
      grams.push(segment.slice(index, index + 2));
    }
    return grams;
  });
  return [...new Set([...latinTokens, ...chineseTokens])].filter(
    (token) => token.length >= 2 && !STOP_WORDS.has(token),
  );
}

function includesPhrase(haystack, phrase) {
  return Boolean(phrase && normalizeText(haystack).includes(normalizeText(phrase)));
}

function getDescriptionScore(description) {
  const text = normalizeText(description);
  const length = text.length;
  let score = length >= 240 ? 88 : length >= 140 ? 74 : length >= 70 ? 58 : length >= 30 ? 38 : 15;
  if (/开源|open[- ]source|github/i.test(description)) score += 4;
  if (/适合|帮助|use case|场景|workflow|工作流|部署|api/i.test(description)) score += 4;
  if (/https?:\/\//i.test(description)) score -= 8;
  return clamp(score);
}

function getStarsScore(stars) {
  if (!Number.isFinite(stars) || stars <= 0) return 20;
  return clamp((Math.log10(stars + 1) / 4) * 100);
}

function getFreshnessScore(lastUpdated, now = new Date()) {
  if (!lastUpdated) return 25;
  const updatedAt = new Date(lastUpdated);
  if (Number.isNaN(updatedAt.getTime())) return 25;
  const ageDays = Math.max(0, (now.getTime() - updatedAt.getTime()) / 86_400_000);
  if (ageDays <= 30) return 100;
  if (ageDays <= 90) return 85;
  if (ageDays <= 180) return 70;
  if (ageDays <= 365) return 50;
  if (ageDays <= 730) return 30;
  return 15;
}

function getCompletenessScore(tool) {
  const checks = [
    Boolean(tool.description),
    Boolean(tool.projectUrl || tool.repoUrl),
    Boolean(tool.repoUrl),
    Boolean(tool.category),
    Array.isArray(tool.tags) && tool.tags.length >= 2,
    Array.isArray(tool.useCases) && tool.useCases.length >= 1,
  ];
  return (checks.filter(Boolean).length / checks.length) * 100;
}

function getRelevanceScore(tool, criteria = {}) {
  const query = normalizeText(criteria.query || criteria.need);
  const requestedUseCase = normalizeText(criteria.useCase);
  const requestedCategory = normalizeText(criteria.category);
  const name = normalizeText(tool.name);
  const description = normalizeText(tool.description);
  const category = normalizeText(tool.category);
  const tags = (tool.tags || []).map(normalizeText);
  const useCases = (tool.useCases || []).map(normalizeText);
  const tokens = tokenize(`${query} ${requestedUseCase}`);

  let score = query || requestedUseCase ? 0 : 55;
  if (requestedCategory && category === requestedCategory) score += 24;
  if (query && name === query) score += 55;
  else if (query && name.includes(query)) score += 38;
  else if (query && includesPhrase(description, query)) score += 20;
  if (requestedUseCase && useCases.some((item) => item.includes(requestedUseCase))) score += 32;

  for (const token of tokens) {
    if (name.includes(token)) score += 18;
    if (description.includes(token)) score += 9;
    if (category.includes(token)) score += 10;
    if (tags.some((tag) => tag.includes(token) || token.includes(tag))) score += 12;
    if (useCases.some((useCase) => useCase.includes(token) || token.includes(useCase))) score += 14;
  }

  return clamp(score);
}

function matchesCriteria(tool, criteria = {}) {
  if (criteria.category && normalizeText(tool.category) !== normalizeText(criteria.category)) {
    return false;
  }

  const query = normalizeText(criteria.query || criteria.need);
  const requestedUseCase = normalizeText(criteria.useCase);
  if (!query && !requestedUseCase) return true;

  const haystack = normalizeText(
    [
      tool.name,
      tool.description,
      tool.category,
      ...(tool.tags || []),
      ...(tool.useCases || []),
    ].join(" "),
  );
  const phrases = [query, requestedUseCase].filter(Boolean);
  if (phrases.some((phrase) => haystack.includes(phrase))) return true;

  const tokens = tokenize(phrases.join(" "));
  if (!tokens.length) return false;
  const matchedTokens = tokens.filter((token) => haystack.includes(token));
  return matchedTokens.length >= Math.min(2, tokens.length);
}

function getActivePaidBoost(tool, includeSponsored = true) {
  if (!includeSponsored || tool.status !== "approved" || !tool.promotionActive) return 0;
  return PROMOTION_BOOSTS[tool.promotionTier] || 0;
}

function scoreTool(tool, criteria = {}, options = {}) {
  const now = options.now || new Date();
  const includeSponsored = options.includeSponsored !== false;
  const relevanceScore = round(getRelevanceScore(tool, criteria));
  const qualityScore = round(
    getStarsScore(tool.githubStars) * 0.35 +
      getFreshnessScore(tool.lastUpdated, now) * 0.3 +
      getDescriptionScore(tool.description) * 0.25 +
      getCompletenessScore(tool) * 0.1,
  );
  const baseScore = round(clamp(relevanceScore * 0.5 + qualityScore * 0.5));
  const paidBoost = getActivePaidBoost(tool, includeSponsored);
  const finalScore = round(baseScore + paidBoost);

  return {
    relevanceScore,
    qualityScore,
    baseScore,
    paidBoost,
    finalScore,
    isPaidPlacement: paidBoost > 0,
  };
}

function rankTools(tools, criteria = {}, options = {}) {
  const limit = Math.min(50, Math.max(1, Number(criteria.limit) || 10));
  return tools
    .filter((tool) => matchesCriteria(tool, criteria))
    .map((tool) => ({
      tool,
      ranking: scoreTool(tool, criteria, options),
    }))
    .sort(
      (left, right) =>
        right.ranking.finalScore - left.ranking.finalScore ||
        right.ranking.baseScore - left.ranking.baseScore ||
        left.tool.name.localeCompare(right.tool.name, "zh-CN"),
    )
    .slice(0, limit);
}

function serializeRankedTool({ tool, ranking }) {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    links: {
      website: tool.websiteUrl || null,
      repository: tool.repoUrl || null,
    },
    category: tool.category,
    tags: tool.tags,
    useCases: tool.useCases,
    github: {
      stars: tool.githubStars ?? null,
      lastUpdated: tool.lastUpdated || null,
    },
    review: {
      status: tool.status,
      reviewedAt: tool.reviewedAt || null,
    },
    isPaidPlacement: ranking.isPaidPlacement,
    paidPlacement: ranking.isPaidPlacement
      ? {
          tier: tool.promotionTier,
          disclosed: true,
          label: "付费推广",
        }
      : null,
    ranking,
  };
}

function serializePublicTool(tool) {
  return serializeRankedTool({
    tool,
    ranking: scoreTool(tool, {}, { includeSponsored: true }),
  });
}

module.exports = {
  PROMOTION_BOOSTS,
  getRelevanceScore,
  matchesCriteria,
  rankTools,
  scoreTool,
  serializeRankedTool,
  serializePublicTool,
  tokenize,
};
