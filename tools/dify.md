# Dify — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Dify is an open-source LLM application development platform that enables building AI agents, chatbots, and RAG pipelines through a visual workflow interface without requiring deep programming knowledge.**

Released by LangGenius in 2023, Dify has grown into one of the most widely adopted open-source AI application builders, with over 100,000 GitHub stars. It abstracts away infrastructure concerns (model switching, embedding, vector storage, prompt versioning) so developers can focus on application logic.

## Key Features

| Feature | Description |
|---------|-------------|
| Visual workflow builder | Drag-and-drop node editor for chaining LLM calls, tools, and conditions |
| RAG pipeline | Document upload → chunking → embedding → vector search, fully managed |
| Agent mode | ReAct-based AI agents with tool use (web search, code execution, APIs) |
| Prompt orchestration | Version-controlled prompt templates with variable injection |
| Model switching | Swap LLMs without changing application logic |
| Dataset management | Knowledge bases with hybrid search (semantic + keyword) |
| API publishing | One-click API endpoint for any application built in Dify |
| Observability | Token usage, latency, and conversation logs per application |

## Supported Models

Dify supports any OpenAI-compatible API endpoint, plus native integrations for major providers:

| Provider | Models |
|---------|--------|
| Anthropic | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku |
| OpenAI | GPT-4o, GPT-4o mini, o1, o3 |
| Google | Gemini 1.5 Pro, Gemini 2.0 Flash |
| Meta (via Ollama/Groq) | Llama 3.3 70B, Llama 3.1 8B |
| Mistral AI | Mistral Large, Mistral 7B |
| Alibaba | Qwen 2.5 72B |
| Local (Ollama) | Any GGUF model |

Model credentials are stored per-workspace and can be rotated without touching application logic.

## Self-Hosting vs Dify Cloud

| Dimension | Self-hosted (Docker) | Dify Cloud |
|-----------|---------------------|-----------|
| Cost | Infrastructure only (~$10-30/month VPS) | Free tier + $59/month Starter |
| Setup time | 10–15 minutes | Instant |
| Data residency | Full control | Dify servers |
| Updates | Manual `docker compose pull` | Automatic |
| Scalability | Depends on your infra | Managed autoscale |
| Custom plugins | Yes | Limited |
| Team size | Unlimited | Seat-based on paid plans |

For most teams with data sensitivity requirements or cost pressure, self-hosting is the recommended approach.

## Docker Quickstart (Self-Hosting)

```bash
git clone https://github.com/langgenius/dify
cd dify/docker
cp .env.example .env
docker compose up -d
```

Access Dify at `http://localhost` after containers start (~2 minutes). The default stack includes:

- **dify-api**: Python backend (FastAPI)
- **dify-web**: Next.js frontend
- **dify-worker**: Celery background task worker
- **postgres**: Application database
- **redis**: Cache and queue
- **weaviate**: Default vector database (swappable to Qdrant, pgvector, Pinecone)

To update:

```bash
cd dify/docker
git pull
docker compose pull
docker compose up -d
```

## Dify vs LangChain vs Flowise vs n8n vs Langflow

| Dimension | Dify | LangChain | Flowise | n8n | Langflow |
|-----------|------|-----------|---------|-----|----------|
| Interface | Visual + code | Code-first | Visual | Visual | Visual + code |
| RAG support | Native, managed | Manual setup | Native | Via nodes | Native |
| Agent support | Native | Native | Native | Via nodes | Native |
| Self-hostable | Yes | N/A (library) | Yes | Yes | Yes |
| Target user | Developers + non-technical | Developers | Non-technical | Non-technical + dev | Developers |
| Prompt versioning | Yes | No | No | No | Limited |
| Production-ready API | One-click | Manual | Yes | Yes | Yes |
| GitHub stars (2026) | 100K+ | 95K+ | 30K+ | 50K+ | 35K+ |
| Best for | Full AI app platform | Custom pipelines in code | Simple chatbots | Workflow automation | Prototyping pipelines |

**Key distinction**: LangChain is a Python/JavaScript library for developers who want full code control. Dify is a platform that includes a UI, user management, dataset management, and production API hosting — closer to an "AI app server" than a library.

## Use Cases

**Internal chatbots**: Build a company knowledge base chatbot in under an hour. Upload PDFs, Notion exports, or web crawls as datasets, connect to Claude or GPT-4o, publish an internal URL.

**Customer support automation**: Create a RAG-powered support bot trained on documentation. Add escalation logic with conditional nodes. Track resolution rate in Dify's built-in analytics.

**Document Q&A**: Legal, medical, or financial document analysis. Upload structured documents, configure chunking strategy, enable hybrid search for precise retrieval.

**AI agents with tools**: Build agents that can search the web, run Python code, query databases, or call external APIs — all configured visually with a ReAct loop.

**Multi-step content pipelines**: Chain prompts for translation → summarization → tone adjustment → formatting, with each step visible and debuggable in the workflow canvas.

## Pricing (2026)

| Plan | Price | Key Limits |
|------|-------|-----------|
| Open source (self-hosted) | Free | Unlimited apps, users, API calls |
| Cloud Free | $0 | 200 messages/day, 5 apps, 5 MB dataset |
| Cloud Starter | $59/month | 5,000 messages/day, 50 apps, 500 MB dataset |
| Cloud Professional | $159/month | Unlimited messages, 200 apps, 5 GB dataset |
| Enterprise | Custom | SSO, audit logs, SLA, dedicated support |

Self-hosted users pay only for LLM API calls to their chosen providers.

## Frequently Asked Questions

**Q: What is Dify?**
A: Dify is an open-source platform for building production-grade LLM applications. It provides a visual workflow builder, RAG pipeline management, AI agent framework, and one-click API publishing. Developers use it to build chatbots, document Q&A systems, and AI agents without building infrastructure from scratch. It can be self-hosted via Docker or used as a cloud service at dify.ai.

**Q: Is Dify open source?**
A: Yes. Dify is open-source under a modified Apache 2.0 license (with restrictions on reselling Dify as a hosted service). The full source code is available at [github.com/langgenius/dify](https://github.com/langgenius/dify). The self-hosted version is free with no feature limitations. Dify Cloud is a paid hosted version of the same software.

**Q: Dify vs LangChain — which should I use?**
A: Use Dify if you want a complete platform with a visual UI, built-in dataset management, user management, prompt versioning, and a production API endpoint without writing infrastructure code. Use LangChain if you need full code-level control over your pipeline, are building something highly custom, or are integrating AI capabilities into an existing Python/JavaScript application. Many teams use both: LangChain for complex custom logic, Dify for internal tools and simpler chatbots.

**Q: How do I self-host Dify?**
A: Clone the Dify repository, navigate to the `docker` directory, copy `.env.example` to `.env`, and run `docker compose up -d`. Dify will be available at `http://localhost` within a few minutes. For production, configure a reverse proxy (nginx or Caddy), set up HTTPS, and point `APP_WEB_URL` to your domain in the `.env` file. Minimum server requirements: 2 vCPU, 4 GB RAM.

**Q: Does Dify support Claude API?**
A: Yes. Dify has native support for Anthropic's Claude models including Claude Opus 4.6, Claude Sonnet 4.6, and Claude Haiku. Add your Anthropic API key in Settings → Model Providers → Anthropic. Once configured, any application in Dify can use Claude as its LLM backend, and you can switch between Claude and other models without changing your application logic.

## Resources

- Dify documentation: [docs.dify.ai](https://docs.dify.ai?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=dify)
- Use Claude as the LLM backend for Dify apps: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=dify)
- **AI App Builder Prompts Pack** (Dify workflow templates, RAG configuration guides, Claude system prompt recipes): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=dify)

## Related

- [LangChain](langchain.md)
- [n8n](n8n.md)
- [RAG](../concepts/rag.md)
- [Vector Database](../concepts/vector-database.md)
- [Claude API](claude-api.md)
