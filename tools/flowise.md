# Flowise — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Flowise is an open-source low-code visual tool for building LLM applications, RAG pipelines, and AI agents through a drag-and-drop node interface without writing code.**

Released in 2023 and built on top of LangChain.js, Flowise democratizes LLM application development by exposing LangChain components as visual nodes. Each node represents a building block — an LLM, a vector store, a retriever, a memory module, or a tool — and connections between nodes define the data flow. The resulting flow can be deployed as a REST API endpoint with a single click, making Flowise one of the fastest paths from idea to deployed AI application.

## Core Concepts

| Concept | Description |
|---------|-------------|
| Flow | A directed graph of nodes that defines an LLM application |
| Node | A single component (LLM, vector store, prompt, tool, memory, etc.) |
| Edge | A connection between nodes that passes data from one to another |
| Chatflow | A flow designed for conversational interactions with a chat UI |
| Agentflow | A flow where an AI agent autonomously decides which tools to call |
| Credential | Stored API key (OpenAI, Anthropic, Pinecone, etc.) — encrypted at rest |
| API endpoint | An auto-generated REST endpoint for each deployed flow |

## What You Can Build

- **Chatbots**: Customer support bots, FAQ bots, onboarding assistants
- **RAG pipelines**: Document Q&A, knowledge base search, technical documentation assistants
- **AI agents**: Autonomous agents with web search, code execution, and API tools
- **Document processing**: PDF extraction, summarization, classification pipelines
- **API endpoints**: Wrap any LLM workflow as a REST API for integration into other applications
- **Multi-model chains**: Sequential chains that pass output from one model to another

## Supported Integrations

Flowise inherits LangChain.js's integration ecosystem:

| Category | Options |
|----------|---------|
| LLM providers | OpenAI, Anthropic (Claude), Google (Gemini), Mistral, Groq, Ollama, Azure OpenAI |
| Vector databases | Pinecone, Weaviate, Qdrant, Chroma, Supabase pgvector, Milvus, Redis |
| Document loaders | PDF, Docx, CSV, web scraping, Notion, Confluence, GitHub, S3 |
| Embeddings | OpenAI, Cohere, HuggingFace, Ollama, Google |
| Memory | Buffer memory, summary memory, Redis-backed memory, Zep |
| Tools | SerpAPI, Playwright, Calculator, SQL, custom API tools |

## Docker Quickstart (Self-Hosting)

```bash
docker run -d --name flowise \
  -p 3000:3000 \
  -v flowise:/root/.flowise \
  flowiseai/flowise
```

Access Flowise at `http://localhost:3000`. For production with persistence and a custom port:

```bash
docker run -d --name flowise \
  -p 3000:3000 \
  -e PORT=3000 \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=yourpassword \
  -e DATABASE_PATH=/root/.flowise \
  -e SECRETKEY_PATH=/root/.flowise \
  -e LOG_PATH=/root/.flowise/logs \
  -v /your/local/path:/root/.flowise \
  flowiseai/flowise
```

For a Docker Compose setup with a Postgres database backend (recommended for production):

```yaml
version: '3.1'
services:
  flowise:
    image: flowiseai/flowise
    restart: always
    environment:
      DATABASE_TYPE: postgres
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_USER: flowise
      DATABASE_PASSWORD: flowise
      DATABASE_NAME: flowise
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: flowise
      POSTGRES_PASSWORD: flowise
      POSTGRES_DB: flowise
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

## Flowise vs Dify vs n8n vs LangChain vs Langflow

| Dimension | Flowise | Dify | n8n | LangChain | Langflow |
|-----------|---------|------|-----|-----------|----------|
| Open source | Yes (Apache 2.0) | Yes (modified Apache) | Yes (fair code) | Yes (MIT) | Yes (MIT) |
| Visual interface | Yes | Yes | Yes | No (code only) | Yes |
| LLM specialization | Yes | Yes | Partial | Yes | Yes |
| RAG support | Strong, native | Strong, native | Via nodes | Manual setup in code | Strong, native |
| Agent support | Yes (ReAct, OpenAI) | Yes | Via nodes | Yes | Yes |
| Self-hostable | Yes | Yes | Yes | N/A (library) | Yes |
| Language/runtime | Node.js (LangChain.js) | Python | Node.js | Python / JS | Python |
| Built on | LangChain.js | Custom + LangChain | Custom | Original | LangChain Python |
| Prompt versioning | Limited | Yes | No | No | Limited |
| Enterprise features | Limited | Yes | Yes (paid) | No | Limited |
| GitHub stars (2026) | 35K+ | 100K+ | 50K+ | 95K+ | 35K+ |
| Best for | Simple RAG + chatbots | Full AI app platform | General automation | Custom code pipelines | Prototyping |

**Flowise vs Dify**: Both target non-technical builders, but Dify has more polished UI, built-in user management, prompt versioning, and stronger enterprise features. Flowise is simpler to set up and has a more direct LangChain.js mapping. For serious production deployments, Dify is the stronger platform. For quickly prototyping RAG chatbots or exposing a LangChain flow as an API, Flowise is faster to get started.

**Flowise vs Langflow**: Both are visual LangChain wrappers, but Flowise runs on Node.js (LangChain.js) while Langflow runs on Python (LangChain Python). Langflow has a somewhat different visual paradigm with a canvas-style editor. Feature parity is roughly equivalent; the choice often comes down to familiarity with the underlying LangChain flavor.

## Building a RAG Chatbot in Flowise

A standard RAG pipeline in Flowise consists of the following nodes:

1. **PDF File Loader** → loads your documents
2. **Recursive Character Text Splitter** → chunks documents into segments
3. **OpenAI Embeddings** (or any embedding model) → embeds each chunk
4. **Pinecone / Qdrant / Supabase pgvector** → stores and retrieves embeddings
5. **Conversational Retrieval QA Chain** → retrieves relevant chunks and passes to LLM
6. **ChatAnthropic** (or any LLM) → generates the final answer
7. **Buffer Memory** → maintains conversation history

Connect these nodes in sequence, configure each with credentials and settings, and click "Save Chatflow". Flowise generates a chat UI and an API endpoint automatically.

## Pricing

| Plan | Price | Description |
|------|-------|-------------|
| Open source (self-hosted) | Free | Full features, unlimited flows |
| Flowise Cloud Starter | $35/month | Hosted, 1 workspace, 10 flows |
| Flowise Cloud Professional | $65/month | More flows, team collaboration |
| Enterprise | Custom | SSO, SLA, dedicated support |

Self-hosted users pay only for LLM API calls and their infrastructure (typically $5-20/month for a VPS or cloud container).

## Frequently Asked Questions

**Q: What is Flowise?**
A: Flowise is an open-source tool for building LLM applications through a visual drag-and-drop interface. Instead of writing LangChain code directly, you assemble a flow by connecting pre-built nodes — each node representing a component like an LLM, a vector database, a document loader, or a memory module. The resulting flow is deployed as a chat UI and a REST API endpoint with one click. Flowise is used by developers and non-technical builders to create chatbots, RAG pipelines, and AI agents without writing infrastructure code. It can be self-hosted via Docker or used as Flowise Cloud.

**Q: Flowise vs Dify — which should I use?**
A: For quick RAG prototypes or if you are already familiar with LangChain concepts, Flowise is faster to start with and has a more transparent node-to-LangChain mapping. For production applications requiring user management, prompt versioning, analytics, multiple team members, and a more polished end-to-end platform, Dify is the stronger choice. Dify also has a larger community and more active development as of 2026. Both are free to self-host — the decision is primarily about feature needs and complexity tolerance rather than cost.

**Q: Is Flowise free?**
A: Yes. Flowise is open-source under the Apache 2.0 license, and the self-hosted version is completely free with no feature limitations. You pay only for the infrastructure to run it (typically a VPS, Railway, or Render container for $5-15/month) and for LLM API calls to providers like Anthropic or OpenAI. Flowise Cloud is a paid hosted version starting at $35/month that removes the infrastructure management overhead.

**Q: Does Flowise support Claude?**
A: Yes. Flowise includes a `ChatAnthropic` node that supports all Claude models, including Claude Sonnet 4.6 and Claude Haiku. Add your Anthropic API key in Flowise's Credentials settings, then select it when configuring the ChatAnthropic node. Claude can be used as the LLM in any Flowise flow, including RAG pipelines, agent flows, and simple chatflows. Multiple LLMs can be configured simultaneously and swapped between without rebuilding the flow.

**Q: How do I build a RAG chatbot with Flowise?**
A: In the Flowise UI, create a new Chatflow and add these nodes: a document loader (e.g., PDF File), a text splitter (Recursive Character Text Splitter), an embedding model (e.g., OpenAI Embeddings), a vector store (e.g., Qdrant or Supabase), a retrieval chain (Conversational Retrieval QA Chain), and an LLM (ChatAnthropic or ChatOpenAI). Connect them in sequence, enter your API credentials in each node, and click Save. Flowise provides a built-in chat UI for testing and a REST API endpoint for integration. The entire process from empty canvas to working RAG chatbot typically takes 15-30 minutes.

## Resources

- Use Claude as the LLM in your Flowise flows: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=flowise)
- **AI App Builder Prompts Pack** (Flowise flow templates, RAG configuration guides, Claude system prompt recipes): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=flowise)

## Related

- [Dify](dify.md)
- [LangChain](langchain.md)
- [n8n](n8n.md)
- [RAG](../concepts/rag.md)
- [Vector Database](../concepts/vector-database.md)
- [Claude API](claude-api.md)
