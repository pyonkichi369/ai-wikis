# RAG Implementation Guide — Build a Production RAG Pipeline 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**RAG (Retrieval-Augmented Generation) is an AI architecture technique that retrieves relevant documents from a knowledge base before passing them to a language model for generation, reducing hallucination, enabling access to private data, and bypassing LLM knowledge cutoffs.**

## What Is RAG?

A standard LLM generates answers based solely on its training data. RAG extends this by adding a retrieval step: before the model responds, the system fetches documents relevant to the query from a vector database, then includes those documents in the prompt as context. The model generates its answer grounded in the retrieved material rather than from memory alone.

RAG is the dominant architecture for enterprise AI applications that require answers grounded in proprietary documents, live data, or knowledge more recent than the model's training cutoff.

## Pipeline Architecture

```
Query
  │
  ▼
Embed Query (text → vector)
  │
  ▼
Vector Search (cosine similarity against stored embeddings)
  │
  ▼
Retrieve Top-K Documents (most relevant chunks)
  │
  ▼
Build Prompt (system + context + query)
  │
  ▼
LLM Generation (Claude, GPT-4, etc.)
  │
  ▼
Response
```

The pipeline splits into two phases:

- **Ingestion** (offline): Documents are chunked, embedded, and stored in a vector database
- **Retrieval** (online): At query time, the query is embedded, relevant chunks are fetched, and the LLM generates a grounded response

---

## Step-by-Step Implementation

### Step 1: Document Ingestion and Chunking

Documents must be split into chunks before embedding. The chunk is the unit of retrieval — too large and irrelevant content dilutes context; too small and chunks lose meaning.

#### Chunking Strategies Compared

| Strategy | Method | Chunk Size | Pros | Cons |
|----------|--------|-----------|------|------|
| Fixed-size | Split every N tokens | 256–512 tokens | Simple, fast, predictable | Breaks sentences mid-thought |
| Recursive | Split on `\n\n`, `\n`, ` ` in order | 256–1024 tokens | Respects paragraph boundaries | Chunks vary in size |
| Semantic | Embed sentences, split where similarity drops | Variable | Highest coherence | Slow, expensive |
| Document structure | Split on headers (Markdown, HTML) | Section-level | Natural granularity | Requires structured docs |

**Recommended default**: Recursive with chunk size 512 tokens and 50-token overlap. The overlap prevents information loss at chunk boundaries.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)

chunks = splitter.split_text(document_text)
```

### Step 2: Embedding Generation

Embeddings convert text chunks into dense vectors that encode semantic meaning. Similar text produces vectors with high cosine similarity.

| Provider | Model | Dimensions | Cost | Notes |
|----------|-------|-----------|------|-------|
| OpenAI | text-embedding-3-small | 1536 | $0.02/1M tokens | Fast, widely used |
| OpenAI | text-embedding-3-large | 3072 | $0.13/1M tokens | Higher accuracy |
| Cohere | embed-english-v3.0 | 1024 | $0.10/1M tokens | Strong retrieval performance |
| nomic-ai | nomic-embed-text | 768 | Free (local) | Best free option via Ollama |
| Google | text-embedding-004 | 768 | $0.025/1M tokens | Gemini ecosystem |

```python
from openai import OpenAI

client = OpenAI()

def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
```

### Step 3: Vector Storage

Embeddings are stored in a vector database that supports approximate nearest-neighbor search.

| Database | Type | Deployment | Best For |
|----------|------|-----------|----------|
| Supabase (pgvector) | PostgreSQL extension | Cloud / self-hosted | Existing Supabase projects, SQL familiarity |
| Pinecone | Managed vector DB | Cloud only | Managed, scale-first |
| ChromaDB | Embedded vector DB | Local / Docker | Local development, prototyping |
| Weaviate | Hybrid vector DB | Cloud / self-hosted | Multi-modal, enterprise |
| Qdrant | Vector DB | Cloud / self-hosted | High performance, Rust-based |
| pgvector (raw) | PostgreSQL extension | Self-hosted | Full control, existing Postgres |

**Recommended for most projects**: Supabase with pgvector. It combines SQL querying with vector search in a single managed database, avoiding a separate infrastructure dependency.

### Step 4: Retrieval

At query time, retrieve the top-K most relevant chunks.

#### Retrieval Methods

| Method | Description | When to Use |
|--------|-------------|------------|
| Top-K cosine similarity | Return K chunks with highest vector similarity | Default; works for most cases |
| MMR (Maximal Marginal Relevance) | Balance relevance with diversity to avoid redundant results | When top-K returns near-duplicate chunks |
| Hybrid BM25 + vector | Combine keyword search with semantic search | When exact-match keywords matter (names, codes) |
| Multi-vector | Store multiple embeddings per document (summary + full) | Long documents, hierarchical retrieval |

### Step 5: Prompt Construction

The retrieved chunks become context injected into the LLM prompt.

```python
def build_prompt(query: str, chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(chunks)
    return f"""You are a helpful assistant. Answer the question using only the provided context.
If the context does not contain enough information to answer the question, say so explicitly.

Context:
{context}

Question: {query}

Answer:"""
```

### Step 6: LLM Generation with Claude API

```python
import anthropic

claude = anthropic.Anthropic()

def generate(prompt: str) -> str:
    message = claude.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text
```

---

## Complete Production Pipeline (Supabase + Claude)

The following is a working end-to-end RAG implementation using Supabase pgvector for storage and the Claude API for generation.

### 1. Supabase Schema

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Documents table
create table documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create an index for fast approximate nearest-neighbor search
create index on documents
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Retrieval function
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

### 2. Python Pipeline

```python
import os
import anthropic
from openai import OpenAI
from supabase import create_client, Client
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Clients
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
claude_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)


def embed(text: str) -> list[float]:
    """Generate an embedding vector for a text string."""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def ingest_document(text: str, metadata: dict = None) -> None:
    """Chunk a document and store embeddings in Supabase."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50
    )
    chunks = splitter.split_text(text)

    rows = []
    for chunk in chunks:
        rows.append({
            "content": chunk,
            "embedding": embed(chunk),
            "metadata": metadata or {}
        })

    supabase.table("documents").insert(rows).execute()
    print(f"Ingested {len(rows)} chunks")


def retrieve(query: str, top_k: int = 5, threshold: float = 0.7) -> list[dict]:
    """Retrieve the most relevant document chunks for a query."""
    query_embedding = embed(query)

    result = supabase.rpc("match_documents", {
        "query_embedding": query_embedding,
        "match_threshold": threshold,
        "match_count": top_k
    }).execute()

    return result.data


def build_prompt(query: str, chunks: list[dict]) -> str:
    """Construct a grounded prompt from retrieved chunks."""
    context = "\n\n---\n\n".join(c["content"] for c in chunks)
    return f"""Answer the question using only the provided context.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
{context}

Question: {query}"""


def ask(query: str) -> str:
    """Full RAG pipeline: retrieve → build prompt → generate."""
    chunks = retrieve(query)

    if not chunks:
        return "No relevant documents found."

    prompt = build_prompt(query, chunks)

    message = claude_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text


# Example usage
if __name__ == "__main__":
    # Ingest a document
    with open("my_document.txt") as f:
        ingest_document(f.read(), metadata={"source": "my_document.txt"})

    # Query the knowledge base
    answer = ask("What is the refund policy?")
    print(answer)
```

---

## Common RAG Failures and Fixes

| Failure | Symptom | Fix |
|---------|---------|-----|
| Chunk size too large | LLM ignores most of the context | Reduce chunk size to 256–512 tokens |
| Chunk size too small | Answers lack context, truncated meaning | Increase chunk size; add overlap |
| No reranking | Top-K retrieval returns partially relevant results | Add Cohere reranker after retrieval |
| Context window overflow | API errors or truncated generation | Limit top_k; use a model with larger context |
| Retrieval threshold too low | Irrelevant chunks pollute context | Raise similarity threshold to 0.75–0.80 |
| No overlap between chunks | Information at chunk boundaries lost | Set chunk_overlap to 10–15% of chunk size |
| Single retrieval strategy | Misses exact-match terms | Add BM25 hybrid search |
| Stale embeddings | New documents not reflected | Re-index documents on ingestion, not on schedule |

---

## Advanced Techniques

### Reranking with Cohere

After top-K retrieval, a cross-encoder reranker scores each candidate chunk against the query more accurately than cosine similarity. This improves precision significantly.

```python
import cohere

co = cohere.Client(os.environ["COHERE_API_KEY"])

def rerank(query: str, chunks: list[dict], top_n: int = 3) -> list[dict]:
    documents = [c["content"] for c in chunks]
    results = co.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=top_n
    )
    return [chunks[r.index] for r in results.results]
```

### Hybrid Search (BM25 + Vector)

Combine keyword search with semantic search to handle both exact-match queries (names, codes, dates) and conceptual queries.

```python
# Using Supabase full-text search alongside vector search
def hybrid_retrieve(query: str, top_k: int = 5) -> list[dict]:
    # Vector search
    semantic = retrieve(query, top_k=top_k * 2)

    # Keyword search (PostgreSQL full-text)
    keyword = supabase.table("documents") \
        .select("id, content, metadata") \
        .text_search("content", query) \
        .limit(top_k * 2) \
        .execute().data

    # Merge and deduplicate by id, prefer semantic results
    seen = set()
    merged = []
    for chunk in semantic + keyword:
        if chunk["id"] not in seen:
            seen.add(chunk["id"])
            merged.append(chunk)

    return merged[:top_k]
```

---

## RAG vs Fine-Tuning Decision Matrix

| Criterion | RAG | Fine-Tuning |
|-----------|-----|------------|
| Data freshness | Excellent — update KB at any time | Poor — requires retraining |
| Private/proprietary data | Excellent | Good (data stays in training) |
| Response style / tone | No change from base model | Full control |
| Factual grounding | Excellent (cites sources possible) | Risk of confident hallucination |
| Cost to set up | Medium (infra + embeddings) | High (GPU compute) |
| Cost to update | Low | High |
| Auditability | High (retrieved chunks inspectable) | Low (black-box weights) |
| Best for | Knowledge Q&A, document chat, search | Style adaptation, domain terminology |

**Rule of thumb**: Use RAG when the answer is in a document. Use fine-tuning when you need the model to behave differently, not just know more.

See also: [fine-tuning.md](fine-tuning.md) for a deeper comparison.

---

## RAG Evaluation

Evaluating RAG quality requires measuring two separate components:

| Metric | What It Measures | How to Measure |
|--------|-----------------|----------------|
| Retrieval recall | Were the relevant chunks retrieved? | Manually labeled ground-truth queries |
| Answer faithfulness | Does the answer reflect the retrieved context? | LLM-as-judge (Claude scores agreement) |
| Answer relevance | Does the answer address the question? | Human evaluation or LLM scoring |
| Context precision | Are the retrieved chunks actually useful? | Ratio of used to retrieved chunks |

Tools for RAG evaluation: **RAGAS** (open source), **TruLens**, **LangSmith**.

---

## FAQ

### What chunk size should I use for RAG?

The most commonly recommended default is 512 tokens with 50-token overlap. Use smaller chunks (256 tokens) for precise factual Q&A where you want tight, specific answers. Use larger chunks (1024 tokens) for summarization or when documents have long, interdependent reasoning. Always evaluate empirically on your specific data — there is no universally optimal chunk size.

### RAG vs fine-tuning — which is better?

For most knowledge-retrieval use cases, RAG is better. It is cheaper to set up, easier to update, and more auditable. Fine-tuning is preferable when you need to change the model's behavior, tone, or output format rather than supply it with new facts. Many production systems combine both: a fine-tuned model for style with RAG for knowledge.

### How do I evaluate RAG quality?

Measure retrieval and generation separately. For retrieval: create a labeled test set of questions and verify whether the correct chunks are returned. For generation: use LLM-as-judge to score whether the model's answer is supported by the retrieved context (faithfulness) and whether it addresses the question (relevance). The open-source RAGAS library automates this evaluation.

### Can I build RAG locally for free?

Yes. Use Ollama to run a local LLM (llama3, mistral) and local embeddings (nomic-embed-text), and ChromaDB as a local vector store. The entire pipeline runs on a laptop with no API costs. Performance is lower than hosted models, but the architecture is identical and suitable for development and testing.

```bash
# Install Ollama and pull models
brew install ollama
ollama pull llama3
ollama pull nomic-embed-text

# Install ChromaDB
pip install chromadb ollama
```

### What is the best vector database for RAG?

It depends on your constraints:

- **Supabase (pgvector)**: Best if you already use Supabase or PostgreSQL. Avoids a separate infrastructure dependency.
- **Pinecone**: Best for teams that want a fully managed service with minimal ops overhead and have scale requirements.
- **ChromaDB**: Best for local development and prototyping. Zero setup.
- **Qdrant**: Best for high-throughput production workloads with performance requirements.

For most solo developers and small teams starting a new project, Supabase pgvector is the pragmatic choice.

### What causes RAG hallucination?

RAG does not eliminate hallucination — it reduces it. Common causes: (1) the correct chunk was not retrieved (retrieval failure), causing the model to fall back to its parametric memory; (2) the retrieved chunk is partially relevant but not directly applicable, and the model extrapolates; (3) the model is not instructed to stay within the retrieved context. Mitigate with a strict system prompt, reranking to improve precision, and LLM-as-judge evaluation.

---

## Resources

**Build RAG pipelines with Claude API**

Claude's API supports long context windows (200K tokens for claude-opus-4-5), making it well-suited for retrieval-augmented applications where multiple document chunks need to fit in a single prompt.

- [Claude API — Get Started](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=rag-implementation) — Production-grade LLM for RAG generation. Claude supports tool use, structured output, and large context windows ideal for document Q&A.

**AI Builder Resources**

- [AI Solopreneur Stack PDF](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=rag-implementation) — Curated tools, RAG architectures, and deployment stacks used by independent AI builders in 2026.

## Related Articles

- [Claude API Guide](../tools/claude-api.md)
- [Supabase Guide](../tools/supabase.md)
- [LangChain Guide](../tools/langchain.md)
- [Solopreneur AI Stack](solopreneur-ai-stack.md)
