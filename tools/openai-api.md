> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

# OpenAI API — Complete Guide 2026

**The OpenAI API is a cloud-based REST interface that provides programmatic access to OpenAI's suite of AI models — including GPT-4o, o1, o3-mini, DALL-E, Whisper, and text embedding models — enabling developers to integrate language understanding, generation, image synthesis, speech recognition, and vector embedding capabilities into their applications.**

First launched in 2020 with GPT-3, the OpenAI API has become the most widely integrated AI API in production software. As of 2026, it serves millions of developers and is used as the underlying model layer in products across healthcare, legal tech, customer support, coding tools, and creative applications.

---

## Table of Contents

1. [Available Models](#available-models)
2. [API Comparison: OpenAI vs Claude vs Gemini](#api-comparison-openai-vs-claude-vs-gemini)
3. [Getting Started](#getting-started)
4. [Chat Completions API](#chat-completions-api)
5. [Function Calling and Tool Use](#function-calling-and-tool-use)
6. [Assistants API vs Chat Completions API](#assistants-api-vs-chat-completions-api)
7. [Structured Outputs (JSON Mode)](#structured-outputs-json-mode)
8. [FAQ](#faq)
9. [Resources](#resources)

---

## Available Models

### Language Models

| Model | Context Window | Strengths | Best For |
|---|---|---|---|
| GPT-4o | 128K | Fast, multimodal (text + vision), cost-efficient | General-purpose production |
| GPT-4o-mini | 128K | Very fast, low cost | High-volume, latency-sensitive |
| o1 | 200K | Extended reasoning, complex problem solving | Math, science, multi-step reasoning |
| o3-mini | 200K | Fast reasoning at lower cost than o1 | Code, structured reasoning tasks |
| o4-mini | 200K | Latest reasoning model, improved instruction following | Agentic tasks, tool use with reasoning |

### Embedding Models

| Model | Dimensions | Max Tokens | Cost per 1M tokens |
|---|---|---|---|
| text-embedding-3-large | 3072 (truncatable) | 8191 | ~$0.13 |
| text-embedding-3-small | 1536 (truncatable) | 8191 | ~$0.02 |

### Other Models

- **DALL-E 3:** Text-to-image generation. Outputs 1024×1024, 1024×1792, or 1792×1024 images.
- **Whisper:** Speech-to-text transcription. Supports 57 languages. Available via `/audio/transcriptions` endpoint.
- **TTS (Text-to-Speech):** Six voices (alloy, echo, fable, onyx, nova, shimmer). Returns MP3 audio from text input.

---

## API Comparison: OpenAI vs Claude vs Gemini

| Feature | OpenAI GPT-4o | Claude Sonnet 4.6 | Gemini 1.5 Pro |
|---|---|---|---|
| Context Window | 128K tokens | 200K tokens | 1M tokens |
| Input Price (per 1M tokens) | ~$2.50 | ~$3.00 | ~$1.25 |
| Output Price (per 1M tokens) | ~$10.00 | ~$15.00 | ~$5.00 |
| Vision (image input) | Yes | Yes | Yes |
| Function/Tool Calling | Yes | Yes | Yes |
| JSON Mode / Structured Output | Yes (strict schema) | Yes | Yes |
| Code Generation | Excellent | Excellent | Good |
| Instruction Following | Strong | Very strong | Strong |
| Safety/Refusal Rate | Moderate | Higher (Constitutional AI) | Moderate |
| Latency (typical) | ~800ms–2s | ~700ms–2s | ~1–3s |
| Native Multimodality | Text, image, audio | Text, image | Text, image, video, audio |
| Free Tier | No | No | Yes (Gemini API) |
| Best For | General production, ecosystem breadth | Long-context, agentic, safety-critical | Long document analysis, cost efficiency |

> **Pricing note:** Prices fluctuate. Always verify current rates at [platform.openai.com/pricing](https://platform.openai.com/pricing), [anthropic.com/pricing](https://anthropic.com/pricing), and [ai.google.dev/pricing](https://ai.google.dev/pricing).

---

## Getting Started

### 1. Get an API Key

Create an account at [platform.openai.com](https://platform.openai.com), navigate to **API keys**, and generate a key. Store it in an environment variable — never hardcode it in source code.

```bash
export OPENAI_API_KEY="sk-..."
```

### 2. Install the Python SDK

```bash
pip install openai
```

### 3. First API Call

```python
from openai import OpenAI

client = OpenAI()  # reads OPENAI_API_KEY from environment

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is retrieval-augmented generation?"}
    ],
    max_tokens=500,
    temperature=0.7
)

print(response.choices[0].message.content)
```

### Node.js SDK

```bash
npm install openai
```

```javascript
import OpenAI from "openai";

const client = new OpenAI(); // reads OPENAI_API_KEY from process.env

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain embeddings in one paragraph." }
  ],
});

console.log(response.choices[0].message.content);
```

---

## Chat Completions API

The Chat Completions API (`POST /v1/chat/completions`) is the primary interface for language generation. It accepts a list of messages and returns a model-generated response.

### Message Roles

| Role | Purpose |
|---|---|
| `system` | Sets the model's behavior, persona, and constraints for the session |
| `user` | Represents the human turn in the conversation |
| `assistant` | Represents the model's prior responses; used for multi-turn conversation history |
| `tool` | Returns the result of a tool/function call |

### Key Parameters

| Parameter | Type | Description |
|---|---|---|
| `model` | string | Model identifier (e.g., `"gpt-4o"`) |
| `messages` | array | Conversation history |
| `temperature` | float 0–2 | Randomness. 0 = deterministic, 1 = default creative |
| `max_tokens` | int | Maximum output length in tokens |
| `top_p` | float 0–1 | Nucleus sampling. Alternative to temperature |
| `stream` | bool | Stream tokens as they are generated (SSE) |
| `response_format` | object | Enforce `json_object` or `json_schema` output |
| `tools` | array | Define functions the model can call |

### Streaming

Set `stream: true` to receive tokens incrementally via Server-Sent Events (SSE). Recommended for user-facing applications to reduce perceived latency.

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku about APIs."}],
    stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)
```

---

## Function Calling and Tool Use

Function calling (also called tool use) allows the model to request execution of developer-defined functions. The model identifies when a function should be called, formats the arguments as JSON, and waits for the result before continuing its response.

### Use Cases
- Query a database or API based on user intent
- Perform calculations or unit conversions
- Execute code via a sandbox
- Retrieve real-time data (weather, prices, sports scores)

### Example: Weather Tool

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city name, e.g. Tokyo"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["city"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
    tool_choice="auto"
)

# Check if the model wants to call a function
tool_call = response.choices[0].message.tool_calls[0]
print(tool_call.function.name)       # "get_current_weather"
print(tool_call.function.arguments)  # '{"city": "Tokyo"}'
```

---

## Assistants API vs Chat Completions API

The OpenAI platform provides two primary conversation interfaces with different design philosophies.

| Feature | Chat Completions API | Assistants API |
|---|---|---|
| State management | Stateless — caller sends full history | Stateful — OpenAI stores thread history |
| File handling | Pass content inline in messages | Upload files via Files API; persistent |
| Built-in retrieval | No | Yes (file search tool) |
| Code execution | No | Yes (code interpreter tool) |
| Complexity | Simple | Higher — Threads, Runs, Steps objects |
| Cost | Tokens only | Tokens + storage + tools |
| Best for | Full control, custom state, streaming | Multi-turn agents with file access |

**Recommendation:** Use **Chat Completions** for most applications. The Assistants API adds managed state and built-in tools, but it introduces vendor lock-in for thread storage and higher operational complexity. For RAG workloads, implementing your own retrieval on top of Chat Completions typically gives more control over chunking, ranking, and cost.

---

## Structured Outputs (JSON Mode)

The OpenAI API supports two modes for enforcing structured output:

### JSON Mode (`response_format: {type: "json_object"}`)
Instructs the model to always return valid JSON. The schema is not enforced — the model decides the structure. Instruct the desired schema in the system prompt.

```python
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},
    messages=[
        {"role": "system", "content": "Return a JSON object with keys: name, score, reason."},
        {"role": "user", "content": "Evaluate: The product ships quickly."}
    ]
)
# Response will always be valid JSON
```

### Strict JSON Schema (`response_format: {type: "json_schema"}`)
Enforces an exact JSON schema using constrained decoding. The model can only generate tokens that produce output matching the specified schema. Zero schema violations.

```python
response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",  # Strict schema requires this version or later
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "sentiment_result",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "sentiment": {"type": "string", "enum": ["positive", "neutral", "negative"]},
                    "confidence": {"type": "number"},
                    "summary": {"type": "string"}
                },
                "required": ["sentiment", "confidence", "summary"],
                "additionalProperties": False
            }
        }
    },
    messages=[{"role": "user", "content": "Analyze: Delivery was fast but packaging was poor."}]
)
```

---

## FAQ

**OpenAI API vs Claude API — which is better?**

Neither is universally better; they have different strengths. GPT-4o offers the broadest ecosystem (most integrations, most documentation, most community examples), lower output pricing (~$10/1M tokens vs Claude's $15/1M tokens), and strong multimodal capabilities including audio. Claude Sonnet 4.6 offers a larger context window (200K vs 128K), stronger instruction following in complex agentic tasks, and Constitutional AI training that tends to produce more nuanced responses to edge cases. For most new projects, both are viable — evaluate on your specific task domain.

**What is GPT-4o?**

GPT-4o (the "o" stands for "omni") is OpenAI's flagship multimodal model, released in May 2024 and updated iteratively through 2025–2026. It processes text, images, and audio natively in a single model rather than routing modalities through separate systems. GPT-4o offers roughly the same intelligence as GPT-4 Turbo at lower cost and higher speed, making it the default choice for production applications that previously used GPT-4.

**How much does the OpenAI API cost?**

As of early 2026: GPT-4o costs approximately $2.50 per million input tokens and $10.00 per million output tokens. GPT-4o-mini costs approximately $0.15/$0.60 per million in/out tokens. Embedding models start at $0.02 per million tokens (text-embedding-3-small). Costs scale with usage and OpenAI adjusts pricing periodically. The platform has no minimum spend; you pay only for what you use. Monitor spend via the [usage dashboard](https://platform.openai.com/usage).

**What is the difference between o1 and GPT-4o?**

GPT-4o is optimized for speed and cost across general tasks. The o1/o3/o4 model family uses extended "chain-of-thought" reasoning — the model performs internal reasoning steps before producing its final answer. This makes o-series models significantly better at multi-step math, scientific reasoning, and complex code problems, but they are slower and more expensive per query. For everyday tasks (summarization, Q&A, content generation), GPT-4o is the better choice. For tasks that require deep logical reasoning or where accuracy on hard problems is critical, o-series models outperform.

**Does the OpenAI API support streaming?**

Yes. Set `stream: True` in the Chat Completions request to receive tokens via Server-Sent Events (SSE) as they are generated. The Python and Node.js SDKs handle SSE parsing automatically. Streaming is recommended for any user-facing interface where reducing perceived latency improves the experience.

**What are rate limits on the OpenAI API?**

Rate limits vary by model and account tier. New accounts start at Tier 1: 500 requests per minute (RPM) and 30,000 tokens per minute (TPM) for GPT-4o. Limits increase automatically as you spend more on the API. Check current limits at [platform.openai.com/account/rate-limits](https://platform.openai.com/account/rate-limits). For high-volume applications, implement exponential backoff on 429 errors.

---

## Resources

### Compare with Claude API

Claude offers a 200K context window, strong instruction following, and Constitutional AI safety training. Worth benchmarking against GPT-4o for your use case.

[Try Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=openai-api)

### AI Practical Toolkit (Gumroad)

API integration templates, cost optimization guides, and production patterns for OpenAI, Claude, and Gemini APIs.

[AI Practical Toolkit →](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=openai-api)

---

*Last updated: April 2026. See [AFFILIATES.md](../AFFILIATES.md) for disclosure details.*
