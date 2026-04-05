# Vector Database — Complete Guide 2026

**A vector database** is a database system designed to store, index, and query high-dimensional vector embeddings — numerical representations of text, images, or other data produced by machine learning models. Vector databases enable semantic similarity search: finding items that are conceptually similar to a query, rather than exact keyword matches.

Vector databases are the core infrastructure component of RAG (Retrieval-Augmented Generation) systems, powering AI applications including chatbots, semantic search, recommendation engines, and document Q&A systems.

## How Vector Databases Work

```
1. Embed documents
   Text → Embedding model → [0.12, -0.45, 0.78, ...]  (1536-dimensional vector)

2. Store in vector DB
   vector_db.insert(id="doc1", vector=[...], metadata={text: "...", source: "..."})

3. Query by similarity
   query_vector = embed("How does RAG work?")
   results = vector_db.search(query_vector, top_k=5)
   → Returns 5 most semantically similar documents
```

**Key insight**: Vector search finds meaning, not keywords. "automobile" and "car" are semantically similar even though they share no characters.

## Comparison: Top Vector Databases 2026

| Database | Type | Best For | Free Tier | Latency | Scale |
|----------|------|----------|-----------|---------|-------|
| **Pinecone** | Managed cloud | Production, scale | 2GB free | <100ms | 1B+ vectors |
| **pgvector** | PostgreSQL extension | Existing Postgres users | Unlimited (self-hosted) | <50ms | 10M vectors |
| **Chroma** | Open source, local | Development, prototyping | Unlimited (local) | <10ms | 1M vectors |
| **Weaviate** | Open source / cloud | Multi-modal, hybrid search | Sandbox free | <100ms | 100M vectors |
| **Qdrant** | Open source / cloud | High-performance, Rust | 1GB free | <50ms | 100M vectors |
| **Milvus** | Open source | Large-scale, self-hosted | Unlimited (self-hosted) | <50ms | 1B+ vectors |
| **Supabase** (pgvector) | Managed Postgres | Full-stack apps | 500MB free | <50ms | 10M vectors |

## When to Use Each

| Use Case | Recommended |
|----------|------------|
| Local development / prototyping | Chroma (zero config, Python-native) |
| Production app, managed service | Pinecone or Qdrant Cloud |
| Already using PostgreSQL | pgvector (via Supabase or direct) |
| Next.js + Vercel stack | Supabase with pgvector |
| Multi-modal search (text + images) | Weaviate |
| High-volume, self-hosted | Milvus |

## Quick Start: pgvector with Claude API

The simplest production-grade RAG setup: PostgreSQL + pgvector + Claude API.

```sql
-- Enable pgvector in PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536),  -- OpenAI ada-002 or similar
  metadata JSONB
);

-- Create index for fast similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

```python
import anthropic
import psycopg2
from openai import OpenAI

# Setup clients
claude = anthropic.Anthropic()
embedder = OpenAI()

def embed(text: str) -> list[float]:
    return embedder.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    ).data[0].embedding

def rag_query(question: str, conn) -> str:
    # 1. Embed question
    query_vec = embed(question)
    
    # 2. Find similar documents
    cur = conn.cursor()
    cur.execute("""
        SELECT content FROM documents
        ORDER BY embedding <=> %s::vector
        LIMIT 3
    """, (query_vec,))
    docs = [row[0] for row in cur.fetchall()]
    
    # 3. Generate answer with Claude
    context = "\n\n".join(docs)
    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {question}"
        }]
    )
    return response.content[0].text
```

## Embedding Models Comparison

| Model | Dimensions | Provider | Cost | Quality |
|-------|-----------|----------|------|---------|
| text-embedding-3-small | 1536 | OpenAI | $0.02/1M tokens | Good |
| text-embedding-3-large | 3072 | OpenAI | $0.13/1M tokens | Best OpenAI |
| all-MiniLM-L6-v2 | 384 | HuggingFace | Free (local) | Good |
| BGE-M3 | 1024 | HuggingFace | Free (local) | Multilingual |
| Voyage-3 | 1024 | Anthropic/Voyage | $0.06/1M tokens | Best for Claude |

**Recommendation**: Use `text-embedding-3-small` (OpenAI) for most applications. Use `voyage-3` when primarily using Claude API for generation — embeddings from the same ecosystem improve retrieval relevance.

## Vector Database Architecture Patterns

### Basic RAG (most common)
```
Documents → Chunk → Embed → Store in vector DB
Query → Embed → Similarity search → Retrieved chunks → Claude API → Answer
```

### Hybrid Search (better recall)
```
Query → [Dense: vector similarity] + [Sparse: BM25 keyword]
     → Score fusion (RRF) → Reranker → Top-K docs → LLM
```

### Agentic RAG (most powerful)
```
Query → Agent decides: search needed? what to search?
      → Execute searches → Synthesize → Verify → Answer
```

## Frequently Asked Questions

**Q: What is a vector database?**
A: A vector database stores numerical representations (embeddings) of data and enables similarity search — finding items semantically similar to a query. Used as the retrieval layer in RAG systems.

**Q: What is the difference between a vector database and a regular database?**
A: Regular databases search by exact match or range queries on structured values. Vector databases search by semantic similarity using distance metrics (cosine similarity, Euclidean distance) on high-dimensional embeddings.

**Q: Which vector database should I use for a new project?**
A: For development: Chroma (free, local, zero setup). For production with Postgres: pgvector via Supabase. For managed cloud scale: Pinecone or Qdrant Cloud.

**Q: How many vectors can a vector database hold?**
A: Pinecone and Milvus handle 1B+ vectors. Managed solutions like Supabase pgvector handle tens of millions. For most AI applications, 1-10M vectors is sufficient.

**Q: Is pgvector good enough for production?**
A: Yes for most applications under 10M vectors. pgvector with HNSW indexing (PostgreSQL 16+) achieves sub-10ms queries at this scale. Beyond 10M vectors, dedicated vector databases like Pinecone or Qdrant are preferred.

**Q: What embedding model works best with Claude?**
A: Voyage AI embeddings (developed in partnership with Anthropic) show the best retrieval performance when paired with Claude for generation. For cost efficiency, `text-embedding-3-small` (OpenAI) is widely used.

**Q: Do I need a vector database to use RAG?**
A: For prototyping, no — you can do in-context RAG by pasting documents directly into Claude's 200K token context. For production with large document sets (>1000 documents), a vector database is necessary for cost and latency efficiency.

## Resources

- Build RAG systems with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=vector-database)
- **AI Agent Prompts Pack** (includes RAG agent prompts + vector DB setup templates): [belleofficial.gumroad.com](https://belleofficial.gumroad.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=vector-database)

## Related

- [RAG](rag.md)
- [AI Agent](ai-agent.md)
- [Claude API](../tools/claude-api.md)
- [Prompt Engineering](prompt-engineering.md)
