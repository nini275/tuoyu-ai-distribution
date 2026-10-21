const { randomUUID } = require("node:crypto");

const REVIEW_STATUSES = new Set(["pending", "approved", "rejected", "paused"]);
const PROMOTION_TIERS = new Set(["none", "boost", "featured"]);

function text(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.details = [message];
  return error;
}

function boundedText(value, fieldName, maxLength, errors, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) errors.push(`${fieldName} is required`);
    return "";
  }
  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`);
    return "";
  }
  const normalized = value.trim();
  if (required && !normalized) {
    errors.push(`${fieldName} is required`);
    return "";
  }
  if (normalized.length > maxLength) {
    errors.push(`${fieldName} must contain at most ${maxLength} characters`);
    return normalized.slice(0, maxLength);
  }
  return normalized;
}

function stringList(value, fieldName, maxItems, maxLength, errors) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array of strings`);
    return [];
  }
  if (value.length > maxItems) {
    errors.push(`${fieldName} must contain at most ${maxItems} items`);
  }
  const items = [];
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string") {
      errors.push(`${fieldName}[${index}] must be a string`);
      continue;
    }
    const normalized = item.trim();
    if (!normalized) continue;
    if (normalized.length > maxLength) {
      errors.push(
        `${fieldName}[${index}] must contain at most ${maxLength} characters`,
      );
      continue;
    }
    items.push(normalized);
  }
  return [...new Set(items)].slice(0, maxItems);
}

function parseHttpUrl(value, fieldName, errors, required = false) {
  const raw = boundedText(value, fieldName, 2048, errors, { required });
  if (!raw) {
    return null;
  }
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(`${fieldName} must use http or https`);
      return null;
    }
    if (url.username || url.password) {
      errors.push(`${fieldName} must not contain credentials`);
      return null;
    }
    url.hash = "";
    return url.toString();
  } catch {
    errors.push(`${fieldName} must be a valid URL`);
    return null;
  }
}

function validateSubmission(input) {
  const errors = [];
  const name = boundedText(input?.name, "name", 100, errors, { required: true });
  const description = boundedText(input?.description, "description", 2000, errors, {
    required: true,
  });
  const category = boundedText(input?.category, "category", 80, errors, {
    required: true,
  });
  const websiteUrl = parseHttpUrl(input?.websiteUrl, "websiteUrl", errors);
  const repoUrl = parseHttpUrl(input?.repoUrl, "repoUrl", errors);
  const projectUrl = repoUrl || websiteUrl;
  if (!projectUrl && !errors.some((message) => /repoUrl|websiteUrl/.test(message))) {
    errors.push("repoUrl or websiteUrl is required");
  }
  const tags = stringList(input?.tags, "tags", 12, 40, errors);
  const useCases = stringList(input?.useCases, "useCases", 8, 120, errors);
  const githubStars =
    input?.githubStars === null || input?.githubStars === undefined || input.githubStars === ""
      ? null
      : Number(input.githubStars);

  if (name.length < 2) errors.push("name must contain at least 2 characters");
  if (description.length < 30) errors.push("description must contain at least 30 characters");
  if (!tags.length) errors.push("at least one tag is required");
  if (
    githubStars !== null &&
    (!Number.isFinite(githubStars) || githubStars < 0 || githubStars > 1_000_000_000)
  ) {
    errors.push("githubStars must be a number between 0 and 1000000000");
  }

  let lastUpdated = null;
  if (input?.lastUpdated) {
    const parsed = new Date(input.lastUpdated);
    if (Number.isNaN(parsed.getTime())) errors.push("lastUpdated must be a valid date");
    else lastUpdated = parsed.toISOString();
  }

  const reviewFlags = [];
  if (!repoUrl) reviewFlags.push("missing_repository");
  if (description.length < 80) reviewFlags.push("short_description");
  if (!useCases.length) reviewFlags.push("missing_use_cases");
  if (githubStars === null) reviewFlags.push("stars_not_provided");

  if (errors.length) {
    throw Object.assign(validationError(errors.join("; ")), { details: errors });
  }

  return {
    id: randomUUID(),
    name,
    description,
    websiteUrl,
    repoUrl,
    projectUrl,
    category,
    tags,
    useCases,
    githubStars,
    lastUpdated,
    reviewFlags,
  };
}

function validateAdminUpdate(input) {
  const errors = [];
  const status =
    input?.status === undefined
      ? undefined
      : boundedText(input.status, "status", 20, errors, { required: true });
  const promotionTier =
    input?.promotionTier === undefined
      ? undefined
      : boundedText(input.promotionTier, "promotionTier", 20, errors, {
          required: true,
        });
  let promotionActive;
  if (input?.promotionActive !== undefined) {
    if (typeof input.promotionActive !== "boolean") {
      errors.push("promotionActive must be a boolean");
    } else {
      promotionActive = input.promotionActive;
    }
  }
  const reviewNote =
    input?.reviewNote === undefined
      ? undefined
      : boundedText(input.reviewNote, "reviewNote", 1000, errors);
  let githubStars;
  if (input?.githubStars !== undefined) {
    if (input.githubStars === null || input.githubStars === "") {
      githubStars = null;
    } else {
      githubStars = Number(input.githubStars);
      if (
        !Number.isFinite(githubStars) ||
        githubStars < 0 ||
        githubStars > 1_000_000_000
      ) {
        errors.push("githubStars must be a number between 0 and 1000000000");
      }
    }
  }
  let lastUpdated;
  if (input?.lastUpdated !== undefined) {
    if (input.lastUpdated === null || input.lastUpdated === "") {
      lastUpdated = null;
    } else {
      const parsed = new Date(input.lastUpdated);
      if (Number.isNaN(parsed.getTime())) {
        errors.push("lastUpdated must be a valid date");
      } else {
        lastUpdated = parsed.toISOString();
      }
    }
  }

  if (status !== undefined && !REVIEW_STATUSES.has(status)) {
    errors.push("invalid review status");
  }
  if (promotionTier !== undefined && !PROMOTION_TIERS.has(promotionTier)) {
    errors.push("invalid promotion tier");
  }
  if (status === "approved" && promotionActive && promotionTier === "none") {
    errors.push("an active promotion requires a non-none tier");
  }
  if (errors.length) {
    throw Object.assign(validationError(errors.join("; ")), { details: errors });
  }

  return {
    status,
    promotionTier,
    promotionActive,
    reviewNote,
    githubStars,
    lastUpdated,
  };
}

module.exports = {
  PROMOTION_TIERS,
  REVIEW_STATUSES,
  validateAdminUpdate,
  validateSubmission,
};
