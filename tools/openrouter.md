# OpenRouter — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**OpenRouter is an API aggregator that provides a single OpenAI-compatible endpoint to access 200+ LLMs — including Claude, GPT-4, Gemini, Llama, Mistral, and Qwen — with automatic fallback, cost-based routing, and a unified billing system.**

Rather than managing separate API keys, billing accounts, and SDK integrations for each AI provider, OpenRouter collapses everything into one endpoint and one invoice.

## What OpenRouter Does

| Capability | Description |
|-----------|-------------|
| Unified endpoint | Single `https://openrouter.ai/api/v1` URL for all models |
| 200+ models | Claude, GPT-4o, Gemini, Llama 3, Mistral, Qwen, and more |
| OpenAI-compatible | Works with any library that supports OpenAI SDK |
| Cost routing | Automatically select cheapest model for a task |
| Fallback chains | Retry with alternate model on failure or rate limit |
| Free tier models | Several open-source models available at $0/request |
| Unified billing | Single invoice across all providers |
| Usage dashboard | Per-model cost tracking and usage analytics |

## Python Quickstart

OpenRouter is fully compatible with the OpenAI Python SDK. Change `base_url` and `api_key`, and the rest of your code stays unchanged.

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="sk-or-..."
)

response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello"}]
)

print(response.choices[0].message.content)
```

The `model` field uses `provider/model-name` format (e.g., `anthropic/claude-sonnet-4-6`, `openai/gpt-4o`, `google/gemini-2.0-flash`).

## Model Routing Strategies

OpenRouter supports four routing patterns, controlled via `model` field or extra headers:

| Strategy | How to Use | Best For |
|---------|-----------|---------|
| Specific model | `model="anthropic/claude-sonnet-4-6"` | Consistent quality, known cost |
| Lowest cost | `model="openrouter/auto"` with cost parameter | Budget-sensitive pipelines |
| Lowest latency | Route parameter set to `latency` | Real-time applications |
| Fallback chain | Pass array of models | High-availability production |

```python
# Fallback chain: try Claude first, fall back to GPT-4o, then Llama
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Summarize this text"}],
    extra_body={
        "models": [
            "anthropic/claude-sonnet-4-6",
            "openai/gpt-4o",
            "meta-llama/llama-3.3-70b-instruct"
        ],
        "route": "fallback"
    }
)
```

## Free Models on OpenRouter (2026)

Several models are available at $0/request on OpenRouter's free tier. These are rate-limited but functional for development and low-volume applications:

| Model | Provider | Notes |
|-------|----------|-------|
| Llama 3.3 70B Instruct | Meta (via providers) | Strong general-purpose |
| Mistral 7B Instruct | Mistral | Fast, lightweight |
| Qwen 2.5 72B Instruct | Alibaba | Strong coding + multilingual |
| DeepSeek Chat | DeepSeek | Strong reasoning |
| Gemma 2 9B | Google | Efficient small model |

Free models use the same API format — just prefix with `:free` or use the free-tier model ID from the OpenRouter model list.

## OpenRouter vs Direct API

| Dimension | OpenRouter | Direct API (Claude/OpenAI/Gemini) |
|-----------|-----------|-----------------------------------|
| API keys | 1 key for all models | Separate key per provider |
| Billing | Unified invoice | Separate billing per provider |
| Model access | 200+ models | Provider's models only |
| Fallback | Built-in | Must implement manually |
| Cost routing | Automatic | Must implement manually |
| Latency | +20-50ms overhead | Direct |
| Pricing markup | 0% on most models | N/A (pay model rate) |
| Rate limits | OpenRouter limits + provider limits | Provider limits only |
| Free tier | Several open-source models | Limited (Claude: $5 credit; OpenAI: $5 credit) |
| Best for | Multi-model apps, cost optimization | Single-provider apps, lowest latency |

## Pricing

OpenRouter passes through model pricing at 0% markup on most models. You pay the same rate as going directly to the provider, with the added convenience of unified billing.

| Model (OpenRouter ID) | Input | Output |
|----------------------|-------|--------|
| `anthropic/claude-sonnet-4-6` | $3.00/M tokens | $15.00/M tokens |
| `openai/gpt-4o` | $2.50/M tokens | $10.00/M tokens |
| `google/gemini-2.0-flash` | $0.10/M tokens | $0.40/M tokens |
| `meta-llama/llama-3.3-70b-instruct` | $0.12/M tokens | $0.30/M tokens |
| Free models | $0 | $0 |

*Prices vary by model and may change. Check [openrouter.ai/models](https://openrouter.ai/models) for current rates.*

## Common Use Cases

**Comparing models side-by-side**: Send the same prompt to Claude, GPT-4o, and Gemini in parallel to evaluate quality differences.

**Cost optimization**: Route simple classification tasks to cheap models (Llama, Mistral) and complex generation to premium models (Claude Sonnet, GPT-4o).

**Avoiding vendor lock-in**: Build against the OpenAI-compatible interface; switch underlying models without changing code.

**Development with free tier**: Prototype and test using free-tier models before switching to paid models in production.

**High availability**: Configure fallback chains so your application stays live during provider outages or rate limits.

## JavaScript / TypeScript Quickstart

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://yoursite.com",   // optional, for rankings
    "X-Title": "Your App Name",               // optional, for rankings
  },
});

const response = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4-6",
  messages: [{ role: "user", content: "Explain RAG in one paragraph" }],
});
```

## Frequently Asked Questions

**Q: What is OpenRouter?**
A: OpenRouter is an API aggregator that gives you access to 200+ AI models — including Claude, GPT-4o, Gemini, Llama, and Mistral — through a single OpenAI-compatible endpoint. You manage one API key and receive one invoice instead of maintaining separate accounts with each AI provider. It supports automatic fallback chains, cost-based routing, and a free tier with several open-source models.

**Q: Is OpenRouter free?**
A: OpenRouter itself charges no subscription fee. You pay only for model usage at the provider's standard rates (0% markup on most models). Several open-source models (Llama, Mistral, Qwen, DeepSeek) are available at $0/request on a rate-limited free tier, making it practical for development and low-volume production use without any upfront cost.

**Q: How do I use Claude through OpenRouter?**
A: Install the OpenAI SDK, set `base_url="https://openrouter.ai/api/v1"` and your OpenRouter API key, then use `model="anthropic/claude-sonnet-4-6"` (or any Claude model ID from the OpenRouter model list). The request format is identical to the OpenAI API. You can also add fallback models via the `extra_body` parameter so your app automatically retries with an alternate model if Claude is unavailable.

**Q: OpenRouter vs direct Claude API — which is better?**
A: Direct Claude API is better when you only need Claude, want the absolute lowest latency, or need features specific to the Anthropic SDK (streaming, tool use with full control, batches API). OpenRouter is better when you want to compare multiple models, need automatic fallback for high availability, want unified billing across providers, or are building cost-sensitive pipelines that route to cheaper models when possible. Both support the same OpenAI-compatible interface.

**Q: What free models does OpenRouter offer?**
A: As of 2026, OpenRouter's free tier includes rate-limited access to Llama 3.3 70B, Mistral 7B, Qwen 2.5 72B, DeepSeek Chat, and Gemma 2 9B, among others. Free models are sufficient for development, prototyping, and low-volume applications. The list changes as providers add or remove free allocations — check [openrouter.ai/models](https://openrouter.ai/models) and filter by "Free" for the current list.

## Resources

- OpenRouter model list: [openrouter.ai/models](https://openrouter.ai/models)
- Build AI apps with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=openrouter)
- **AI Agent Prompts Pack** (multi-model routing templates, fallback chain patterns, cost optimization recipes): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=openrouter)

## Related

- [Claude API](claude-api.md)
- [OpenAI API](openai-api.md)
- [LangChain](langchain.md)
- [AI API Cost Optimization](../guides/ai-api-cost-optimization.md)
