# Perplexity API — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**The Perplexity API provides programmatic access to Perplexity AI's online LLMs — models that can search the web in real-time during generation — enabling applications to retrieve up-to-date information without separate web scraping infrastructure.**

## What Is the Perplexity API?

Standard LLM APIs (OpenAI, Anthropic, Google) generate responses based on training data with a fixed knowledge cutoff. The Perplexity API is different: its models perform live web searches during generation and incorporate current search results into their responses. The result is a single API call that returns both a generated answer and citations to the source URLs.

This makes the Perplexity API a direct substitute for building a separate web search + LLM pipeline. Instead of maintaining a scraping infrastructure, managing rate limits across search providers, and writing retrieval logic, a single Perplexity API call handles all of it.

The API is compatible with the OpenAI Python and Node.js SDKs — applications that already call OpenAI can switch to Perplexity by changing the `base_url` and API key.

---

## Available Models

| Model | Description | Context Window | Best For |
|-------|------------|---------------|---------|
| sonar | Fast online model with web search | 127K tokens | Real-time Q&A, quick lookups |
| sonar-pro | Larger online model, citation-rich | 200K tokens | Research, detailed answers with sources |
| sonar-reasoning | Online + chain-of-thought reasoning | 127K tokens | Complex questions requiring step-by-step analysis |
| sonar-reasoning-pro | Best quality + reasoning + web search | 200K tokens | Highest accuracy research tasks |

All `sonar` models search the web during generation. There are no "offline" Perplexity models in the public API — web access is the product's defining characteristic.

---

## Python Quickstart

The Perplexity API is compatible with the OpenAI Python SDK. Set `base_url` and use a `pplx-` prefixed API key.

```python
from openai import OpenAI

client = OpenAI(
    api_key="pplx-...",          # Perplexity API key from perplexity.ai/settings/api
    base_url="https://api.perplexity.ai"
)

response = client.chat.completions.create(
    model="sonar-pro",
    messages=[
        {
            "role": "system",
            "content": "Be precise. Cite sources when possible."
        },
        {
            "role": "user",
            "content": "What are the latest changes to Claude's pricing as of this week?"
        }
    ]
)

print(response.choices[0].message.content)
# Response includes web-sourced answer with inline citations
```

### Accessing Citations

Perplexity returns source URLs in the response object. Parse them from `citations`:

```python
response = client.chat.completions.create(
    model="sonar-pro",
    messages=[{"role": "user", "content": "What is the current GPT-4o pricing?"}]
)

# Main answer
answer = response.choices[0].message.content
print(answer)

# Citations (list of source URLs)
if hasattr(response, "citations"):
    for i, url in enumerate(response.citations, 1):
        print(f"[{i}] {url}")
```

### Streaming

Perplexity supports streaming responses via the standard OpenAI streaming interface:

```python
stream = client.chat.completions.create(
    model="sonar",
    messages=[{"role": "user", "content": "Summarize today's AI news"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

---

## Pricing

| Model | Price per 1,000 Requests | Price per 1M Input Tokens | Price per 1M Output Tokens |
|-------|------------------------|--------------------------|---------------------------|
| sonar | $5 / 1K requests | $1 | $1 |
| sonar-pro | $8 / 1K requests | $3 | $15 |
| sonar-reasoning | $5 / 1K requests | $1 | $5 |
| sonar-reasoning-pro | $8 / 1K requests | $2 | $8 |

The request-based fee covers the web search component. Token fees apply on top for longer inputs and outputs. For applications making thousands of research queries per month, sonar-pro at $8/1K requests is the primary cost driver.

---

## Comparison: Perplexity API vs Web Search APIs for LLMs

| Provider | Type | What It Returns | Cost | Integration |
|----------|------|----------------|------|-------------|
| Perplexity API (sonar) | LLM + search | Synthesized answer + citations | $5–$8 / 1K requests | OpenAI-compatible |
| Tavily | Search API | Structured results for RAG | $0.004 / search | REST API |
| Brave Search API | Search API | Web results (JSON) | $3 / 1K queries | REST API |
| Serper | Google Search API | Google SERP results | $0.50 / 1K searches | REST API |
| Bing Search API | Search API | Bing web results | $3–$7 / 1K requests | REST API |

**Perplexity API**: Best when you want a finished answer with cited sources. The LLM synthesizes the search results — no additional generation step required. Higher cost per call but eliminates pipeline complexity.

**Tavily**: Best for RAG pipelines where you control the generation step. Returns raw structured search results that you inject into your own LLM prompt. Lower cost per search; you choose the LLM.

**Brave / Serper / Bing**: Raw SERP data. Most flexibility, most engineering work. Appropriate when you need full control over how results are processed and presented.

---

## Use Cases

### Research Automation

Perplexity API is well-suited to automating research workflows that previously required human browsing: competitive intelligence, market monitoring, news aggregation, and literature review. A single API call returns a synthesized summary with sources.

```python
topics = ["AI model releases this week", "vector database benchmark updates", "LLM pricing changes"]

for topic in topics:
    response = client.chat.completions.create(
        model="sonar-pro",
        messages=[{"role": "user", "content": f"Provide a concise briefing on: {topic}"}]
    )
    print(f"\n## {topic}\n{response.choices[0].message.content}")
```

### Fact-Checking

Feed a claim to sonar-reasoning to verify it against current web sources:

```python
claim = "GPT-4o has a 128K context window as of April 2026"

response = client.chat.completions.create(
    model="sonar-reasoning",
    messages=[
        {"role": "system", "content": "You are a fact-checker. Verify the claim and state whether it is accurate, outdated, or incorrect based on current sources."},
        {"role": "user", "content": claim}
    ]
)
print(response.choices[0].message.content)
```

### Real-Time Q&A for Applications

Applications that need answers to time-sensitive questions (event schedules, current prices, live status) can use the Perplexity API without maintaining a separate news or data feed.

### News Monitoring

Schedule periodic Perplexity API calls to monitor topics, detect new developments, and generate summaries for a digest.

---

## Limitations

| Limitation | Detail |
|-----------|--------|
| No guaranteed source control | Perplexity selects which pages to search; you cannot specify exact URLs |
| Hallucination still possible | Web search reduces but does not eliminate hallucination |
| No image generation | Text-only API |
| Rate limits | Vary by plan; check perplexity.ai/api for current limits |
| Citations not guaranteed | Not all responses include citations; depends on query type |
| No function calling (as of 2026) | Does not support OpenAI-style function/tool calling |

---

## FAQ

### What is the Perplexity API?

The Perplexity API is a developer API that provides access to Perplexity AI's "online" LLMs — models that perform live web searches during generation to produce up-to-date answers with source citations. Unlike standard LLM APIs that rely on fixed training data, Perplexity's models search the web at inference time, making them suitable for queries that require current information. The API is compatible with the OpenAI SDK (same `chat.completions.create` interface), so existing OpenAI integrations can be pointed at Perplexity by changing the `base_url` and API key. Available models include `sonar`, `sonar-pro`, `sonar-reasoning`, and `sonar-reasoning-pro`.

### How do I use Perplexity API with Python?

Install the OpenAI Python SDK (`pip install openai`), create a `OpenAI` client with `api_key` set to your Perplexity API key (from perplexity.ai/settings/api) and `base_url` set to `https://api.perplexity.ai`. Call `client.chat.completions.create(model="sonar-pro", messages=[...])` exactly as you would with OpenAI. The response object follows the same structure. Source citations are available in `response.citations` as a list of URLs. Streaming is supported by passing `stream=True`. No additional libraries are required.

### Perplexity vs Tavily for RAG web search — which is better?

They address different stages of a pipeline. Tavily is a search API that returns structured web results (URLs, snippets, content) for you to inject into your own LLM prompt — it gives you raw materials and full control over generation. Perplexity API is a complete answer API: it searches the web and generates a synthesized response in one call, eliminating the generation step. For RAG pipelines where you want to control generation (choosing the model, the prompt, the output format), Tavily is more appropriate. For applications where you want a finished researched answer with minimal pipeline code, Perplexity API is faster to integrate. Perplexity costs more per call ($5–8/1K requests vs $0.004/search for Tavily) but eliminates the separate LLM generation cost and pipeline complexity.

### Does Perplexity API support streaming?

Yes. Perplexity API supports streaming responses using the same interface as the OpenAI SDK. Pass `stream=True` to `chat.completions.create`, then iterate over the returned stream object, reading `chunk.choices[0].delta.content` for each token. Streaming works with all Perplexity models (`sonar`, `sonar-pro`, `sonar-reasoning`, `sonar-reasoning-pro`). Note that citations are typically only available in the final non-streamed response — when streaming, collect the full text and make a separate non-streamed call if citations are required.

### How much does Perplexity API cost?

Perplexity API pricing has two components: a per-request fee for the web search, and a per-token fee for input and output. The sonar model costs $5 per 1,000 requests plus $1 per million input tokens and $1 per million output tokens. The sonar-pro model costs $8 per 1,000 requests plus $3 per million input tokens and $15 per million output tokens. For an application making 10,000 research queries per month with sonar-pro, the request fee alone is $80, plus token costs depending on query and response length. A free tier is available for testing; check perplexity.ai/api for current pricing and rate limits.

---

## Resources

**Build AI applications with Claude API**

For applications requiring both up-to-date research (via Perplexity) and long-context document analysis or complex reasoning, combining the Perplexity API with Claude API covers both use cases.

- [Claude API — Get Started](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=perplexity-api) — Anthropic's production API for Claude Sonnet and Opus. Long context windows and strong reasoning for document-heavy applications.

**AI Builder Resources**

- [AI Solopreneur Stack PDF](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=perplexity-api) — Tools, API integrations, and automation stacks used by independent AI builders in 2026.

## Related Articles

- [Perplexity Guide](perplexity.md)
- [OpenAI API Guide](openai-api.md)
- [Claude API Guide](claude-api.md)
- [RAG Implementation Guide](../guides/rag-implementation.md)
