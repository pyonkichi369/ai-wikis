# AI API Pricing — Cost Per Token Complete Reference 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI API pricing is measured in cost per million tokens (input and output separately), where 1 million tokens equals approximately 750,000 words — with prices ranging from $0.05/million (cheapest open models) to $75/million (most capable frontier models) as of 2026.**

## Master Pricing Table (2026)

All prices in USD per 1 million tokens. Input = prompt tokens; Output = completion tokens.

| Provider | Model | Input $/1M | Output $/1M | Context | Category |
|----------|-------|-----------|------------|---------|----------|
| Anthropic | Claude Opus 4.6 | $15.00 | $75.00 | 200K | Frontier |
| Anthropic | Claude Sonnet 4.6 | $3.00 | $15.00 | 200K | Mid-tier |
| Anthropic | Claude Haiku 4.5 | $0.80 | $4.00 | 200K | Budget |
| OpenAI | GPT-4o | $5.00 | $15.00 | 128K | Frontier |
| OpenAI | GPT-4o mini | $0.15 | $0.60 | 128K | Budget |
| OpenAI | o1 | $15.00 | $60.00 | 200K | Reasoning |
| OpenAI | o3-mini | $1.10 | $4.40 | 200K | Reasoning budget |
| OpenAI | o4-mini | $1.10 | $4.40 | 200K | Reasoning budget |
| Google | Gemini 2.0 Pro | $3.50 | $10.50 | 1M | Frontier |
| Google | Gemini 2.0 Flash | $0.10 | $0.40 | 1M | Budget |
| Google | Gemini 1.5 Pro | $3.50 | $10.50 | 2M | Long context |
| Google | Gemini 1.5 Flash | $0.075 | $0.30 | 1M | Cheapest Flash |
| Mistral | Mistral Large 2 | $2.00 | $6.00 | 128K | Mid-tier |
| Mistral | Mistral Small 3 | $0.10 | $0.30 | 128K | Budget |
| Mistral | Codestral | $1.00 | $3.00 | 256K | Code |
| Groq | Llama 3.3 70B | $0.59 | $0.79 | 128K | Fast inference |
| Groq | Llama 3.1 8B | $0.05 | $0.08 | 128K | Cheapest capable |
| DeepSeek | DeepSeek V3 | $0.27 | $1.10 | 64K | Mid-tier |
| DeepSeek | DeepSeek R1 | $0.55 | $2.19 | 64K | Reasoning |
| Cohere | Command R+ | $2.50 | $10.00 | 128K | Enterprise RAG |
| Cohere | Command R | $0.15 | $0.60 | 128K | Budget RAG |
| xAI | Grok-2 | $2.00 | $10.00 | 128K | Mid-tier |
| xAI | Grok-2 mini | $0.20 | $0.50 | 128K | Budget |

Prices as of Q2 2026. AI API pricing drops ~20–40% annually; verify at provider pricing pages before budgeting.

## Token Counting Reference

| Content Type | Approximate Tokens |
|--------------|-------------------|
| 1 word | ~1.3 tokens |
| 1 sentence (15 words) | ~20 tokens |
| 1 paragraph (100 words) | ~130 tokens |
| 1 page (500 words) | ~650 tokens |
| 1,000 words | ~1,300 tokens |
| Short story (5,000 words) | ~6,500 tokens |
| Novel chapter (10,000 words) | ~13,000 tokens |
| Book (80,000 words) | ~104,000 tokens |
| Code file (1,000 lines Python) | ~3,000–5,000 tokens |

## Cost Calculator Examples

### Example 1: Customer Support Bot (1,000 requests/day)

Assumptions: avg system prompt 500 tokens, avg user message 100 tokens, avg response 300 tokens.

| Model | Input tokens/call | Output tokens/call | Cost/call | Cost/day | Cost/month |
|-------|------------------|-------------------|-----------|---------|------------|
| GPT-4o mini | 600 | 300 | $0.00027 | $0.27 | $8.10 |
| Claude Haiku 4.5 | 600 | 300 | $0.00168 | $1.68 | $50.40 |
| Claude Sonnet 4.6 | 600 | 300 | $0.0063 | $6.30 | $189 |
| GPT-4o | 600 | 300 | $0.0075 | $7.50 | $225 |

### Example 2: Document Summarization (10,000 docs/month)

Assumptions: avg document 2,000 tokens, avg summary 400 tokens.

| Model | Cost per doc | Total monthly cost |
|-------|-------------|-------------------|
| Gemini 1.5 Flash | $0.00027 | $2.70 |
| GPT-4o mini | $0.00054 | $5.40 |
| Claude Haiku 4.5 | $0.0032 | $32.00 |
| Claude Sonnet 4.6 | $0.012 | $120.00 |

### Example 3: Complex Analysis (100 requests/day)

Assumptions: avg input 10,000 tokens, avg output 2,000 tokens.

| Model | Cost/call | Cost/day | Cost/month |
|-------|-----------|---------|------------|
| DeepSeek V3 | $0.049 | $4.90 | $147 |
| Claude Sonnet 4.6 | $0.060 | $6.00 | $180 |
| GPT-4o | $0.080 | $8.00 | $240 |
| Claude Opus 4.6 | $0.30 | $30.00 | $900 |

## Cheapest vs Best Quality Recommendations

| Use Case | Recommended Model | Reason |
|----------|------------------|--------|
| Classification, routing | GPT-4o mini or Gemini Flash | Sub-cent per 1000 calls |
| Simple Q&A, chat | Claude Haiku or GPT-4o mini | Balance of speed and quality |
| RAG, summarization | Claude Sonnet or GPT-4o | Instruction following quality |
| Code generation | Codestral or Claude Sonnet | Specialized vs general |
| Complex reasoning | o3-mini or DeepSeek R1 | Reasoning traces, math |
| Long documents (>100K tokens) | Gemini 1.5 Pro | 2M token context |
| Budget reasoning | DeepSeek R1 | 4× cheaper than o3-mini |
| Fastest inference | Groq + Llama 3 | Hardware-optimized inference |

## Free Tier Models (2026)

| Provider | Free Tier | Limits |
|----------|-----------|--------|
| Google AI Studio | Gemini 2.0 Flash, 1.5 Flash | 15 req/min, 1M tokens/min |
| Groq | Llama 3.3 70B, Llama 3.1 8B | 30 req/min (rate limited) |
| Anthropic | claude.ai web interface | Daily message limits |
| OpenRouter | Various open models | Credit-based free tier |
| Ollama | All open-weight models | Local compute required |
| Cloudflare AI | Llama, Mistral (small) | Free within Workers limits |

## Cache Pricing

Several providers offer prompt caching (reusing unchanged prefixes) at significant discounts:

| Provider | Cache Write | Cache Read | Typical Savings |
|----------|------------|-----------|-----------------|
| Anthropic | 125% of input price | 10% of input price | 90% on cached tokens |
| OpenAI | 100% of input price | 50% of input price | 50% on cached tokens |
| Google | Standard price | 25% of input price | 75% on cached tokens |

Cache is effective when the system prompt or document context is reused across many requests.

## Cost Optimization Strategies

| Strategy | Typical Savings | How to Apply |
|----------|----------------|--------------|
| Model tiering | 5–20× | Route simple tasks to Haiku/GPT-4o-mini; complex tasks to Opus/GPT-4o |
| Prompt caching | 50–90% | Cache static system prompts and long retrieved documents |
| Batch API | 50% | Use async batch endpoints for non-real-time workloads |
| Context pruning | 20–50% | Summarize old conversation turns instead of passing full history |
| Output length control | 20–40% | Set explicit `max_tokens`; avoid open-ended responses for structured tasks |
| Free tiers | 100% on free quota | Use Gemini Flash or Groq for development and low-volume testing |

### Model Tiering in Code

```python
def select_model(task_type: str) -> str:
    routing = {
        "classification":  "claude-haiku-4-5",    # $0.80/$4 per 1M tokens
        "summarization":   "claude-haiku-4-5",
        "qa_retrieval":    "claude-sonnet-4-6",   # $3/$15 per 1M tokens
        "code_generation": "claude-sonnet-4-6",
        "architecture":    "claude-opus-4-6",     # $15/$75 per 1M tokens
        "security_audit":  "claude-opus-4-6",
    }
    return routing.get(task_type, "claude-sonnet-4-6")
```

Implementing a routing layer can reduce average cost per request by 60–80% compared to always using the premium model.

### Context Window Cost Trap

In multi-turn conversations, every message in the conversation history is re-sent on each turn. A 10-turn chat averaging 1,000 tokens per turn costs 1,000 + 2,000 + ... + 10,000 = 55,000 input tokens — not 10,000. Implement a sliding window or summarization step to compress history once it exceeds a threshold:

```python
def compress_history(messages: list[dict], char_limit: int = 16000) -> list[dict]:
    total = sum(len(m["content"]) for m in messages)
    if total < char_limit:
        return messages
    # Keep system prompt + summarize middle + keep last 2 turns
    summary = summarize_turns(messages[1:-2])
    return [messages[0],
            {"role": "assistant", "content": f"[Summary: {summary}]"},
            *messages[-2:]]
```

This reduces conversation costs by 40–70% for long sessions.

## Multimodal and Embedding Pricing

| Provider | Model | Type | Cost |
|----------|-------|------|------|
| Anthropic | Claude Sonnet 4.6 | Image input | ~$4.80 per 1000 images (≈1600 tokens/image) |
| OpenAI | GPT-4o | Image input | ~$1.28–$6.40 per 1000 images (size-dependent) |
| OpenAI | text-embedding-3-small | Embedding | $0.02/1M tokens |
| OpenAI | text-embedding-3-large | Embedding | $0.13/1M tokens |
| Cohere | embed-multilingual-v3.0 | Embedding | $0.10/1M tokens |
| Google | text-embedding-004 | Embedding | Free (AI Studio) / $0.025/1M (API) |
| Anthropic | voyage-3 (via AWS) | Embedding | $0.06/1M tokens |

Image token counts vary by image size. A 1024×1024 image typically costs 1,600–2,000 tokens with Claude; OpenAI uses a tile-based system where a 1024×1024 image costs approximately 1,105 tokens at high detail.

## Getting Started

Claude API with free credits for new accounts: [claude.ai/referral](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-cost-per-token)

Practical guide to AI cost optimization for solopreneurs: [AI Tools Solopreneur Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-cost-per-token)

## FAQ

**Q: What is the difference between input tokens and output tokens in API pricing?**
A: Input tokens (also called prompt tokens) are the tokens you send to the model — including the system prompt, conversation history, and user message. Output tokens (completion tokens) are the tokens the model generates in response. Output tokens are priced higher than input tokens (typically 3–5× more) because generating each token requires a forward pass through the model, while input tokens are processed once in a batch. A call with a 1,000-token prompt and 500-token response has 1,000 input tokens and 500 output tokens billed separately.

**Q: How do I estimate costs before building a production application?**
A: Use the token counting reference to estimate average input and output sizes for your specific use case. Build a test set of 20–50 representative requests, run them through your target model, record actual token counts from API responses (every response includes `usage.input_tokens` and `usage.output_tokens`), then multiply by your expected request volume. Add 20–30% buffer for variation. Most providers also offer cost dashboards and budget alerts once you begin production usage.

**Q: Why are reasoning models (o1, o3, DeepSeek R1) more expensive than standard models?**
A: Reasoning models generate a hidden "chain of thought" before producing their final answer. This internal reasoning process produces thousands of additional tokens that are charged as output tokens even though they are not shown to users. For example, an o1 response with a 500-token visible answer might internally generate 5,000–20,000 "thinking" tokens that are billed. This makes reasoning models expensive per call but often more accurate on complex tasks, making them cost-effective when lower-quality models fail and require retries or human correction.

**Q: How much does prompt caching actually save in practice?**
A: The savings depend on your prompt structure. If you have a 10,000-token system prompt that stays constant across all requests, and you make 1,000 calls per day, without caching you pay for 10,000 × 1,000 = 10 million input tokens daily. With Anthropic's cache (10% of input price on cache hits), the same usage costs 1 million tokens at full price (the cached prefix) plus 9 million tokens at 10% price = 1M + 0.9M equivalent = 1.9M effective tokens per day. That is an ~81% reduction on the cached portion. Caching is most effective when system prompts or retrieved documents are large and reused frequently.

**Q: Are there hidden costs beyond per-token pricing?**
A: Several factors can increase effective costs. Context window usage grows with conversation history — you pay for the entire conversation on each turn, not just the new message. Some providers charge for embedding API calls separately. Fine-tuning (where supported) incurs training and hosting fees. Provisioned throughput tiers (reserved capacity) have monthly minimums. Batch API jobs are discounted but may incur minimum batch sizes. Image and video tokens are priced differently from text tokens. Always check the full pricing page including notes sections, not just the headline per-token rates.
