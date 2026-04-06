# Pinecone — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Pinecone is a managed vector database service specialized for storing and searching high-dimensional embeddings at scale, commonly used for RAG pipelines, semantic search, and recommendation systems.**

Launched in 2021, Pinecone was one of the first purpose-built vector databases to achieve wide adoption in production AI applications. Unlike general-purpose databases extended with vector support, Pinecone's architecture is designed entirely around approximate nearest-neighbor (ANN) search over dense float32 vectors, offering low-latency queries on hundreds of millions of vectors without infrastructure management overhead.

## Core Concepts

### Indexes

An index is the primary storage unit in Pinecone. It holds vectors of a fixed dimension (e.g., 1536 for OpenAI `text-embedding-3-small`) and exposes upsert, query, fetch, and delete operations. Pinecone offers two index types:

- **Serverless indexes**: Automatically scale to zero, billed per operation. Recommended for variable or unpredictable workloads.
- **Pod-based indexes**: Dedicated infrastructure, predictable latency, billed per pod-hour. Recommended for high-throughput production workloads.

### Namespaces

Namespaces provide logical partitioning within a single index. Vectors in different namespaces are isolated — queries scoped to a namespace only search within that partition. A common pattern is per-tenant isolation: each customer's data lives in its own namespace, allowing a single index to serve a multi-tenant application without data leakage.

### Metadata Filtering

Each vector can carry a metadata dictionary (e.g., `{"user_id": "u123", "doc_type": "invoice", "date": "2026-01-15"}`). Queries can include metadata filters to restrict the ANN search to a subset of vectors before ranking by similarity. This enables hybrid retrieval patterns such as "find the 5 most similar documents that belong to user X and were created after 2025."

### Sparse-Dense Hybrid Search

Pinecone supports hybrid indexes that combine dense vector similarity (semantic) with sparse vector scores (keyword BM25-style). Hybrid search improves recall on queries where exact keyword matches matter alongside semantic similarity — a common requirement in enterprise document search.

## Python Quickstart

```python
from pinecone import Pinecone, ServerlessSpec

# Initialize client
pc = Pinecone(api_key="YOUR_API_KEY")

# Create a serverless index (dimension must match your embedding model)
pc.create_index(
    name="my-index",
    dimension=1536,          # OpenAI text-embedding-3-small
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)

# Connect to the index
index = pc.Index("my-index")

# Upsert vectors with metadata
index.upsert(
    vectors=[
        {
            "id": "doc-001",
            "values": [0.12, 0.45, ...],  # 1536-dim embedding
            "metadata": {"text": "Claude is an AI assistant.", "source": "docs"}
        },
        {
            "id": "doc-002",
            "values": [0.88, 0.31, ...],
            "metadata": {"text": "Pinecone stores embeddings.", "source": "blog"}
        }
    ],
    namespace="production"
)

# Query: find 5 most similar vectors
results = index.query(
    vector=[0.10, 0.47, ...],   # query embedding
    top_k=5,
    include_metadata=True,
    namespace="production",
    filter={"source": {"$eq": "docs"}}   # metadata filter
)

for match in results["matches"]:
    print(f"Score: {match['score']:.4f} | Text: {match['metadata']['text']}")
```

## Comparison: Vector Database Options

| Database | Hosting | Performance | Pricing | Best For |
|----------|---------|-------------|---------|----------|
| **Pinecone** | Managed cloud only | Very fast (10–50ms p99) | Free tier + pay-per-use / pod billing | Production RAG, enterprise scale |
| **pgvector (Supabase)** | Self-host or managed | Good (<1M vectors), degrades at scale | Free on Supabase free tier | Small-medium apps, existing PostgreSQL users |
| **Qdrant** | Self-host or cloud | Very fast, on-par with Pinecone | Open source (free self-host) / cloud pricing | Cost-sensitive production, on-prem requirements |
| **Weaviate** | Self-host or cloud | Fast, feature-rich | Open source / cloud pricing | Multi-modal search, GraphQL users |
| **ChromaDB** | Local / self-host | Good for dev/small scale | Open source (free) | Local prototyping, development environments |

### When to Choose Each

**Choose Pinecone** when: you need a fully managed service with zero infrastructure work, your team prioritizes developer velocity over cost, and you are building a production application at scale.

**Choose pgvector (Supabase)** when: you already use PostgreSQL, your vector count is below ~1 million, and you want to avoid a separate service. pgvector handles most RAG use cases at startup scale with no additional cost.

**Choose Qdrant** when: you need production-grade performance without vendor lock-in, have DevOps capacity to manage infrastructure, or have data residency requirements that prevent cloud-only solutions.

**Choose Weaviate** when: your use case involves multi-modal data (text + images), you prefer a GraphQL interface, or you need built-in ML model integrations.

**Choose ChromaDB** when: you are prototyping locally, building a demo, or running a small-scale application that does not need to serve production traffic.

## Pricing

| Plan | Vectors Included | Query Units | Monthly Cost |
|------|-----------------|-------------|-------------|
| **Free (Serverless)** | 100,000 | 1M read units | $0 |
| **Serverless (Standard)** | Unlimited | ~$0.08 / 1M reads | Pay per use |
| **Pod-based (s1.x1)** | ~500K | High throughput | ~$70/month per pod |
| **Pod-based (p2.x1)** | ~500K | Very high throughput | ~$150/month per pod |

*Pricing is approximate as of early 2026. Check Pinecone's pricing page for current rates.*

Serverless indexes are billed by read and write units. Pod-based indexes are billed by pod-hour regardless of usage. For RAG applications with moderate query volume (<10K queries/day), serverless is typically more cost-effective. High-throughput production workloads (>100K queries/day) often favor pods for predictable latency.

## FAQ

### What is Pinecone?

Pinecone is a fully managed vector database purpose-built for similarity search over high-dimensional embeddings. It accepts vectors (arrays of floating-point numbers) produced by embedding models, stores them with optional metadata, and answers nearest-neighbor queries — returning the N most similar vectors to a given query vector. Pinecone is most commonly used as the retrieval component in RAG (Retrieval-Augmented Generation) pipelines, semantic search engines, and recommendation systems.

### Pinecone vs. Supabase pgvector — which is better?

Neither is universally better; the right choice depends on scale and existing infrastructure. pgvector is a PostgreSQL extension that adds vector similarity search to a relational database. It is free, easy to set up in Supabase, and performs well for collections under ~1 million vectors. Pinecone is a dedicated vector database optimized for similarity search at any scale, with consistent low latency and no infrastructure management. If you are already using Supabase and your vector count is in the hundreds of thousands, pgvector is typically the simpler and cheaper option. If you need to serve millions of vectors or require managed scaling without DevOps overhead, Pinecone is the more robust choice.

### Is Pinecone free?

Yes, Pinecone offers a free tier on its serverless plan that includes storage for up to 100,000 vectors and 1 million read units per month. This is sufficient for most development and small production workloads. Larger applications pay based on usage: storage costs scale with the number of vectors stored, and compute costs scale with query volume. There is no free tier for pod-based indexes.

### How many vectors can Pinecone store?

Pinecone imposes no hard upper limit on vectors per account. Serverless indexes scale automatically with storage needs. Pod-based indexes are sized by pod count and pod type — a single `s1.x1` pod stores approximately 500,000 vectors of dimension 1536, and you can add more pods to scale horizontally. In practice, Pinecone supports billions of vectors across enterprise customers. The free tier cap is 100,000 vectors on the serverless plan.

### What is a namespace in Pinecone?

A namespace is a logical partition within a Pinecone index that isolates subsets of vectors. Upsert, query, fetch, and delete operations can be scoped to a specific namespace — operations in one namespace do not affect or see vectors in another. Namespaces enable multi-tenancy patterns where different users, tenants, or data sources share a single index without data leakage. They are also used for A/B testing (different embedding models in different namespaces), environment separation (staging vs. production in one index), and organizing data by category or time period.

## Resources

- **Build RAG apps with Claude API**: [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=pinecone)
- **AI Engineering Handbook (PDF)**: [th19930828.gumroad.com](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=pinecone)

---

*Last updated: April 2026*
