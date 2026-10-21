const seedTools = [
  {
    name: "Dify",
    description:
      "开源 LLM 应用开发平台，适合构建 Agent、知识库问答、工作流和可观测的 AI 应用。",
    websiteUrl: null,
    repoUrl: "https://github.com/langgenius/dify",
    category: "Agent 平台",
    tags: ["agent", "workflow", "llm", "开源"],
    useCases: ["搭建企业知识库问答", "编排客服智能体工作流"],
    githubStars: null,
    lastUpdated: null,
  },
  {
    name: "Ollama",
    description:
      "在本地运行和管理大语言模型的开发者工具，提供简洁的模型拉取、运行和 API 接口。",
    websiteUrl: "https://ollama.com",
    repoUrl: "https://github.com/ollama/ollama",
    category: "模型运行时",
    tags: ["llm", "local", "inference", "开源"],
    useCases: ["本地运行大模型", "为开发环境提供模型 API"],
    githubStars: null,
    lastUpdated: null,
  },
  {
    name: "LangChain",
    description:
      "用于构建 LLM 应用与 Agent 的开发框架，提供模型、工具、检索和工作流组合能力。",
    websiteUrl: "https://www.langchain.com",
    repoUrl: "https://github.com/langchain-ai/langchain",
    category: "开发框架",
    tags: ["agent", "rag", "llm", "框架"],
    useCases: ["构建 RAG 应用", "连接模型与外部工具"],
    githubStars: null,
    lastUpdated: null,
  },
  {
    name: "Hugging Face Transformers",
    description:
      "面向文本、视觉、音频和多模态模型的开源模型库，支持训练、推理与模型生态集成。",
    websiteUrl: "https://huggingface.co/docs/transformers",
    repoUrl: "https://github.com/huggingface/transformers",
    category: "模型工具",
    tags: ["transformer", "multimodal", "inference", "开源"],
    useCases: ["加载预训练模型", "微调多模态模型"],
    githubStars: null,
    lastUpdated: null,
  },
];

module.exports = { seedTools };
