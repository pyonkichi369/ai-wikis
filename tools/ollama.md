# Ollama — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Ollama** is an open-source tool for running large language models (LLMs) locally on your own hardware. It provides a simple CLI and REST API to download, run, and manage models like Llama 3, Mistral, Qwen, Gemma, and DeepSeek — entirely offline, with no API costs.

Ollama is used for privacy-sensitive applications, cost-zero prototyping, and offline deployments where cloud LLM APIs are unavailable or too expensive.

## Supported Models (2026)

| Model | Size | VRAM Required | Best For |
|-------|------|--------------|---------|
| Llama 3.3 70B | 70B | 48GB | General purpose, near-GPT-4 quality |
| Llama 3.2 3B | 3B | 4GB | Low-power devices, fast responses |
| Mistral 7B | 7B | 8GB | Instruction following, fast |
| Qwen2.5 14B | 14B | 10GB | Multilingual, coding |
| Qwen2.5-Coder 32B | 32B | 24GB | Code generation |
| DeepSeek-R1 | 7B-671B | 8GB+ | Reasoning chains |
| Gemma 3 9B | 9B | 8GB | Google's open model |
| Phi-4 | 14B | 10GB | Microsoft, efficient |
| CodeLlama | 7B-34B | 8GB+ | Code-focused tasks |
| Nomic Embed | 137M | 1GB | Text embeddings, RAG |

Run `ollama list` to see all locally installed models. Browse all models: [ollama.com/library](https://ollama.com/library?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ollama).

## Quick Start

```bash
# Install (macOS)
brew install ollama

# Install (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull and run a model
ollama run llama3.3

# Run in background as API server
ollama serve
```

## REST API

Ollama exposes an OpenAI-compatible REST API on `localhost:11434`:

```python
import requests

# Chat completions
response = requests.post("http://localhost:11434/api/chat", json={
    "model": "llama3.3",
    "messages": [{"role": "user", "content": "Explain RAG in 3 bullets"}],
    "stream": False
})
print(response.json()["message"]["content"])
```

**OpenAI-compatible endpoint** (for drop-in replacement):

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

response = client.chat.completions.create(
    model="llama3.3",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

Any library that supports OpenAI's API (LangChain, LlamaIndex, CrewAI) can use Ollama by changing the `base_url`.

## Ollama vs Cloud APIs

| Dimension | Ollama (Local) | Claude API | Gemini API |
|-----------|---------------|-----------|-----------|
| Cost | **$0** (electricity only) | $3/1M tokens (Sonnet) | $0.075/1M (Flash) |
| Privacy | **100% local** | Sent to Anthropic | Sent to Google |
| Internet | Not required | Required | Required |
| Setup | 5 minutes | API key only | API key only |
| Quality | Good (7B-70B) | **Best** (Sonnet) | Good |
| Speed | Depends on hardware | Fast | Very fast |
| Context | Model-dependent (4K-128K) | 200K | 1M |
| Customization | Full (fine-tune, Modelfile) | Limited | Limited |
| Best for | Privacy, cost, offline | Production quality | Long docs, free |

**When to use Ollama**: prototyping, cost-sensitive batch jobs, privacy-sensitive data, offline environments.

**When to upgrade to Claude**: production applications, complex reasoning, coding agents, customer-facing features.

## Ollama with RAG (Nomic Embeddings + ChromaDB)

```python
import ollama
import chromadb

# Initialize
client = chromadb.Client()
collection = client.create_collection("docs")

# Embed documents locally
documents = ["RAG retrieves relevant docs", "Supabase stores vectors", "Claude generates answers"]
embeddings = [
    ollama.embeddings(model="nomic-embed-text", prompt=doc)["embedding"]
    for doc in documents
]
collection.add(documents=documents, embeddings=embeddings, ids=[str(i) for i in range(len(documents))])

# Query
query = "How does retrieval work?"
query_embedding = ollama.embeddings(model="nomic-embed-text", prompt=query)["embedding"]
results = collection.query(query_embeddings=[query_embedding], n_results=2)

# Generate answer
context = "\n".join(results["documents"][0])
response = ollama.chat(model="llama3.3", messages=[{
    "role": "user",
    "content": f"Context: {context}\n\nQuestion: {query}"
}])
print(response["message"]["content"])
```

## Modelfile: Custom Model Configuration

```dockerfile
# Modelfile — customize model behavior
FROM llama3.3

SYSTEM """
You are a senior software engineer. Answer concisely in technical terms.
Always include code examples. Never add unnecessary disclaimers.
"""

PARAMETER temperature 0.2
PARAMETER num_ctx 8192
```

```bash
ollama create my-engineer -f Modelfile
ollama run my-engineer
```

## Hardware Requirements

| Use Case | Minimum | Recommended |
|---------|---------|------------|
| Casual chat (7B) | 8GB RAM, CPU | Apple M1, 8GB VRAM |
| Development (13B) | 16GB RAM | Apple M2/M3, 16GB |
| Production (70B) | 48GB VRAM | RTX 4090 ×2 or M2 Ultra |
| Embeddings only | 4GB RAM | Any modern CPU |

Apple Silicon (M1/M2/M3/M4) uses unified memory — the same RAM serves both CPU and GPU, making 16-32GB Macs highly capable for local LLMs.

## Frequently Asked Questions

**Q: What is Ollama?**
A: Ollama is an open-source tool for running LLMs (Llama, Mistral, Qwen, etc.) locally with zero API cost. It provides a CLI and OpenAI-compatible REST API. Install at [ollama.com](https://ollama.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ollama).

**Q: Is Ollama free?**
A: Yes. Ollama itself is free and open-source. You only pay for electricity. Models are downloaded for free from the Ollama library. No API key, no subscription.

**Q: What is the best model to run with Ollama?**
A: For general use: Llama 3.3 70B (requires 48GB VRAM) or Qwen2.5 14B (10GB VRAM). For coding: Qwen2.5-Coder 32B. For fast responses on consumer hardware: Llama 3.2 3B (4GB RAM). For embeddings: nomic-embed-text.

**Q: Can I use Ollama with LangChain?**
A: Yes. Use `langchain-ollama` package or the OpenAI-compatible endpoint (`base_url="http://localhost:11434/v1"`). Full drop-in compatibility with any OpenAI SDK client.

**Q: How does Ollama compare to Claude API quality?**
A: Claude Sonnet significantly outperforms all local models on coding, complex reasoning, and instruction-following. Ollama is ideal for cost-zero prototyping and privacy-sensitive tasks. Production applications typically use Ollama for preprocessing → Claude for final generation requiring quality.

**Q: Does Ollama work offline?**
A: Yes. After downloading a model (`ollama pull llama3.3`), all inference runs entirely locally with no internet connection required.

## Resources

- Download Ollama: [ollama.com](https://ollama.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ollama)
- For production quality: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ollama)
- **AI Agent Prompts Pack** (local LLM agent prompts, Ollama + Claude hybrid pipeline templates): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ollama)

## Related

- [Claude API](claude-api.md)
- [Gemini API](gemini-api.md)
- [RAG](../concepts/rag.md)
- [Vector Database](../concepts/vector-database.md)
