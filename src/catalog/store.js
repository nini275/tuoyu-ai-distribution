const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { seedTools } = require("./seed");
const { rankTools, serializeRankedTool } = require("./scoring");
const { validateAdminUpdate, validateSubmission } = require("./validation");

const DEFAULT_DB_PATH = path.join(__dirname, "..", "..", "data", "catalog.sqlite");

function nowIso() {
  return new Date().toISOString();
}

function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    websiteUrl: row.website_url || null,
    repoUrl: row.repo_url || null,
    projectUrl: row.project_url,
    category: row.category,
    tags: parseJson(row.tags_json, []),
    useCases: parseJson(row.use_cases_json, []),
    githubStars: row.github_stars === null ? null : Number(row.github_stars),
    lastUpdated: row.last_updated || null,
    status: row.status,
    reviewFlags: parseJson(row.review_flags_json, []),
    reviewNote: row.review_note || "",
    promotionTier: row.promotion_tier || "none",
    promotionActive: Boolean(row.promotion_active),
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at || null,
    isSeed: Boolean(row.is_seed),
  };
}

class CatalogStore {
  constructor(dbPath = process.env.TUOYU_DB_PATH || DEFAULT_DB_PATH) {
    this.dbPath = dbPath;
    if (dbPath !== ":memory:") {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.initialize();
  }

  initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        website_url TEXT,
        repo_url TEXT,
        project_url TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        use_cases_json TEXT NOT NULL,
        github_stars REAL,
        last_updated TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        review_flags_json TEXT NOT NULL DEFAULT '[]',
        review_note TEXT NOT NULL DEFAULT '',
        promotion_tier TEXT NOT NULL DEFAULT 'none',
        promotion_active INTEGER NOT NULL DEFAULT 0,
        submitted_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        reviewed_at TEXT,
        is_seed INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
      CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
      CREATE INDEX IF NOT EXISTS idx_tools_promotion ON tools(promotion_active, promotion_tier);
    `);
    this.seedIfEmpty();
  }

  seedIfEmpty() {
    const count = Number(this.db.prepare("SELECT COUNT(*) AS count FROM tools").get().count);
    if (count > 0) return;
    const insert = this.db.prepare(`
      INSERT INTO tools (
        id, name, description, website_url, repo_url, project_url, category,
        tags_json, use_cases_json, github_stars, last_updated, status,
        review_flags_json, review_note, promotion_tier, promotion_active,
        submitted_at, updated_at, reviewed_at, is_seed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const timestamp = nowIso();
    this.db.exec("BEGIN");
    try {
      seedTools.forEach((tool, index) => {
        insert.run(
          `seed-${index + 1}`,
          tool.name,
          tool.description,
          tool.websiteUrl,
          tool.repoUrl,
          tool.repoUrl || tool.websiteUrl,
          tool.category,
          JSON.stringify(tool.tags),
          JSON.stringify(tool.useCases),
          tool.githubStars,
          tool.lastUpdated,
          "approved",
          JSON.stringify(["seed_metadata_requires_verification"]),
          "示例种子记录；GitHub 指标未实时抓取。",
          "none",
          0,
          timestamp,
          timestamp,
          timestamp,
          1,
        );
      });
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  list({ status } = {}) {
    const rows = status
      ? this.db
          .prepare("SELECT * FROM tools WHERE status = ? ORDER BY submitted_at DESC")
          .all(status)
      : this.db.prepare("SELECT * FROM tools ORDER BY submitted_at DESC").all();
    return rows.map(mapRow);
  }

  getById(id, options = {}) {
    const row = options.publicOnly
      ? this.db.prepare("SELECT * FROM tools WHERE id = ? AND status = 'approved'").get(id)
      : this.db.prepare("SELECT * FROM tools WHERE id = ?").get(id);
    return mapRow(row);
  }

  findByProjectUrl(projectUrl) {
    return mapRow(
      this.db.prepare("SELECT * FROM tools WHERE project_url = ?").get(projectUrl),
    );
  }

  submit(input) {
    const tool = validateSubmission(input);
    const existing = this.findByProjectUrl(tool.projectUrl);
    if (existing) {
      throw Object.assign(new Error("this project has already been submitted"), {
        code: "DUPLICATE_PROJECT",
        existingId: existing.id,
      });
    }

    const timestamp = nowIso();
    this.db
      .prepare(`
        INSERT INTO tools (
          id, name, description, website_url, repo_url, project_url, category,
          tags_json, use_cases_json, github_stars, last_updated, status,
          review_flags_json, review_note, promotion_tier, promotion_active,
          submitted_at, updated_at, reviewed_at, is_seed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, '', 'none', 0, ?, ?, NULL, 0)
      `)
      .run(
        tool.id,
        tool.name,
        tool.description,
        tool.websiteUrl,
        tool.repoUrl,
        tool.projectUrl,
        tool.category,
        JSON.stringify(tool.tags),
        JSON.stringify(tool.useCases),
        tool.githubStars,
        tool.lastUpdated,
        JSON.stringify(tool.reviewFlags),
        timestamp,
        timestamp,
      );
    return this.getById(tool.id);
  }

  review(id, input) {
    const existing = this.getById(id);
    if (!existing) {
      throw Object.assign(new Error("tool not found"), { code: "NOT_FOUND" });
    }
    const nextStatus = input.status ?? existing.status;
    const nextPromotionTier = input.promotionTier ?? existing.promotionTier;
    const proposed = {
      status: nextStatus,
      promotionTier: nextPromotionTier,
      promotionActive:
        nextStatus === "approved" && nextPromotionTier !== "none"
          ? input.promotionActive ?? existing.promotionActive
          : false,
      reviewNote: input.reviewNote ?? existing.reviewNote,
      githubStars: input.githubStars === undefined ? existing.githubStars : input.githubStars,
      lastUpdated: input.lastUpdated === undefined ? existing.lastUpdated : input.lastUpdated,
    };
    const update = validateAdminUpdate(proposed);

    const timestamp = nowIso();
    const reviewedAt =
      update.status === "approved" || update.status === "rejected" ? timestamp : existing.reviewedAt;
    this.db
      .prepare(`
        UPDATE tools
        SET status = ?, promotion_tier = ?, promotion_active = ?, review_note = ?,
            github_stars = ?, last_updated = ?, reviewed_at = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(
        update.status,
        update.promotionTier,
        update.promotionActive ? 1 : 0,
        update.reviewNote,
        update.githubStars,
        update.lastUpdated,
        reviewedAt,
        timestamp,
        id,
      );
    return this.getById(id);
  }

  remove(id) {
    const result = this.db.prepare("DELETE FROM tools WHERE id = ?").run(id);
    if (Number(result.changes) === 0) {
      throw Object.assign(new Error("tool not found"), { code: "NOT_FOUND" });
    }
    return { id, deleted: true };
  }

  search(criteria = {}) {
    const includeSponsored = criteria.includeSponsored !== false;
    const approved = this.list({ status: "approved" });
    return rankTools(approved, criteria, {
      includeSponsored,
      now: criteria.now,
    }).map(serializeRankedTool);
  }

  categories() {
    return this.db
      .prepare(`
        SELECT category, COUNT(*) AS count
        FROM tools
        WHERE status = 'approved'
        GROUP BY category
        ORDER BY category COLLATE NOCASE
      `)
      .all()
      .map((row) => ({ name: row.category, count: Number(row.count) }));
  }

  close() {
    this.db.close();
  }
}

module.exports = {
  CatalogStore,
  DEFAULT_DB_PATH,
  mapRow,
};
