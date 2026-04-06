> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

# Embeddings (Text Embeddings) — Complete Guide 2026

**Text embeddings are dense numerical vector representations of text that encode semantic meaning, enabling computers to measure the conceptual similarity between pieces of language by comparing positions in a high-dimensional vector space.**

Embeddings are a foundational primitive in modern AI systems. They are the layer that converts unstructured text into a form that algorithms can reason about mathematically — powering semantic search, retrieval-augmented generation (RAG), recommendation engines, classification pipelines, and clustering workflows.

---

## Table of Contents

1. [How Embeddings Work](#how-embeddings-work)
2. [Dimensions and What They Mean](#dimensions-and-what-they-mean)
3. [Distance Metrics](#distance-metrics)
4. [Embedding Model Comparison](#embedding-model-comparison)
5. [Use Cases](#use-cases)
6. [Local vs. API-Based Embeddings](#local-vs-api-based-embeddings)
7. [Vector Storage Options](#vector-storage-options)
8. [FAQ](#faq)
9. [Resources](#resources)

---

## How Embeddings Work

### Step 1: Tokenization
Input text is split into tokens — subword units that represent common character sequences. The tokenizer maps the input to a sequence of integer IDs. For example, the sentence "semantic search" might tokenize to `[7898, 2834, 3167]` depending on the vocabulary.

### Step 2: Transformer Encoding
The token IDs are passed through a transformer encoder (the same architecture used in BERT, RoBERTa, and related models). Each layer applies self-attention, allowing the model to learn contextual relationships between all tokens simultaneously. The output is a context-aware representation of each token.

### Step 3: Pooling
To produce a single vector for an entire input (rather than one vector per token), pooling aggregates token representations. Common strategies include:
- **Mean pooling:** Average all token vectors. Most commonly used for embedding models.
- **CLS token pooling:** Use the representation of the special `[CLS]` token prepended to the input. Used in BERT-style models.
- **Max pooling:** Take the maximum value across each dimension.

### Step 4: Normalization (Optional)
Many embedding models normalize output vectors to unit length (L2 norm = 1). This makes cosine similarity equivalent to dot product and simplifies distance computation.

### The Output
The result is a single dense vector — an array of floating-point numbers — with a fixed length determined by the model (e.g., 768, 1536, or 3072 dimensions). Semantically similar texts produce vectors that are close together in this space; dissimilar texts produce vectors that are far apart.

---

## Dimensions and What They Mean

Dimensionality refers to the number of floating-point values in the output vector. Higher dimensionality generally allows the model to encode more nuanced semantic distinctions, at the cost of increased storage and computation.

| Dimensions | Typical Use | Storage per Vector | Examples |
|---|---|---|---|
| 384 | Lightweight local models | ~1.5 KB | all-MiniLM-L6-v2 |
| 768 | Standard BERT-class models | ~3 KB | nomic-embed-text, text-embedding-ada-002 (legacy) |
| 1536 | OpenAI text-embedding-3-small | ~6 KB | OpenAI text-embedding-3-small |
| 3072 | High-precision retrieval | ~12 KB | OpenAI text-embedding-3-large |
| 4096 | Cohere large embeddings | ~16 KB | Cohere embed-v3-large (multilingual) |

For most RAG and semantic search applications, 768–1536 dimensions offer a good balance of performance and cost. Benchmarks on the MTEB leaderboard show diminishing returns beyond 3072 dimensions for most English-language retrieval tasks.

**Matryoshka Representation Learning (MRL):** Some newer models (including OpenAI's text-embedding-3 series) support dimensionality reduction — you can truncate the vector to a smaller size (e.g., 256 dimensions) and still retain most of the semantic information. This allows flexible storage/performance tradeoffs.

---

## Distance Metrics

### Cosine Similarity
Measures the angle between two vectors, regardless of their magnitude. Returns a value from -1 (opposite) to 1 (identical). The standard metric for text embeddings.

```
cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
```

For normalized vectors (unit length), cosine similarity reduces to a simple dot product, which is computationally cheaper.

### Dot Product
The sum of element-wise products of two vectors. Faster to compute than cosine similarity, and equivalent to it for unit-normalized vectors. Used when performance is critical and vectors are pre-normalized.

### L2 (Euclidean) Distance
The straight-line distance between two points in vector space. Less commonly used for text embeddings because it is sensitive to vector magnitude. Some models and libraries default to L2; verify the recommended metric for each model.

### Which Metric to Use
Use **cosine similarity** as the default for text embedding models unless the model documentation specifies otherwise. For models that output normalized vectors (most API-based models), dot product is equivalent and faster.

---

## Embedding Model Comparison

| Model | Provider | Dimensions | Max Input Tokens | Cost (per 1M tokens) | MTEB Score | Best For |
|---|---|---|---|---|---|---|
| text-embedding-3-large | OpenAI | 3072 (truncatable) | 8191 | ~$0.13 | 64.6 | High-precision retrieval |
| text-embedding-3-small | OpenAI | 1536 (truncatable) | 8191 | ~$0.02 | 62.3 | Cost-efficient RAG |
| embed-v3 (English) | Cohere | 1024 | 512 | ~$0.10 | 64.5 | Enterprise search |
| embed-v3 (Multilingual) | Cohere | 1024 | 512 | ~$0.10 | 62.0 | Multilingual retrieval |
| nomic-embed-text v1.5 | Nomic / Ollama | 768 | 8192 | Free (local) | 62.4 | Local / free deployments |
| text-embedding-004 | Google | 768 | 3072 | Free (Vertex quota) | 61.0 | Google Cloud integrations |
| all-MiniLM-L6-v2 | HuggingFace | 384 | 256 | Free (local) | 56.3 | Edge / low-resource |

> **MTEB Score:** Massive Text Embedding Benchmark average across retrieval, clustering, classification, and reranking tasks. Scores as of early 2026; check [huggingface.co/spaces/mteb/leaderboard](https://huggingface.co/spaces/mteb/leaderboard) for current rankings.

---

## Use Cases

### Semantic Search
Traditional keyword search matches exact words. Semantic search uses embeddings to find documents that are conceptually similar to a query, even if they share no exact words.

**Example:** A query for "how to cancel my subscription" returns results about "account termination procedures" because both map to similar regions of the vector space.

### Retrieval-Augmented Generation (RAG)
RAG pipelines embed both a knowledge base and incoming queries. The top-k most similar documents are retrieved and injected into the LLM prompt as context, grounding the model's response in specific source material. Embeddings are the retrieval layer in every RAG system.

### Recommendation Systems
Embed user preferences and item descriptions in the same vector space. Items closest to a user's preference vector are recommended. This approach is model-driven and does not require collaborative filtering data.

### Text Classification
Embed labeled examples and new inputs. Use k-nearest neighbors (k-NN) in vector space to classify new text based on the nearest labeled examples. Effective for zero-shot and few-shot classification.

### Clustering and Topic Discovery
Embed a corpus of documents and apply clustering algorithms (k-means, HDBSCAN) to discover natural topic groupings without predefined labels. Useful for analyzing customer feedback, support tickets, or research literature.

### Duplicate and Near-Duplicate Detection
Documents with very high cosine similarity (e.g., > 0.95) are likely duplicates or near-duplicates. This approach is more robust than exact string matching for detecting paraphrased or lightly edited content.

### Anomaly Detection
Texts that fall far from all cluster centroids in embedding space may represent anomalous inputs — useful for detecting out-of-scope queries in chatbots or unusual entries in data pipelines.

---

## Local vs. API-Based Embeddings

| Factor | Local (e.g., nomic-embed-text via Ollama) | API-Based (e.g., OpenAI, Cohere) |
|---|---|---|
| Cost | Free after hardware | Pay-per-token |
| Privacy | Data never leaves your infrastructure | Data sent to third-party |
| Latency | Depends on hardware; GPU recommended | Low, managed infrastructure |
| Setup | Requires Ollama or HuggingFace Transformers | API key + HTTP call |
| Model quality | Strong (nomic-embed-text is competitive) | Slightly higher on benchmarks |
| Scalability | Limited by local hardware | Scales on demand |
| Best for | Privacy-sensitive data, cost control, dev/test | Production at scale, highest accuracy |

### Running nomic-embed-text Locally

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model
ollama pull nomic-embed-text

# Embed via REST API
curl http://localhost:11434/api/embeddings \
  -d '{"model": "nomic-embed-text", "prompt": "semantic search"}'
```

nomic-embed-text v1.5 with 768 dimensions scores competitively with OpenAI's text-embedding-3-small on MTEB while running entirely on local hardware.

---

## Vector Storage Options

| Database | Type | Managed | Best For | Key Features |
|---|---|---|---|---|
| pgvector (Supabase) | PostgreSQL extension | Yes (Supabase cloud) | Full-stack apps with existing Postgres | SQL + vector in one DB, HNSW index |
| Pinecone | Purpose-built vector DB | Yes (cloud) | High-scale production retrieval | Real-time upsert, metadata filtering |
| ChromaDB | Embedded / server | Self-hosted or local | Development, local RAG | Simple Python API, no infra setup |
| Weaviate | Vector DB | Self-hosted or cloud | Multi-modal, hybrid search | GraphQL API, built-in vectorizers |
| Qdrant | Vector DB | Self-hosted or cloud | High performance, filtering | Rust-based, rich payload filtering |
| Milvus | Vector DB | Self-hosted or cloud | Enterprise-scale | Billion-scale, distributed |

For most applications starting out: **ChromaDB** for local development, **Supabase pgvector** for production (if already on Postgres), or **Pinecone** for dedicated high-scale retrieval.

---

## FAQ

**What is the difference between embeddings and fine-tuning?**

Embeddings and fine-tuning solve different problems. An embedding model converts text into a vector for comparison — it does not generate new text. Fine-tuning adjusts a generative model's weights so it produces different outputs on a specific task or in a specific style. You might use embeddings to build a retrieval system that feeds context to a fine-tuned model, but they operate at different layers. Embeddings are cheaper to produce and do not require a training step; fine-tuning requires a labeled dataset and GPU compute time.

**How many dimensions do embeddings need?**

For most production RAG and semantic search applications, 768–1536 dimensions is the practical sweet spot. Models in this range (OpenAI text-embedding-3-small at 1536, nomic-embed-text at 768) achieve MTEB scores within a few points of much larger models while keeping storage and query latency manageable. If storage cost is a concern, models supporting Matryoshka dimensionality reduction can be truncated to 256–512 dimensions with relatively small accuracy loss. For highly specialized or multilingual use cases, higher-dimensional models like text-embedding-3-large may be worth the cost.

**What is cosine similarity?**

Cosine similarity is a mathematical measure of the angle between two vectors in a multi-dimensional space. It returns a value between -1 and 1: a score near 1 means the vectors point in nearly the same direction (semantically similar), a score near 0 means they are orthogonal (unrelated), and a score near -1 means they are opposite in meaning. For text embeddings, two sentences that mean nearly the same thing will have cosine similarity above 0.85–0.90; completely unrelated texts typically score below 0.3.

**Can I run embeddings locally for free?**

Yes. Several high-quality embedding models run locally via Ollama or the HuggingFace Transformers library. `nomic-embed-text` (via Ollama) provides 768-dimensional embeddings competitive with API-based models at no per-token cost, running on consumer hardware. `all-MiniLM-L6-v2` (via sentence-transformers) is lighter and runs well on CPU. The primary tradeoffs versus API-based models are: initial setup time, hardware resource consumption, and slightly lower benchmark scores on specialized tasks.

**How are embeddings stored and queried efficiently?**

Raw embedding search across large datasets (millions of vectors) requires approximate nearest neighbor (ANN) algorithms — comparing a query vector against every stored vector sequentially is too slow. ANN indexes such as HNSW (Hierarchical Navigable Small World), IVF (Inverted File), and PQ (Product Quantization) trade a small amount of recall accuracy for dramatically faster query times. Most vector databases (Pinecone, Weaviate, Qdrant, pgvector with HNSW enabled) handle ANN indexing automatically.

---

## Resources

### Try Claude API

Claude's API supports tool use and RAG pipelines — build embedding-powered applications with Claude as the generation layer.

[Try Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=embeddings)

### AI Practical Toolkit (Gumroad)

RAG implementation templates, embedding pipeline examples, and vector database setup guides.

[AI Practical Toolkit →](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=embeddings)

---

*Last updated: April 2026. See [AFFILIATES.md](../AFFILIATES.md) for disclosure details.*
