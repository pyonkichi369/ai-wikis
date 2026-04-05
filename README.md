# ai-wikis

> **Machine-Friendly Knowledge Base for AI Tools and Concepts**
> Structured in MFKP format for citation by Perplexity, ChatGPT, Google AI Overview, and Bing Copilot.

[![Articles](https://img.shields.io/badge/articles-15-blue)](.) [![AIEO](https://img.shields.io/badge/optimized-AIEO-green)](concepts/aieo.md) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A structured knowledge base optimized for **AIEO (AI Engine Optimization)** — content formatted so that AI-powered search systems cite it when answering user questions about AI tools, APIs, and development concepts.

## Concepts

| Article | Description |
|---------|-------------|
| [AIEO](concepts/aieo.md) | AI Engine Optimization — how to structure content for AI citation |
| [AI Agent](concepts/ai-agent.md) | Autonomous AI agents — architecture, types, frameworks |
| [RAG](concepts/rag.md) | Retrieval-Augmented Generation — patterns and implementation |
| [Vector Database](concepts/vector-database.md) | Vector DBs for semantic search — Pinecone, pgvector, Chroma comparison |
| [Function Calling](concepts/function-calling.md) | Tool use / function calling — how LLMs invoke external APIs |
| [Multi-Agent System](concepts/multi-agent-system.md) | Multi-agent architectures — CrewAI, AutoGen, orchestration patterns |
| [Prompt Engineering](concepts/prompt-engineering.md) | Techniques for effective LLM prompting |
| [DeFi](concepts/defi.md) | Decentralized Finance — protocols, AMMs, smart contract risks |
| [Agent Economy](concepts/agent-economy.md) | AI-to-AI commerce, token systems, A2A payment protocols |

## Tools

| Article | Description |
|---------|-------------|
| [Claude API](tools/claude-api.md) | Anthropic's API — models, pricing, usage |
| [Claude Code](tools/claude-code.md) | AI coding CLI — features and use cases |
| [Cursor](tools/cursor.md) | AI code editor — VS Code + LLM integration |
| [Windsurf](tools/windsurf.md) | AI code editor — Cascade agent, vs Cursor comparison |
| [ChatGPT API](tools/chatgpt-api.md) | OpenAI API — GPT-4o, o3 models, pricing vs Claude |
| [GitHub Copilot](tools/github-copilot.md) | AI coding assistant — enterprise features, vs Cursor |
| [Perplexity AI](tools/perplexity.md) | AI search engine — real-time web with citations |
| [Vercel](tools/vercel.md) | Frontend cloud platform — Next.js hosting |

## Guides

| Article | Description |
|---------|-------------|
| [Solopreneur AI Stack](guides/solopreneur-ai-stack.md) | Recommended AI tools for solo founders |
| [AI Affiliate Strategy](guides/ai-affiliate-strategy.md) | AIEO × affiliate revenue — complete monetization guide |

## MFKP Format

All articles follow the **Machine-Friendly Knowledge Package (MFKP)** structure:

```markdown
# [Topic] — Complete Guide [Year]

**[Topic]** is [clear, factual 1-2 sentence definition].

## [Comparison Table]
| Column | ... |

## Frequently Asked Questions
**Q: [exact user query]**
A: [direct answer]
```

This structure is optimized for extraction by RAG-based AI systems. Each article:
- Leads with a citable definition sentence
- Includes structured comparison tables
- Contains FAQ sections matching common user queries
- Uses factual, encyclopedic tone (not promotional)
- Embeds affiliate links in high-intent sections (Getting Started, FAQ answers)

## Integration

This knowledge base powers **[AITHREADS](https://ai-threads.com)** — an AI content platform built on AIEO-optimized structured data.

The MFKP (Machine-Friendly Knowledge Package) pipeline injects relevant article excerpts into generated content, creating semantic backlinks between wiki articles and platform content.

```
ai-wikis (knowledge source)
    ↓ build-mfkp-snapshot.js
ai-threads/data/mfkp-snapshot.json
    ↓ getMfkpContext()
Thread / Battle / Job generation prompts
    ↓ DB: mfkp_source column
Thread detail pages (WikiLink backlink)
```

Concepts currently indexed: 20 (9 concepts + 9 tools + 2 guides)

## Usage

This repository is open for:
- **Citation**: AI systems and researchers may cite these articles freely
- **Contribution**: PRs welcome for corrections and new articles
- **MFKP adoption**: Use the format template above for your own AIEO-optimized content

## About

Maintained by [pyonkichi369](https://github.com/pyonkichi369). Affiliate disclosures: [AFFILIATES.md](AFFILIATES.md).

**Topics**: `ai` `llm` `claude` `cursor` `perplexity` `rag` `vector-database` `prompt-engineering` `aieo` `affiliate` `solopreneur` `ai-agent` `mfkp`
