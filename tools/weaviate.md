# Weaviate — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Weaviate is an open-source vector database that combines vector similarity search with structured filtering, multi-modal support (text, images, and audio), and GraphQL/REST/gRPC APIs, designed for production AI applications that require hybrid search and built-in vectorization modules.**

First released in 2019 by SeMI Technologies (now Weaviate B.V.), Weaviate distinguishes itself from other vector databases through three features uncommon in the space: built-in vectorization modules that embed data at write time without external preprocessing, native multi-modal search across text and images in a single index, and a GraphQL interface that allows expressive queries combining semantic search with structured filters. Weaviate is available as open-source software (Apache 2.0) deployable on any infrastructure, or as a managed cloud service (Weaviate Cloud Services, WCS).

## Core Concepts

### Collections

A collection (formerly called a "class" in earlier versions) is the primary data container in Weaviate — analogous to a table in a relational database or an index in Pinecone. Each collection has a defined schema specifying its properties (fields), data types, and which vectorization module to use. Objects within a collection are stored with their vector representations alongside structured property values.

### Objects

An object is a single record within a collection. It has a UUID, a set of properties (key-value pairs matching the schema), and a vector (generated automatically by the configured module, or provided manually). Weaviate supports both automatic vectorization (via modules) and bring-your-own-vector (BYOV) patterns.

### Cross-References

Cross-references link objects across collections — for example, an `Article` object can reference an `Author` object. This relational capability, uncommon in pure vector databases, allows Weaviate to serve as a combined semantic search and knowledge graph backend.

### Vectors and Multi-Vector

Weaviate supports single vectors per object (the default) and named vectors — multiple vector representations per object from different embedding models or modalities. A single document object could carry one vector from a text embedding model and a second from an image embedding model, enabling cross-modal similarity search.

## Built-in Vectorization Modules

Weaviate's module system allows vectorization to happen inside the database at upsert time, eliminating the need for a separate embedding pipeline:

| Module | Provider | Modality | Notes |
|--------|----------|----------|-------|
| `text2vec-openai` | OpenAI | Text | Uses OpenAI embedding API |
| `text2vec-cohere` | Cohere | Text | Uses Cohere embed API |
| `text2vec-ollama` | Ollama | Text | Local models, no API cost |
| `text2vec-transformers` | Hugging Face | Text | Self-hosted transformer |
| `text2vec-google` | Google | Text | Uses Google embedding API |
| `img2vec-neural` | Built-in | Images | ResNet-based image embeddings |
| `multi2vec-clip` | Built-in | Text + Images | CLIP model for cross-modal search |
| `multi2vec-google` | Google | Text + Images | Gemini multimodal embeddings |

When a module is configured, inserting an object with text or image data automatically generates and stores the vector — no separate call to an embedding API is needed.

## Python Quickstart

### Connect and Query

```python
import weaviate

# Connect to a local Weaviate instance (Docker)
client = weaviate.connect_to_local()

# Get a reference to an existing collection
collection = client.collections.get("Article")

# Semantic search: find 5 articles most similar to a query
results = collection.query.near_text(
    query="machine learning applications in healthcare",
    limit=5
)

for obj in results.objects:
    print(obj.properties["title"])
    print(f"Distance: {obj.metadata.distance:.4f}")

client.close()
```

### Create a Collection and Insert Objects

```python
import weaviate
import weaviate.classes as wvc

client = weaviate.connect_to_local()

# Create a collection with OpenAI text vectorization
client.collections.create(
    name="Article",
    vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_openai(),
    properties=[
        wvc.config.Property(name="title", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="body", data_type=wvc.config.DataType.TEXT),
        wvc.config.Property(name="category", data_type=wvc.config.DataType.TEXT),
    ]
)

collection = client.collections.get("Article")

# Insert objects — vectors generated automatically by text2vec-openai
collection.data.insert_many([
    {"title": "Introduction to RAG", "body": "RAG combines retrieval...", "category": "AI"},
    {"title": "Vector Databases Explained", "body": "A vector database stores...", "category": "Infrastructure"},
])

client.close()
```

### Hybrid Search

Hybrid search combines dense vector similarity (semantic) with sparse BM25 keyword scoring:

```python
results = collection.query.hybrid(
    query="vector search performance",
    alpha=0.5,   # 0 = pure BM25, 1 = pure vector, 0.5 = balanced
    limit=10
)
```

### Filtered Vector Search

```python
from weaviate.classes.query import Filter

results = collection.query.near_text(
    query="deep learning",
    limit=5,
    filters=Filter.by_property("category").equal("AI")
)
```

## Deployment Options

### Docker (Local Development)

```yaml
# docker-compose.yml
version: '3.4'
services:
  weaviate:
    image: cr.weaviate.io/semitechnologies/weaviate:1.25.0
    ports:
      - "8080:8080"
      - "50051:50051"
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      ENABLE_MODULES: 'text2vec-openai,generative-openai'
      OPENAI_APIKEY: ${OPENAI_APIKEY}
    volumes:
      - weaviate_data:/var/lib/weaviate

volumes:
  weaviate_data:
```

Run with: `docker compose up -d`

### Kubernetes

Weaviate provides an official Helm chart (`weaviate/weaviate`) for Kubernetes deployment with horizontal scaling, persistent volumes, and module configuration. The Helm chart supports replica configuration for high availability and resource limits for cost control.

### Weaviate Cloud Services (WCS)

WCS is the managed cloud offering — no infrastructure management, automatic scaling, built-in backups, and SLA guarantees. Available on AWS (us-east, eu-west) and GCP. Clusters are provisioned via the WCS console or API.

## Comparison: Vector Database Options

| Database | Self-Host | Multi-Modal | GraphQL | Hybrid Search | Free Tier |
|----------|-----------|-------------|---------|---------------|-----------|
| **Weaviate** | Yes | Yes (text + image) | Yes | Yes | WCS Sandbox (14-day) |
| **Pinecone** | No | No | No | Yes | 100K vectors free |
| **Qdrant** | Yes | No | No | Yes | Cloud free tier |
| **pgvector** | Yes | No | No | No (manual) | PostgreSQL free |
| **Chroma** | Yes | No | No | No | Open source |

### When to Choose Each

**Choose Weaviate** when: your use case involves multi-modal data (text + images), you want built-in vectorization modules to simplify your pipeline, you need a GraphQL interface for complex queries, or you require cross-references between object types.

**Choose Pinecone** when: you need a fully managed service with no infrastructure management, simple upsert/query operations are sufficient, and developer velocity matters more than cost.

**Choose Qdrant** when: you need the highest query performance on a self-hosted deployment, you have Rust-native infrastructure, or you want a simpler REST API without GraphQL overhead.

**Choose pgvector** when: your application already uses PostgreSQL and your vector collection is below ~1 million records. pgvector colocates vector search with relational data, eliminating an additional service dependency.

**Choose Chroma** when: you are prototyping locally or building a small-scale application that does not need to serve production traffic. Chroma has the simplest setup (Python-native, no Docker required) but limited horizontal scaling.

## Pricing

| Option | Vectors | Cost | Notes |
|--------|---------|------|-------|
| **Open source (self-hosted)** | Unlimited | Infrastructure cost only | Apache 2.0 license |
| **WCS Sandbox** | Up to 1M | Free (14-day trial) | For development/testing |
| **WCS Serverless** | Pay per use | ~$0.095 / 1M dimensions stored/month | GA as of 2024 |
| **WCS Standard** | Dedicated | From ~$25/month | Small dedicated cluster |
| **WCS Enterprise** | Dedicated | Custom pricing | SLA, support, compliance |

Self-hosting on a small VM (2 vCPU, 4GB RAM) handles collections of ~500K vectors with reasonable query latency at a cost equivalent to the VM price (~$20–40/month on most cloud providers).

## FAQ

### What is Weaviate?

Weaviate is an open-source vector database designed for building AI-powered search and retrieval applications. It stores objects (documents, images, records) alongside their vector representations — dense numerical arrays that encode semantic meaning — and answers similarity queries by finding the objects whose vectors are nearest to a query vector. Weaviate extends beyond a pure vector database by providing built-in vectorization (you insert text or images and Weaviate generates the vectors via configurable modules), multi-modal support, structured metadata filtering, and a GraphQL interface for expressive queries. It is commonly used as the retrieval component in RAG pipelines, semantic search engines, recommendation systems, and knowledge graph applications.

### Weaviate vs. Pinecone — which is better?

The choice depends on your requirements. Pinecone is a fully managed cloud-only service with a simple API optimized for similarity search. It requires no infrastructure management, scales automatically, and is well-suited for teams that want to move quickly without DevOps overhead. Weaviate is more feature-rich: it supports multi-modal search, built-in vectorization modules, cross-references between object types, and a GraphQL query interface. Weaviate can be self-hosted for cost control or used via WCS. For straightforward RAG pipelines where you only need vector storage and similarity search, Pinecone's simpler API is often faster to implement. For complex data models with mixed modalities, structured filtering requirements, or on-premise deployment needs, Weaviate is the stronger choice.

### Does Weaviate support multi-modal search?

Yes. Weaviate natively supports multi-modal search through the `multi2vec-clip` module (CLIP model for text-image cross-modal search) and `multi2vec-google` (Gemini multimodal embeddings). With these modules, you can index both text and images in the same collection using a shared embedding space, enabling queries like "find images similar to this text description" or "find text documents similar to this image." Additionally, Weaviate's named vectors feature allows a single object to carry multiple vector representations from different models, enabling parallel similarity searches across different modalities.

### Is Weaviate free?

Yes, in two ways. First, the core Weaviate software is open-source under the Apache 2.0 license — you can run it on your own infrastructure at no software cost (you pay only for the underlying compute and storage). Second, Weaviate Cloud Services (WCS) offers a Sandbox environment for development and testing. For production usage on WCS, costs depend on storage and query volume. Self-hosting on a small VM is often the most cost-effective option for teams with DevOps capacity, as Weaviate can be deployed with a single Docker Compose file and requires modest resources for collections under ~1 million vectors.

### How do I run Weaviate locally?

The simplest way to run Weaviate locally is with Docker Compose. Create a `docker-compose.yml` file using the configuration in the Deployment section above, then run `docker compose up -d`. Weaviate will be available at `http://localhost:8080` (REST and GraphQL) and `localhost:50051` (gRPC). Install the Python client with `pip install weaviate-client` and connect with `weaviate.connect_to_local()`. For development without Docker, Weaviate's embedded mode (`weaviate.connect_to_embedded()`) launches an in-process instance directly from Python — useful for unit tests and notebooks. Production deployments should use Docker or Kubernetes with persistent volumes.

## Resources

- **Build AI apps with Claude API**: [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=weaviate)
- **AI Engineering Handbook (PDF)**: [th19930828.gumroad.com](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=weaviate)

---

*Last updated: April 2026*
