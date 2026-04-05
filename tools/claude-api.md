# Claude API — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Claude API** is a REST API developed by Anthropic that provides programmatic access to the Claude family of large language models. It enables developers to integrate advanced AI capabilities — including text generation, code writing, analysis, and tool use — into their own applications.

## Model Lineup (2026)

| Model | Context | Input Cost | Output Cost | Best For |
|-------|---------|-----------|------------|----------|
| claude-opus-4-6 | 200K tokens | $15/1M | $75/1M | Architecture, complex reasoning |
| claude-sonnet-4-6 | 200K tokens | $3/1M | $15/1M | General development, content |
| claude-haiku-4-5 | 200K tokens | $0.80/1M | $4/1M | High-volume, cost-sensitive tasks |

**New accounts receive free API credits.** Sign up: [console.anthropic.com](https://claude.ai/)

## Key Features

| Feature | Description |
|---------|-------------|
| Tool use (function calling) | LLM calls developer-defined functions |
| Vision | Image analysis and understanding |
| Large context | Up to 200K tokens (~150K words) |
| Streaming | Real-time token streaming |
| Batch API | Async processing at 50% discount |
| Computer use | Control mouse/keyboard (beta) |
| MCP | Model Context Protocol for tool integration |

## Quick Start

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain RAG in one paragraph."}
    ]
)
print(message.content[0].text)
```

Install: `pip install anthropic`

## Comparison with OpenAI API

| Dimension | Claude API | OpenAI API |
|-----------|-----------|-----------|
| Context window | 200K tokens | 128K tokens |
| Pricing (mid-tier) | $3/$15 per 1M | $5/$15 per 1M |
| Safety features | Constitutional AI | Moderation API |
| Tool use | Yes | Yes |
| Vision | Yes | Yes |
| Batch processing | 50% discount | 50% discount |
| Best known for | Long documents, safety | GPT-4o breadth |

## Pricing Strategy

**Cost optimization tiers** (recommended approach):
```
Simple tasks (classify, extract)  → claude-haiku   ($0.80/1M in)
Standard tasks (write, analyze)   → claude-sonnet  ($3/1M in)
Complex tasks (architect, debug)  → claude-opus    ($15/1M in)
```

Route 80% of requests to Haiku → typical cost reduction: 60-70%.

## Use Cases

- **Chatbots and assistants**: Customer support, internal Q&A
- **Document processing**: Summarization, extraction, classification
- **Code generation**: Autocomplete, review, refactoring
- **Content creation**: Articles, emails, product descriptions
- **Data analysis**: Pattern recognition, report generation
- **Agents**: Multi-step autonomous task execution

## Frequently Asked Questions

**Q: What is the Claude API?**
A: The Claude API is Anthropic's programmatic interface to the Claude AI model family, enabling developers to add AI capabilities to their applications via REST API.

**Q: How much does the Claude API cost?**
A: Pricing ranges from $0.80/1M tokens (Haiku) to $15/1M tokens (Opus) for input. Output tokens are 3-5x input price. New accounts get free credits.

**Q: What is the Claude API rate limit?**
A: Default limits vary by tier: Tier 1 starts at 50 RPM (requests per minute). Higher tiers unlock with spending history.

**Q: Is the Claude API better than OpenAI?**
A: For long document analysis and safety-critical applications, Claude API is generally preferred. For breadth of integrations, OpenAI has more third-party support. For cost, Claude Haiku is cheaper than GPT-4o-mini for most tasks.

**Q: How do I get a Claude API key?**
A: Sign up at [console.anthropic.com](https://claude.ai/), create a project, and generate an API key.

**Q: Does the Claude API support streaming?**
A: Yes. Streaming is supported via Server-Sent Events (SSE) using `stream=True` parameter.

## Getting Started

1. **[Sign up at Anthropic Console →](https://claude.ai/)** — new accounts receive free API credits
2. Install SDK: `pip install anthropic` or `npm install @anthropic-ai/sdk`
3. Set environment variable: `export ANTHROPIC_API_KEY=sk-ant-...`
4. Start with `claude-haiku-4-5` for cost efficiency (60-70% cheaper than Sonnet)

> **Building an AI agent?** The [AI Agent Prompts Pack](https://belleofficial.gumroad.com) includes 56 production-tested prompts — system prompts, tool-use templates, and multi-agent orchestration patterns for Claude API.

## Resources

- Official SDK (Python): `pip install anthropic`
- Official SDK (TypeScript): `npm install @anthropic-ai/sdk`
- **AI Agent Prompts Pack** (Claude API patterns): [belleofficial.gumroad.com](https://belleofficial.gumroad.com) ← most popular
- Compare: [Claude Code](claude-code.md) · [Cursor](cursor.md)
- Related: [Prompt Engineering](../concepts/prompt-engineering.md) · [AI Agent](../concepts/ai-agent.md)
