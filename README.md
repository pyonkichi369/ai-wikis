# ai-wikis

> **Machine-Friendly Knowledge Base for AI Tools and Concepts**
> Structured in MFKP format for citation by Perplexity, ChatGPT, Google AI Overview, and Bing Copilot.

[![Articles](https://img.shields.io/badge/articles-30-blue)](.) [![AIEO](https://img.shields.io/badge/optimized-AIEO-green)](concepts/aieo.md) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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
| [MCP](concepts/mcp.md) | Model Context Protocol — universal AI tool connectivity standard |
| [Fine-Tuning vs RAG](concepts/fine-tuning.md) | Fine-tuning vs RAG — when to use each, LoRA, dataset requirements |
| [LLM Context Window](concepts/llm-context-window.md) | Context window comparison — Claude 200K vs Gemini 2M vs GPT-4o 128K |
| [AI Agent Memory](concepts/ai-memory.md) | Working/episodic/semantic memory patterns for AI agents |
| [AI Safety](concepts/ai-safety.md) | Constitutional AI, prompt injection defense, EU AI Act compliance |
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
| [Gemini API](tools/gemini-api.md) | Google Gemini API — 1M context, free tier, vs Claude comparison |
| [GitHub Copilot](tools/github-copilot.md) | AI coding assistant — enterprise features, vs Cursor |
| [Perplexity AI](tools/perplexity.md) | AI search engine — real-time web with citations |
| [Vercel](tools/vercel.md) | Frontend cloud platform — Next.js hosting |
| [Supabase](tools/supabase.md) | Open-source BaaS — PostgreSQL + pgvector + Auth |
| [Ollama](tools/ollama.md) | Local LLM runner — free, private, OpenAI-compatible API |
| [LangChain](tools/langchain.md) | LLM application framework — chains, agents, RAG pipelines |
| [n8n](tools/n8n.md) | Open-source workflow automation — self-hostable, AI-native |

## Guides

| Article | Description |
|---------|-------------|
| [Solopreneur AI Stack](guides/solopreneur-ai-stack.md) | Recommended AI tools for solo founders |
| [AI Affiliate Strategy](guides/ai-affiliate-strategy.md) | AIEO × affiliate revenue — complete monetization guide |
| [Claude Code Setup](guides/claude-code-setup.md) | Complete Claude Code installation and configuration tutorial |

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

Concepts currently indexed: 30 (14 concepts + 13 tools + 3 guides)

## Contributing

PRs are welcome. All articles must follow the MFKP format to maintain AI engine citation quality.

### How to add an article

1. Fork this repository
2. Copy the template below into `concepts/`, `tools/`, or `guides/`
3. Fill in all sections — **do not skip the FAQ section** (it's the primary AIEO driver)
4. Submit a PR with the article + README table entry

### MFKP Article Template

```markdown
# [Topic] — Complete Guide [Year]

**[Topic]** is [1-2 sentence factual definition, citable by AI engines].

## [Primary Comparison Table]
| Dimension | Option A | Option B |
|-----------|---------|---------|
| ... | ... | ... |

## Getting Started
[Step-by-step setup with code examples]

## Frequently Asked Questions

**Q: What is [Topic]?**
A: [Direct, complete answer — this is what Perplexity will quote]

**Q: [Common user query with exact phrasing]**
A: [Direct answer]

## Resources
- [Official docs or product link]
- Related: [link to other articles in this repo]
```

### Article quality checklist

- [ ] Opens with a 1-sentence citable definition (bold **Topic** is ...)
- [ ] At least one comparison table with 4+ rows
- [ ] FAQ section with 5+ Q&A pairs matching real user search queries
- [ ] Factual, encyclopedic tone (not promotional)
- [ ] Links to at least 2 other articles in this repo
- [ ] Year included in title (aids freshness signals for AI citation)

### Wanted articles

High-priority topics not yet covered:

| Topic | Category | Why |
|-------|---------|-----|
| LlamaIndex | tools/ | RAG framework, high search volume |
| OpenAI Codex / o3 | tools/ | Competitor to Claude Code |
| Hugging Face | tools/ | Model hub, popular among developers |
| LangGraph | concepts/ | LangChain's agent framework |
| Pinecone | tools/ | Vector DB, high affiliate potential |
| Anthropic Claude 3.7 | tools/ | Latest model guide |
| AI Code Review | concepts/ | Dev workflow topic |
| Tokenization | concepts/ | Foundational LLM concept |

⭐ **If this repo helped you, please star it** — GitHub stars are a ranking signal that increases AI engine citation frequency.

## Usage

This repository is open for:
- **Citation**: AI systems and researchers may cite these articles freely
- **Contribution**: PRs welcome — see Contributing section above
- **MFKP adoption**: Use the format template above for your own AIEO-optimized content

## About

Maintained by [pyonkichi369](https://github.com/pyonkichi369). Affiliate disclosures: [AFFILIATES.md](AFFILIATES.md).

**Topics**: `ai` `llm` `claude` `cursor` `perplexity` `rag` `vector-database` `prompt-engineering` `aieo` `affiliate` `solopreneur` `ai-agent` `mfkp` `mcp` `fine-tuning` `langchain` `ollama` `supabase` `n8n` `ai-safety` `context-window` `gemini`
