# Claude API Quickstart — Build Your First AI App in 10 Minutes

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**The Claude API (by Anthropic) provides programmatic access to Claude models via REST API or official SDKs for Python and TypeScript, enabling developers to integrate Claude's capabilities — including text generation, code assistance, tool use, and vision — into any application.**

This guide covers everything needed to go from zero to a working Claude integration: account setup, first API call, multi-turn conversations, system prompts, streaming, and tool use. The examples use the official `anthropic` Python SDK, with TypeScript equivalents included. No prior LLM API experience is required.

## Prerequisites

- Python 3.8 or later (or Node.js 18+ for TypeScript)
- An Anthropic account (create one at console.anthropic.com)
- An API key (generated in the Anthropic console)

## Installation and Setup

```bash
pip install anthropic
```

Store your API key as an environment variable. Never hardcode it in source files.

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

For persistent configuration, add this line to your shell profile (`~/.zshrc`, `~/.bashrc`) or use a `.env` file with a library such as `python-dotenv`.

## First API Call

```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from environment

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain RAG in 3 sentences."}
    ]
)

print(message.content[0].text)
```

The `messages.create` method is synchronous and returns when the model finishes generating. The response object contains the generated text at `message.content[0].text` and token usage at `message.usage`.

## System Prompts

A system prompt sets persistent instructions that apply to the entire conversation — the model's role, output format, constraints, or context.

```python
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    system="You are a senior Python engineer. Answer concisely with code examples. "
           "Use type hints. Prefer stdlib solutions over third-party libraries.",
    messages=[
        {"role": "user", "content": "How do I read a JSON file safely?"}
    ]
)

print(message.content[0].text)
```

## Multi-Turn Conversations

To maintain a conversation, accumulate the messages list with alternating `user` and `assistant` turns.

```python
import anthropic

client = anthropic.Anthropic()
history = []

def chat(user_input: str) -> str:
    history.append({"role": "user", "content": user_input})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system="You are a helpful assistant.",
        messages=history
    )

    assistant_reply = response.content[0].text
    history.append({"role": "assistant", "content": assistant_reply})
    return assistant_reply

print(chat("What is the capital of France?"))
print(chat("What is its population?"))  # Claude knows "its" refers to Paris
```

## Streaming Responses

Streaming returns tokens incrementally as they are generated, reducing perceived latency for end-users.

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a haiku about vector databases."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
print()  # newline after stream completes
```

## Tool Use (Function Calling)

Tool use allows Claude to call external functions — APIs, databases, calculators — and incorporate results into its response.

```python
import json

tools = [
    {
        "name": "get_weather",
        "description": "Returns current temperature for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. Tokyo"}
            },
            "required": ["city"]
        }
    }
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}]
)

# If Claude decides to call the tool:
if response.stop_reason == "tool_use":
    tool_call = next(b for b in response.content if b.type == "tool_use")
    print(f"Tool: {tool_call.name}, Input: {tool_call.input}")
    # → Tool: get_weather, Input: {'city': 'Tokyo'}
```

## TypeScript / Node.js

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from environment

const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Explain RAG in 3 sentences." }],
});

console.log(message.content[0].type === "text" ? message.content[0].text : "");
```

Install with: `npm install @anthropic-ai/sdk`

## Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model ID, e.g. `claude-sonnet-4-6` |
| `max_tokens` | integer | Maximum tokens in the response (required) |
| `messages` | array | Conversation history — alternating user/assistant turns |
| `system` | string | System prompt (optional) |
| `temperature` | float | Randomness 0.0–1.0; default 1.0. Lower = more deterministic |
| `top_p` | float | Nucleus sampling threshold; alternative to temperature |
| `stream` | boolean | Enable streaming (use `.stream()` method instead) |
| `tools` | array | Tool definitions for function calling |

## Error Handling

```python
from anthropic import APIConnectionError, RateLimitError, APIStatusError

try:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except RateLimitError:
    print("Rate limit hit — implement exponential backoff")
except APIConnectionError:
    print("Network error — retry with backoff")
except APIStatusError as e:
    print(f"API error {e.status_code}: {e.message}")
```

Rate limits are per-model and per-tier. Tier 1 accounts (new) have lower limits; limits increase automatically as usage history accumulates. Implement exponential backoff with jitter for production systems.

## Cost Estimation

Before building, estimate your expected token usage:

| Workload | Tokens/Request | Requests/Day | Daily Cost (Sonnet) |
|----------|---------------|-------------|---------------------|
| Chatbot (1K in, 300 out) | 1,300 | 1,000 | ~$4.50 |
| Document summarizer (5K in, 500 out) | 5,500 | 100 | ~$2.25 |
| Classifier (200 in, 20 out) | 220 | 10,000 | ~$6.60 |
| Code review (3K in, 800 out) | 3,800 | 50 | ~$0.77 |

Use the `count_tokens` endpoint to measure exact token counts before committing to a design.

## Next Steps

- **MCP (Model Context Protocol)**: Connect Claude to external tools and data sources via a standardized protocol
- **Claude Code**: CLI tool for software development, available at `npm install -g @anthropic-ai/claude-code`
- **Batch API**: 50% cost reduction for asynchronous, non-real-time workloads
- **Extended thinking**: Enable for complex reasoning tasks with `thinking={"type": "enabled", "budget_tokens": N}`

## FAQ

### How do I get a Claude API key?

Sign up at console.anthropic.com, verify your email, and navigate to the API Keys section. Click "Create Key," give it a name, copy the key immediately (it is only shown once), and store it in an environment variable or secrets manager. API keys begin with `sk-ant-`. New accounts start on the free tier with limited credits; to increase limits, add a payment method and your usage tier will upgrade automatically based on your spending history.

### Is the Claude API free?

Anthropic offers a small amount of free credits to new accounts for testing purposes, but the API is a paid service beyond that initial credit. There is no permanently free tier for the API (unlike Claude.ai's free web interface). Pricing is pay-per-token: as of April 2026, Haiku costs $0.80 per million input tokens, Sonnet $3 per million input tokens, and Opus $15 per million input tokens. For most side projects and small applications, monthly costs are modest — a chatbot with 1,000 daily conversations typically costs $50–150/month depending on conversation length and model choice.

### Claude API vs. OpenAI API — what are the differences?

Both APIs follow a similar messages-based interface and have comparable Python/TypeScript SDKs. Key differences: Claude's context window is 200K tokens (vs. GPT-4o's 128K), making Claude preferable for long-document tasks. Claude's Constitutional AI training produces different refusal behavior — Claude tends to be more verbose in its reasoning but also more willing to engage with nuanced topics. The OpenAI API has a broader ecosystem of third-party integrations and tooling. Both APIs support tool use (function calling), streaming, and vision. Pricing is broadly similar at the Sonnet/GPT-4o tier. Most developers choose based on output quality for their specific use case — running both on a sample of production queries is the most reliable evaluation method.

### What Python library do I use for Claude?

The official library is `anthropic`, installable via `pip install anthropic`. It provides a synchronous client (`anthropic.Anthropic()`), an async client (`anthropic.AsyncAnthropic()`), and a streaming interface. The library handles authentication, retries, error classification, and response parsing. Do not use the `openai` library with Claude — while the underlying REST API can technically be called from any HTTP client, the official SDK provides the cleanest interface and is kept current with new Claude features. For frameworks that abstract over multiple providers (LangChain, LlamaIndex), their Claude integration modules use the `anthropic` SDK internally.

### How much does the Claude API cost for a small app?

For a typical small application — a personal chatbot, a document summarizer, or a coding assistant with light usage — monthly costs are usually between $5 and $50. As a concrete example: a personal coding assistant that processes 50 requests per day, each with 2,000 input tokens and 500 output tokens using Claude Sonnet, costs approximately $0.14 per day or $4.20 per month. Costs scale linearly with request volume and token count. Use the Batch API (50% discount) for offline workloads, Haiku for high-volume lightweight tasks, and Sonnet for most interactive features to optimize spend.

## Resources

- **Create an Anthropic account and get API access**: [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-api-quickstart)
- **AI Engineering Handbook (PDF)**: [th19930828.gumroad.com](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-api-quickstart)

---

*Last updated: April 2026*
