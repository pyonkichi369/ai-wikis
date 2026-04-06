# Anthropic Claude API — Complete Reference 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**The Anthropic Claude API is a RESTful API that provides programmatic access to Claude models, supporting text generation, vision (image analysis), tool use (function calling), prompt caching, batch processing, and streaming — accessible via official Python and TypeScript SDKs.**

Released publicly in 2023 and expanded significantly through 2024–2026, the Claude API serves as the foundation for applications built on Claude's language capabilities. It follows the Messages API pattern, where every interaction is structured as a conversation between system instructions and a sequence of user and assistant messages. The API is accessed at `https://api.anthropic.com` and requires authentication via an API key issued through the Anthropic Console.

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/messages` | POST | Core text and vision generation (primary endpoint) |
| `/v1/messages/batches` | POST | Batch processing — 50% cost discount, async |
| `/v1/messages/batches/{id}` | GET | Check batch job status |
| `/v1/messages/batches/{id}/results` | GET | Retrieve completed batch results |
| `/v1/messages/count_tokens` | POST | Count tokens before sending a request |
| `/v1/complete` | POST | Legacy completions endpoint (deprecated) |
| `/v1/models` | GET | List available Claude models |

All endpoints require the header `x-api-key: <YOUR_API_KEY>` and `anthropic-version: 2023-06-01`.

## Messages API Structure

A complete `/v1/messages` request body:

```json
{
  "model": "claude-opus-4-5",
  "max_tokens": 1024,
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Explain transformer architecture in one paragraph."}
  ],
  "temperature": 1.0,
  "top_p": 0.999,
  "stream": false,
  "tools": [],
  "tool_choice": {"type": "auto"}
}
```

**Key parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model ID (e.g., `claude-opus-4-5`, `claude-sonnet-4-5`) |
| `max_tokens` | integer | Maximum tokens in the response (required) |
| `system` | string | System prompt — sets persistent instructions |
| `messages` | array | Conversation history as `{role, content}` pairs |
| `temperature` | float | Sampling temperature (0–1, default 1.0) |
| `stream` | boolean | Enable server-sent events streaming |
| `tools` | array | Tool definitions for function calling |
| `tool_choice` | object | Control when tools are invoked |

## Vision and Image Input

Claude supports image analysis via the Messages API. Images can be provided as base64-encoded data or via public URL.

**Supported formats:** JPEG, PNG, GIF, WebP
**Maximum image size:** 5MB per image
**Maximum images per request:** 20

```python
import anthropic, base64

client = anthropic.Anthropic()

with open("screenshot.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {"type": "text", "text": "Describe what is shown in this screenshot."}
            ],
        }
    ],
)
print(response.content[0].text)
```

## Tool Use (Function Calling)

Tool use enables Claude to call external functions. The workflow is:

1. Define tools in the request
2. Claude returns a `tool_use` block with arguments
3. Your code executes the function
4. Return the result as a `tool_result` message
5. Claude continues with the result

```python
tools = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["city"]
        }
    }
]

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}]
)

# If Claude calls a tool:
if response.stop_reason == "tool_use":
    tool_call = next(b for b in response.content if b.type == "tool_use")
    result = call_my_weather_api(tool_call.input["city"])

    # Return result to Claude
    final = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        tools=tools,
        messages=[
            {"role": "user", "content": "What's the weather in Tokyo?"},
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": [
                {"type": "tool_result", "tool_use_id": tool_call.id, "content": result}
            ]}
        ]
    )
```

## Prompt Caching

Prompt caching allows frequently reused content (system prompts, documents, examples) to be cached server-side, reducing cost by up to 90% on cached tokens. Cached content has a TTL of 5 minutes (extended on each use).

```python
response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are an expert on the following 50,000-word legal document: ...",
            "cache_control": {"type": "ephemeral"}  # Cache this block
        }
    ],
    messages=[{"role": "user", "content": "What does section 4.2 say about liability?"}]
)
```

**Cache pricing:**

| Token type | Cost relative to standard |
|-----------|--------------------------|
| Cache write | 25% more expensive |
| Cache read | 90% less expensive |
| No cache | Baseline (1×) |

Cache reads are cost-effective after the first request. For repeated queries against the same large context, prompt caching typically reduces costs by 60–85%.

## Streaming

Enable streaming to receive response tokens incrementally via server-sent events:

```python
with client.messages.stream(
    model="claude-opus-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a short poem about APIs."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Streaming uses the same pricing as non-streaming requests. Key event types: `content_block_delta` (text chunk), `message_delta` (usage stats), `message_stop`.

## Batch API

The Batch API enables asynchronous processing of large request volumes at 50% cost reduction:

```python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"request-{i}",
            "params": {
                "model": "claude-haiku-4-5",
                "max_tokens": 256,
                "messages": [{"role": "user", "content": prompts[i]}]
            }
        }
        for i in range(len(prompts))
    ]
)

# Poll until complete (typically minutes to hours)
import time
while batch.processing_status != "ended":
    time.sleep(60)
    batch = client.messages.batches.retrieve(batch.id)

# Stream results
for result in client.messages.batches.results(batch.id):
    print(result.custom_id, result.result.message.content[0].text)
```

Batch jobs process within 24 hours. Maximum 100,000 requests per batch.

## Rate Limits by Tier

| Tier | Requirements | Tokens/minute | Requests/minute |
|------|-------------|---------------|-----------------|
| Tier 1 | $5 spend | 50,000 | 50 |
| Tier 2 | $40 spend | 100,000 | 1,000 |
| Tier 3 | $200 spend | 200,000 | 2,000 |
| Tier 4 | $400 spend | 400,000 | 4,000 |
| Custom | Enterprise | Negotiated | Negotiated |

Rate limits apply per model family. Token limits count both input and output tokens.

## Available Models (2026)

| Model | Context window | Best for |
|-------|----------------|----------|
| claude-opus-4-5 | 200K tokens | Complex reasoning, analysis |
| claude-sonnet-4-5 | 200K tokens | Balanced performance/cost |
| claude-haiku-4-5 | 200K tokens | High-volume, low-latency |

## Frequently Asked Questions

**What is the Claude API?**
The Claude API is Anthropic's REST API for programmatic access to Claude language models. It supports text generation, image analysis, function calling (tool use), streaming responses, and batch processing. Developers use it to build applications ranging from chatbots and coding assistants to document analysis pipelines and autonomous agents. It is accessed at `api.anthropic.com` and authenticated with an API key from the Anthropic Console.

**How do I use Claude API with Python?**
Install the official SDK with `pip install anthropic`, then set `ANTHROPIC_API_KEY` in your environment. Create a client with `client = anthropic.Anthropic()` and call `client.messages.create()` with a model name, `max_tokens`, and a `messages` array containing at minimum one user message. The response is in `response.content[0].text` for text responses.

**What is prompt caching in Claude API?**
Prompt caching is a feature that stores frequently used portions of a prompt (system instructions, large documents, few-shot examples) in Anthropic's infrastructure for 5 minutes. Subsequent requests that reuse the cached content pay approximately 90% less for those tokens. It is activated by adding `"cache_control": {"type": "ephemeral"}` to specific content blocks. Cache writes cost 25% more than standard input tokens but break even after two uses.

**How do I use Claude for image analysis?**
Include an `image` content block in the messages array alongside a text question. Images can be provided as base64-encoded data (any JPEG, PNG, GIF, or WebP up to 5MB) or as a public URL using `"type": "url"`. Claude can describe images, extract text from screenshots, analyze charts, compare multiple images, and answer questions about visual content. Vision capability is available on all current Claude models.

**What is the Claude Batch API?**
The Batch API processes large volumes of requests asynchronously at 50% cost reduction compared to the standard Messages API. Requests are submitted as a list with custom IDs, processed within 24 hours, and results are retrieved by polling the batch status endpoint. It is best suited for offline workloads such as bulk classification, dataset annotation, or mass content generation where latency is not a concern.

## Resources

- **Get API access**: [claude.ai/referral/gvWKlhQXPg](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=anthropic-claude-api) — Sign up for Claude to receive API credits and access the Anthropic Console
- **AI API toolkit**: [AI Tools & Prompts Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=anthropic-claude-api) — Production-ready prompt templates and SDK usage patterns
- **Official API documentation**: [docs.anthropic.com](https://docs.anthropic.com) — Full API reference, SDK guides, and changelog
- **Anthropic Console**: [console.anthropic.com](https://console.anthropic.com) — API key management, usage monitoring, and billing
