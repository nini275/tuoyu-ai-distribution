const seedTools = [
  {
    name: "Dify",
    description:
      "Open-source LLM application platform for building agents, knowledge-base Q&A, workflows, and observable AI applications.",
    websiteUrl: null,
    repoUrl: "https://github.com/langgenius/dify",
    category: "Agent platforms",
    tags: ["agent", "workflow", "llm", "open-source"],
    useCases: ["Build enterprise knowledge-base Q&A", "Orchestrate customer-support agent workflows"],
    githubStars: null,
    lastUpdated: null,
  },
  {
    name: "Ollama",
    description:
      "Developer tooling for running and managing large language models locally, with a simple interface for pulling models, running inference, and exposing an API.",
    websiteUrl: "https://ollama.com",
    repoUrl: "https://github.com/ollama/ollama",
    category: "Model runtimes",
    tags: ["llm", "local", "inference", "open-source"],
    useCases: ["Run large language models locally", "Provide a model API for development environments"],
    githubStars: null,
    lastUpdated: null,
  },
  {
    name: "LangChain",
    description:
      "Development framework for building LLM applications and agents, with composable models, tools, retrieval, and workflow capabilities.",
    websiteUrl: "https://www.langchain.com",
    repoUrl: "https://github.com/langchain-ai/langchain",
    category: "Developer frameworks",
    tags: ["agent", "rag", "llm", "framework"],
    useCases: ["Build RAG applications", "Connect models to external tools"],
    githubStars: null,
    lastUpdated: null,
  },
  {
    name: "Hugging Face Transformers",
    description:
      "Open-source model library for text, vision, audio, and multimodal models, with support for training, inference, and integration across the model ecosystem.",
    websiteUrl: "https://huggingface.co/docs/transformers",
    repoUrl: "https://github.com/huggingface/transformers",
    category: "Model tools",
    tags: ["transformer", "multimodal", "inference", "open-source"],
    useCases: ["Load pretrained models", "Fine-tune multimodal models"],
    githubStars: null,
    lastUpdated: null,
  },
];

module.exports = { seedTools };
