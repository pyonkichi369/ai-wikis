# RAG — Retrieval-Augmented Generation Guide

**RAG (Retrieval-Augmented Generation)** is an AI architecture pattern that combines a large language model (LLM) with an external knowledge retrieval system. Instead of relying solely on the model's training data, RAG retrieves relevant documents at query time and provides them as context to the LLM, enabling accurate, up-to-date, and source-cited responses.

## How RAG Works

```
User Query
    ↓
1. Embed query → vector representation
    ↓
2. Search vector database → retrieve top-K relevant chunks
    ↓
3. Construct prompt: [retrieved context] + [user query]
    ↓
4. LLM generates answer grounded in retrieved context
    ↓
Response with citations
```

## Core Components

| Component | Purpose | Popular Options |
|-----------|---------|----------------|
| Embedding model | Convert text to vectors | OpenAI ada-002, BGE, E5 |
| Vector database | Store and search embeddings | Pinecone, Weaviate, Chroma, pgvector |
| Document chunker | Split docs into searchable pieces | LangChain TextSplitter, LlamaIndex |
| LLM | Generate final answer | Claude, GPT-4, Gemini |
| Reranker | Improve retrieval precision | Cohere Rerank, BGE Reranker |

## Quick Implementation (Python)

```python
import anthropic
from sentence_transformers import SentenceTransformer
import chromadb

# Setup
client = anthropic.Anthropic()
embedder = SentenceTransformer("all-MiniLM-L6-v2")
db = chromadb.Client()
collection = db.create_collection("knowledge_base")

# Index documents
documents = ["Claude API supports 200K token context.", "RAG improves factual accuracy."]
embeddings = embedder.encode(documents).tolist()
collection.add(documents=documents, embeddings=embeddings, ids=["1", "2"])

# Query
def rag_query(question: str) -> str:
    query_embedding = embedder.encode([question]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=2)
    context = "\n".join(results["documents"][0])
    
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {question}"
        }]
    )
    return response.content[0].text

print(rag_query("What is the Claude API context limit?"))
```

## RAG vs. Fine-Tuning

| Dimension | RAG | Fine-Tuning |
|-----------|-----|------------|
| Update knowledge | Real-time | Requires retraining |
| Cost | Low (retrieval) | High (GPU training) |
| Hallucination | Reduced | Not addressed |
| Source citation | Natural | Not built-in |
| Setup complexity | Medium | High |
| Best for | Dynamic data, Q&A | Style/format adaptation |

## Advanced RAG Patterns

### Hybrid Search
Combine vector similarity with keyword search (BM25) for better recall:
- Dense retrieval: semantic similarity
- Sparse retrieval: exact keyword match
- Score fusion: combine both rankings

### Agentic RAG
Agent decides when and what to retrieve:
```
Query → Is this in my knowledge? 
  → Yes: retrieve and answer
  → No: search web → retrieve → answer
  → Uncertain: retrieve + acknowledge uncertainty
```

### Multi-hop RAG
For complex questions requiring multiple retrieval steps:
```
"Who founded the company that made Claude?"
Step 1: Retrieve → "Claude is made by Anthropic"
Step 2: Retrieve → "Anthropic was founded by Dario Amodei and Daniela Amodei"
Combine → Final answer
```

## Frequently Asked Questions

**Q: What is RAG in AI?**
A: RAG (Retrieval-Augmented Generation) is an architecture where an AI model retrieves relevant documents from a knowledge base before generating a response, improving accuracy and enabling source citation.

**Q: Why use RAG instead of a larger context window?**
A: RAG scales to millions of documents (impossible in context), reduces cost (only retrieve relevant chunks), improves precision (relevant context only), and supports real-time knowledge updates without retraining.

**Q: What is the best vector database for RAG?**
A: For production: Pinecone (managed, easy to scale) or pgvector (PostgreSQL extension, if already using Postgres). For development: Chroma (local, Python-native, free).

**Q: Does RAG eliminate hallucinations?**
A: RAG significantly reduces hallucinations for knowledge-grounded questions but does not eliminate them. The LLM can still misinterpret retrieved context. Grounding prompts and citation requirements reduce this further.

**Q: How do I start building a RAG system?**
A: 1) Index your documents with an embedding model, 2) Store in a vector DB (start with Chroma locally), 3) At query time, retrieve top-K chunks, 4) Pass to Claude API with context. See [Claude API guide](../tools/claude-api.md).

## Resources

- Claude API (for RAG generation): [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg)
- AI Agent Prompts Pack (RAG agent prompts included): [belleofficial.gumroad.com](https://belleofficial.gumroad.com)
- Related: [AI Agent](ai-agent.md) · [Prompt Engineering](prompt-engineering.md)
