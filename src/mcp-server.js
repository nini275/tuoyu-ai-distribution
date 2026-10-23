#!/usr/bin/env node

const readline = require("node:readline");
const { CatalogStore } = require("./catalog/store");

const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
]);
const LATEST_PROTOCOL_VERSION = "2025-06-18";

const toolDefinitions = [
  {
    name: "search_tools",
    title: "Search software and open-source projects",
    description:
      "Search the TuoYu catalog by keyword, category, or use case. Results may include clearly disclosed paid placements. Paid placements are relevance-filtered and receive a capped ranking boost.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: {
          type: "string",
          description: "Keyword, project name, technology, or task description.",
          maxLength: 500,
        },
        category: {
          type: "string",
          description: "Exact catalog category, such as Agent platforms or Developer frameworks.",
          maxLength: 80,
        },
        use_case: {
          type: "string",
          description: "Specific scenario the user wants to accomplish.",
          maxLength: 300,
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 50,
          default: 10,
        },
        include_sponsored: {
          type: "boolean",
          description: "Whether eligible paid placements may receive their disclosed boost.",
          default: true,
        },
      },
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "recommend_tools",
    title: "Recommend tools for a task",
    description:
      "Return ranked software, model, and open-source project recommendations for a task. Every paid placement is disclosed with isPaidPlacement, paidBoost, and a promotion label.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["need"],
      properties: {
        need: {
          type: "string",
          description: "The user's task, problem, or desired outcome.",
          minLength: 2,
          maxLength: 500,
        },
        category: {
          type: "string",
          description: "Optional exact category filter.",
          maxLength: 80,
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 20,
          default: 5,
        },
        include_sponsored: {
          type: "boolean",
          description: "Whether eligible paid placements may receive their disclosed boost.",
          default: true,
        },
      },
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
  },
];

function createResponse(criteria, store) {
  const results = store.search(criteria);
  return {
    results,
    result_count: results.length,
    sponsored_count: results.filter((result) => result.isPaidPlacement).length,
    ranking_policy: {
      formula: "finalScore = baseScore + paidBoost",
      maximum_paid_boost: 15,
      paid_placements_disclosed: true,
      relevance_filter_applied_before_boost: true,
      explanation:
        "A paid placement can improve ordering only after matching the query or use case. Clients should surface isPaidPlacement and paidPlacement.label when presenting promoted results.",
    },
  };
}

function invalidArguments(message) {
  return Object.assign(new Error(message), { code: "INVALID_ARGUMENTS" });
}

function validateToolArguments(name, args) {
  if (args === undefined || args === null) args = {};
  if (typeof args !== "object" || Array.isArray(args)) {
    throw invalidArguments("Tool arguments must be an object.");
  }

  const readString = (key, { required = false, maxLength } = {}) => {
    const value = args[key];
    if (value === undefined || value === null || value === "") {
      if (required) throw invalidArguments(`${key} is required.`);
      return "";
    }
    if (typeof value !== "string") {
      throw invalidArguments(`${key} must be a string.`);
    }
    const normalized = value.trim();
    if (required && !normalized) throw invalidArguments(`${key} is required.`);
    if (maxLength && normalized.length > maxLength) {
      throw invalidArguments(`${key} must contain at most ${maxLength} characters.`);
    }
    return normalized;
  };

  const readLimit = (maximum, defaultValue) => {
    const value = args.limit;
    if (value === undefined || value === null) return defaultValue;
    if (!Number.isInteger(value) || value < 1 || value > maximum) {
      throw invalidArguments(`limit must be an integer between 1 and ${maximum}.`);
    }
    return value;
  };

  if (args.include_sponsored !== undefined && typeof args.include_sponsored !== "boolean") {
    throw invalidArguments("include_sponsored must be a boolean.");
  }

  if (name === "search_tools") {
    return {
      query: readString("query", { maxLength: 500 }),
      category: readString("category", { maxLength: 80 }),
      useCase: readString("use_case", { maxLength: 300 }),
      limit: readLimit(50, 10),
      includeSponsored: args.include_sponsored !== false,
    };
  }

  if (name === "recommend_tools") {
    const need = readString("need", { required: true, maxLength: 500 });
    if (need.length < 2) throw invalidArguments("need must contain at least 2 characters.");
    return {
      query: need,
      category: readString("category", { maxLength: 80 }),
      limit: readLimit(20, 5),
      includeSponsored: args.include_sponsored !== false,
    };
  }

  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: "UNKNOWN_TOOL" });
}

function callTool(name, args, store) {
  return createResponse(validateToolArguments(name, args), store);
}

function success(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function failure(id, code, message, data) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data }),
    },
  };
}

async function handleMessage(message, store) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return failure(message?.id, -32600, "Invalid Request");
  }

  const isNotification = message.id === undefined;
  if (message.method === "notifications/initialized" || message.method === "notifications/cancelled") {
    return null;
  }
  if (message.method === "ping") {
    return isNotification ? null : success(message.id, {});
  }
  if (message.method === "initialize") {
    const requestedVersion = message.params?.protocolVersion;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.has(requestedVersion)
      ? requestedVersion
      : LATEST_PROTOCOL_VERSION;
    return isNotification
      ? null
      : success(message.id, {
          protocolVersion,
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: {
            name: "tuoyu-mcp-catalog",
            title: "TuoYu MCP Tool Catalog",
            version: "0.1.0",
          },
          instructions:
            "Use search_tools for discovery and recommend_tools for task-fit recommendations. Always disclose results where isPaidPlacement is true. Never describe paid placement as an objective ranking or platform endorsement.",
        });
  }
  if (message.method === "tools/list") {
    return isNotification ? null : success(message.id, { tools: toolDefinitions });
  }
  if (message.method === "tools/call") {
    if (isNotification) return null;
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    if (typeof name !== "string") {
      return failure(message.id, -32602, "Tool name is required");
    }
    try {
      const payload = callTool(name, args, store);
      return success(message.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(payload, null, 2),
          },
        ],
        structuredContent: payload,
        isError: false,
      });
    } catch (error) {
      if (error.code === "INVALID_ARGUMENTS") {
        return failure(message.id, -32602, error.message, { tool: name });
      }
      return success(message.id, {
        content: [
          {
            type: "text",
            text: error.message,
          },
        ],
        isError: true,
      });
    }
  }

  return isNotification ? null : failure(message.id, -32601, "Method not found");
}

function startStdioServer({ input = process.stdin, output = process.stdout, errorOutput = process.stderr } = {}) {
  const store = new CatalogStore();
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  lines.on("line", async (line) => {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      output.write(`${JSON.stringify(failure(null, -32700, "Parse error"))}\n`);
      return;
    }
    const response = await handleMessage(message, store);
    if (response) output.write(`${JSON.stringify(response)}\n`);
  });
  lines.on("close", () => {
    store.close();
    errorOutput.write("Tuoyu MCP catalog server stopped.\n");
  });
  input.on("error", (error) => {
    errorOutput.write(`MCP input error: ${error.message}\n`);
  });
  return { store, lines };
}

if (require.main === module) {
  startStdioServer();
  process.stderr.write("Tuoyu MCP catalog server is running over stdio.\n");
}

module.exports = {
  LATEST_PROTOCOL_VERSION,
  callTool,
  handleMessage,
  startStdioServer,
  toolDefinitions,
};
