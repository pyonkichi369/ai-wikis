# AI-Powered Search — Build Semantic Search 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI-powered search (semantic search) uses text embeddings and vector similarity to find conceptually relevant results rather than exact keyword matches — enabling search that understands meaning, synonyms, and context across documents, products, or any text corpus.**

## Keyword vs Semantic vs Hybrid Search

| Approach | How It Works | Best For | Limitation |
|---------|-------------|---------|-----------|
| Keyword (BM25) | TF-IDF term frequency matching | Exact terms, legal docs, product codes | No understanding of meaning or synonyms |
| Semantic (vector) | Embedding cosine similarity | Concepts, questions, natural language | Can miss exact-match terms |
| Hybrid | BM25 + vector combined, reranked | Most production use cases | More complex setup and infrastructure |

**When keyword search fails**: A user searching "how to cancel my subscription" will not match documents titled "Account termination process" with keyword search. Semantic search understands both phrases describe the same intent.

**When semantic search fails**: A user searching for product code "XR-4421" needs exact match. Cosine similarity over embeddings may return semantically "similar" products that are actually wrong items.

**Hybrid search** combines both: retrieve candidates from keyword and vector search, then merge and rerank. This is the standard approach for production search systems in 2026.

---

## Vector Dimensions: Accuracy vs Performance

The embedding model's output dimension affects both retrieval quality and storage/compute cost.

| Dimension | Example Models | Index Size | Speed | Quality |
|-----------|---------------|-----------|-------|---------|
| 384 | all-MiniLM-L6-v2, nomic-embed-text | Small | Fast | Good for short texts, Q&A |
| 768 | nomic-embed-text-v1.5, Cohere embed-english | Medium | Medium | Strong balanced performance |
| 1536 | OpenAI text-embedding-3-small | Medium | Medium | Widely adopted, good baseline |
| 3072 | OpenAI text-embedding-3-large | Large | Slower | Highest accuracy, use for precision-critical tasks |

**Default recommendation**: OpenAI `text-embedding-3-small` (1536 dimensions) for most applications. Strong baseline, wide ecosystem support, cost-effective at $0.02/1M tokens. Switch to 3-large only if evaluation shows meaningful accuracy gains for your specific data.

---

## Database and Indexing: HNSW vs IVFFlat

Vector databases use approximate nearest-neighbor (ANN) indexes for fast similarity search at scale.

| Index Type | Algorithm | Build Time | Query Speed | Accuracy | Best For |
|-----------|-----------|-----------|------------|---------|---------|
| HNSW | Hierarchical Navigable Small World | Slow | Very fast | High | Production, < 10M vectors |
| IVFFlat | Inverted File Index | Fast | Medium | Medium | Millions of vectors, lower memory |
| Exact (no index) | Brute force cosine | None | Slow | Perfect | < 10K vectors, development |

For most production applications under 1 million documents, HNSW provides the best query performance. For datasets over 10 million vectors, IVFFlat with tuned `nlist` parameter is more memory-efficient.

---

## Full Implementation: Supabase pgvector + OpenAI + Next.js

### Step 1: Supabase Schema

```sql
-- Enable pgvector extension
create extension if not exists vector;
create extension if not exists pg_trgm;  -- For hybrid BM25 search

-- Documents table with vector column
create table documents (
  id         bigserial primary key,
  content    text not null,
  embedding  vector(1536),
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);

-- HNSW index for fast approximate nearest-neighbor search
create index on documents
using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);

-- Full-text search index for keyword component of hybrid search
create index on documents using gin(to_tsvector('english', content));

-- Vector similarity search function
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.70,
  match_count int default 10
)
returns table (
  id       bigint,
  content  text,
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

### Step 2: Document Ingestion (Python)

```python
import os
from openai import OpenAI
from supabase import create_client

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)


def embed(text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def ingest(content: str, metadata: dict = None) -> None:
    """Embed a document and store in Supabase."""
    vector = embed(content)
    supabase.table("documents").insert({
        "content": content,
        "embedding": vector,
        "metadata": metadata or {}
    }).execute()
```

### Step 3: Semantic Search Query (Python)

```python
def semantic_search(query: str, top_k: int = 5, threshold: float = 0.70) -> list[dict]:
    """Return top-K semantically similar documents for a query."""
    query_vector = embed(query)

    result = supabase.rpc("match_documents", {
        "query_embedding": query_vector,
        "match_threshold": threshold,
        "match_count": top_k
    }).execute()

    return result.data


# Example
results = semantic_search("how do I stop my subscription")
for r in results:
    print(f"[{r['similarity']:.2f}] {r['content'][:80]}")
```

### Step 4: Hybrid Search (BM25 + Vector)

```python
def hybrid_search(query: str, top_k: int = 10) -> list[dict]:
    """Combine vector search and keyword search, deduplicate by id."""
    # Vector search
    semantic_results = semantic_search(query, top_k=top_k * 2)

    # Keyword (full-text) search via Supabase
    keyword_results = (
        supabase.table("documents")
        .select("id, content, metadata")
        .text_search("content", query, config="english")
        .limit(top_k * 2)
        .execute()
        .data
    )

    # Merge, deduplicate, semantic results take priority
    seen_ids = set()
    merged = []
    for doc in semantic_results + keyword_results:
        if doc["id"] not in seen_ids:
            seen_ids.add(doc["id"])
            merged.append(doc)

    return merged[:top_k]
```

### Step 5: Reranking with Cohere

Vector similarity (cosine distance) is a fast approximation. Cohere's cross-encoder reranker provides higher precision by scoring each candidate against the query directly.

```python
import cohere

co = cohere.Client(os.environ["COHERE_API_KEY"])


def rerank(query: str, candidates: list[dict], top_n: int = 5) -> list[dict]:
    """Rerank hybrid search results using Cohere cross-encoder."""
    if not candidates:
        return []

    documents = [c["content"] for c in candidates]

    results = co.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=top_n
    )

    return [candidates[r.index] for r in results.results]


def search(query: str, top_k: int = 5) -> list[dict]:
    """Full pipeline: hybrid retrieval → rerank → return top-K."""
    candidates = hybrid_search(query, top_k=top_k * 3)
    return rerank(query, candidates, top_n=top_k)
```

### Step 6: Next.js API Route

Wire the Python pipeline to a Next.js route by calling the Supabase `match_documents` RPC with the OpenAI-generated query embedding. The pattern is identical to the Python steps above: embed the query with `openai.embeddings.create`, pass the vector to `supabase.rpc("match_documents", {...})`, and return the results as JSON. Install `openai` and `@supabase/supabase-js` via npm and pass `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` as environment variables.

---

## Performance at Scale

| Dataset Size | Recommended Index | Configuration | Notes |
|-------------|------------------|--------------|-------|
| < 10K vectors | Exact (no index) | None | Brute force is fast enough |
| 10K – 1M vectors | HNSW | `m=16, ef_construction=64` | Best query speed |
| 1M – 10M vectors | IVFFlat | `lists=1000` | More memory-efficient |
| > 10M vectors | Dedicated DB (Pinecone, Qdrant) | Per-provider | pgvector not recommended |

**Tuning tips**: Set `match_threshold` to 0.70–0.75 to filter noise. Retrieve 2–3x your final K before reranking — reranking top-50 and returning top-5 outperforms direct top-5 vector retrieval. For bulk ingestion, use the batch embeddings endpoint (up to 2,048 texts per request).

---

## FAQ

### What is semantic search?

Semantic search is a retrieval method that finds results based on meaning rather than exact word matching. It works by converting text — both the documents in the index and the user's query — into dense numerical vectors called embeddings using a language model. When a query is issued, its embedding is compared against all document embeddings using cosine similarity. Documents with embeddings geometrically close to the query embedding are returned as results, regardless of whether they share specific words. This allows semantic search to match "how do I end my account" with a document about "subscription cancellation" even though none of the words overlap. The quality of semantic search depends on the embedding model's ability to encode meaning accurately.

### How do I build AI-powered search?

Building semantic search requires four components: (1) an embedding model to convert text to vectors (OpenAI `text-embedding-3-small` or an open-source alternative like `nomic-embed-text`), (2) a vector database to store and index embeddings (Supabase pgvector, Pinecone, or Qdrant), (3) an ingestion pipeline that embeds documents and stores them with metadata, and (4) a query pipeline that embeds the search query and performs similarity search against the stored vectors. For production systems, add a reranker (Cohere) to improve precision and hybrid search (BM25 + vector) to handle exact-match queries. The full implementation with Supabase pgvector and Python is described in the code examples above. Expected build time for a working prototype is 1–2 days; production-grade with hybrid search and reranking takes 1–2 weeks.

### What is the best vector database for search?

The best vector database depends on scale and stack. For projects under 1 million documents already using Supabase or PostgreSQL, Supabase pgvector is the pragmatic choice — it eliminates a separate infrastructure dependency and supports HNSW indexes, hybrid BM25 search, and SQL filtering in the same database. For applications requiring a fully managed service with minimal ops overhead and datasets up to 100 million vectors, Pinecone is the standard choice. For high-performance self-hosted deployments, Qdrant (Rust-based, ~2x faster than pgvector at scale) and Weaviate (strong multi-modal and hybrid search support) are the leading alternatives. ChromaDB is the easiest option for local development and prototyping with zero configuration overhead.

### Semantic search vs keyword search — which is better?

Neither is universally better; they are complementary. Semantic search outperforms keyword search for natural language queries, questions, concept-based retrieval, and cases where users phrase queries differently than documents are written. Keyword search (BM25) outperforms semantic search for exact-match requirements: product codes, proper nouns, technical identifiers, legal citations. In benchmark evaluations (BEIR dataset), hybrid search that combines BM25 and vector retrieval with reranking consistently outperforms either approach alone across most retrieval tasks. For most production search applications, implement hybrid search from the start rather than choosing one or the other.

### How do I implement hybrid search?

Hybrid search merges results from two retrieval methods — vector similarity and keyword (BM25) — then reranks the merged candidate set. The standard implementation is: (1) run vector search and keyword search in parallel, retrieving 2–3x more candidates than your final K; (2) deduplicate results by document ID; (3) pass the merged candidates to a cross-encoder reranker (Cohere rerank-english-v3.0 is the most widely used) to rescore each candidate against the query; (4) return the top-K from the reranked results. In Supabase, keyword search uses PostgreSQL full-text search (`text_search`) on a `gin` index, and vector search uses the `match_documents` RPC function. The Python implementation of this pattern is shown in the code examples above.

---

## Resources

**Build semantic search with Claude API**

For search applications that generate summaries, answers, or explanations from retrieved results, Claude API provides the generation layer on top of your retrieval pipeline.

- [Claude API — Get Started](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-powered-search) — Production LLM for generating answers from retrieved search results. 200K context window supports including many retrieved chunks in a single prompt.

**AI Builder Resources**

- [AI Solopreneur Stack PDF](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-powered-search) — Embedding models, vector databases, and search architectures used by independent AI builders in 2026.

## Related Articles

- [RAG Implementation Guide](rag-implementation.md)
- [Supabase Guide](../tools/supabase.md)
- [Pinecone Guide](../tools/pinecone.md)
- [Embeddings Guide](../concepts/embeddings.md)
- [Vector Database Guide](../concepts/vector-database.md)
