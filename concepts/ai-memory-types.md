# AI Memory Types — In-Context, External, Episodic, Procedural 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI memory systems are classified into four primary types — in-context (within a single session), external (vector databases), episodic (past interaction history), and procedural (learned behaviors) — each serving different retention needs and persistence durations.**

Understanding these memory types is essential for architects building AI agents, chatbots, and RAG systems. The choice of memory architecture directly determines what an AI system can "remember" across turns, sessions, users, and deployments.

## Memory Types Overview

| Type | Persistence | Storage Location | Use Case | Example |
|------|------------|-----------------|---------|---------|
| **In-context (working)** | Session only | LLM context window | Current conversation state | System prompt + message history |
| **External / Semantic** | Permanent | Vector database | Knowledge base lookup, RAG | Pinecone, pgvector, Weaviate |
| **Episodic** | Persistent | Database or files | User history, preferences, past interactions | MCP memory server, mem0 |
| **Procedural** | Permanent | Model weights or prompt templates | Learned skills, behavioral rules | Fine-tuned model, CLAUDE.md, system prompt |
| **Working (scratchpad)** | Session | In-context buffer | Multi-step reasoning, CoT | Chain-of-thought intermediate steps |

## In-Context Memory

In-context memory is everything within the LLM's active context window during a single inference call. It includes:

- The system prompt
- The full conversation history (user and assistant turns)
- Tool call results
- Any retrieved documents injected into the prompt

**Characteristics:**
- Fast access — no retrieval latency
- Limited by the model's context window (e.g., 200K tokens for Claude 3.7)
- Resets completely between sessions unless explicitly persisted elsewhere
- Costs scale linearly with context length

In-context memory is sufficient for single-session tasks but becomes expensive and impractical for long-running agents or multi-session applications.

## External / Semantic Memory

External memory stores information outside the model in a vector database or document store. At inference time, relevant chunks are retrieved and injected into the context window (Retrieval-Augmented Generation, or RAG).

**Common vector databases:**

| Database | Type | Hosting | Notes |
|----------|------|---------|-------|
| Pinecone | Managed vector DB | Cloud | Purpose-built, easy API |
| pgvector | PostgreSQL extension | Self-hosted / Supabase | SQL-native, no extra infra |
| Weaviate | Open-source vector DB | Self-hosted / Cloud | Multi-modal support |
| Chroma | Open-source | Local / self-hosted | Lightweight, dev-friendly |
| Qdrant | Open-source | Self-hosted / Cloud | High-performance, filtering |

**Retrieval pattern:**
1. Documents are chunked and embedded at indexing time
2. User query is embedded at inference time
3. Top-k semantically similar chunks are retrieved
4. Retrieved context is injected into the prompt

External memory is permanent and scalable but introduces retrieval latency and requires embedding management.

## Episodic Memory

Episodic memory records specific past interactions — what a particular user said, decided, or preferred — and makes that history available in future sessions. This is analogous to human autobiographical memory.

**Implementation approaches:**

| Approach | Description | Persistence |
|----------|-------------|-------------|
| Database (SQL/NoSQL) | Store conversation summaries or key facts per user | Permanent |
| MCP memory server | Expose stored memories as tools the LLM can read/write | Permanent |
| mem0 library | Managed episodic memory API with automatic extraction | Permanent |
| Summarization chain | Summarize old context into a "memory note" for future sessions | Session-bridging |

Episodic memory enables personalization at scale — an AI assistant can recall user preferences, past decisions, or project history without re-explaining context every session.

## Procedural Memory

Procedural memory encodes how to perform tasks, not what facts to recall. In AI systems, this manifests as:

- **Fine-tuned model weights** — The model has "internalized" a skill through training on examples
- **System prompt templates** — Reusable instruction sets that define agent behavior (e.g., `CLAUDE.md`)
- **Few-shot examples** — Demonstrated patterns prepended to the prompt
- **Tool definitions** — Structured schemas that teach the model how to call external systems

Procedural memory is the most durable form — it survives session boundaries, user changes, and context resets — but it is also the most expensive to update (fine-tuning requires significant compute).

## Implementing Persistent Memory with mem0

[mem0](https://mem0.ai) is a managed memory layer for AI applications. It automatically extracts, stores, and retrieves episodic and semantic memories from conversations.

```python
from mem0 import Memory

# Initialize with default config (local storage)
memory = Memory()

# Store a memory for a specific user
memory.add("User prefers Python over JavaScript", user_id="alice")
memory.add("Alice is working on a FastAPI backend project", user_id="alice")

# Retrieve relevant memories before an LLM call
results = memory.search("programming language preference", user_id="alice")
for r in results:
    print(r["memory"])
# Output: "User prefers Python over JavaScript"

# Use with Claude or any LLM — inject retrieved memories into system prompt
memories_str = "\n".join([r["memory"] for r in results])
system_prompt = f"User context:\n{memories_str}\n\nAnswer helpfully."
```

mem0 supports cloud-hosted storage, organization-level memory, and integration with LangChain and LlamaIndex.

## MCP Memory Server

The Model Context Protocol (MCP) enables AI agents to interact with external tools, including memory servers. An MCP memory server exposes read and write tools that allow the LLM to explicitly store and retrieve memories during a conversation.

**MCP memory tools (typical interface):**
- `store_memory(content, tags)` — Persist a fact or observation
- `retrieve_memories(query, limit)` — Semantic search over stored memories
- `list_memories(user_id)` — List all stored memories for a user
- `delete_memory(id)` — Remove a specific memory

Claude Code natively supports MCP servers, enabling persistent memory across coding sessions via local or hosted memory backends.

## When to Use Each Memory Type

| Situation | Recommended Memory Type |
|-----------|------------------------|
| Single-session Q&A chatbot | In-context only |
| RAG over a document corpus | External / semantic (vector DB) |
| Personalized assistant (multi-session) | Episodic (mem0, MCP memory) |
| Domain-specific fine-tuned model | Procedural (weights) |
| Agent with reusable instructions | Procedural (system prompt / CLAUDE.md) |
| Long conversation with rolling context | In-context + summarization |
| Multi-user application with user preferences | Episodic per user_id |

## LangChain Memory Modules

LangChain provides modular memory implementations for rapid prototyping:

| Module | Type | Behavior |
|--------|------|----------|
| `ConversationBufferMemory` | In-context | Stores full history |
| `ConversationSummaryMemory` | In-context + LLM | Summarizes old turns |
| `VectorStoreRetrieverMemory` | External | Stores history as embeddings |
| `ConversationEntityMemory` | Episodic | Extracts and tracks named entities |

## Related Resources

- Build AI agents with persistent memory using the Claude API: [Get started with Claude](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-memory-types)
- AI Engineering Toolkit (PDF guide): [ZENERA AI Toolkit on Gumroad](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-memory-types)

---

## Frequently Asked Questions

### What are the types of AI memory?

AI memory systems are generally classified into five types: (1) in-context memory, which exists only within the active session's context window; (2) external or semantic memory, stored in vector databases and retrieved via RAG; (3) episodic memory, which records past interactions and user history across sessions; (4) procedural memory, which encodes behaviors in model weights or persistent prompt templates; and (5) working memory, an in-context scratchpad used for multi-step reasoning. Each type trades off between persistence, retrieval speed, and storage cost.

### How does Claude remember previous conversations?

By default, Claude does not retain memory between separate conversations — each session starts with a blank context window. To add persistence, developers must implement external memory: storing conversation summaries or key facts in a database (episodic memory), using an MCP memory server that Claude can read and write during sessions, or injecting retrieved context into the system prompt via a RAG pipeline. Products built on Claude (such as Claude.ai) may implement their own memory layers on top of the base model API.

### What is vector memory in AI?

Vector memory refers to storing information as high-dimensional numerical vectors (embeddings) in a specialized database such as Pinecone, pgvector, or Weaviate. At query time, the user's input is also embedded and the database returns the most semantically similar stored items — enabling the AI to "recall" relevant knowledge even when the exact wording differs. Vector memory is the foundation of Retrieval-Augmented Generation (RAG) and is used for knowledge bases, documentation search, and long-term semantic storage.

### How do I add persistent memory to my AI agent?

The most practical approaches in 2026 are: (1) use the mem0 library, which automatically extracts facts from conversations and stores them per user_id, with a retrieval API for injecting context into future prompts; (2) set up an MCP memory server and connect it to Claude Code or another MCP-compatible agent, enabling explicit read/write memory tools; (3) store conversation summaries in a SQL database (e.g., Supabase) and retrieve them by user or session at the start of each new conversation. The right choice depends on whether you need automatic extraction (mem0), explicit agent control (MCP), or simple persistence (database + retrieval).

### What is the MCP memory server?

The MCP memory server is a server implementing the Model Context Protocol that exposes memory operations as callable tools. An AI agent (such as Claude Code) can invoke these tools during a session to store observations, retrieve relevant past memories, or manage a persistent knowledge store. Because MCP is an open protocol, memory servers can be local (backed by a file or SQLite database) or hosted (backed by a cloud database). This architecture allows AI agents to maintain state across sessions without modifying the underlying model.
