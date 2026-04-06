# Groq — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Groq is an AI inference company that provides ultra-fast LLM inference via its custom LPU (Language Processing Unit) hardware, offering Llama, Mistral, and Gemma models at speeds 10-100x faster than GPU-based inference — making it the fastest available LLM API for latency-sensitive applications.**

Founded in 2016 by former Google TPU architect Jonathan Ross, Groq built purpose-built silicon for deterministic, low-latency inference rather than adapting GPUs originally designed for graphics and training workloads. Groq Cloud launched as a public API in 2024 and has become the default choice for applications where response speed is the primary constraint.

## Speed Comparison: Groq vs Competitors

| Provider | Model | Speed (tokens/sec) | TTFT (ms) | Pricing (per 1M tokens) |
|----------|-------|-------------------|-----------|-------------------------|
| Groq | Llama 3.3 70B | ~800–1,200 | ~200ms | $0.59 input / $0.79 output |
| Groq | Mixtral 8x7B | ~500–800 | ~150ms | $0.24 input / $0.24 output |
| Groq | Llama 3.1 8B | ~1,200–2,000 | ~100ms | $0.05 input / $0.08 output |
| OpenAI | GPT-4o mini | ~80–120 | ~400ms | $0.15 input / $0.60 output |
| Anthropic | Claude 3.5 Haiku | ~80–100 | ~500ms | $0.80 input / $4.00 output |
| Together.ai | Llama 3.3 70B | ~100–200 | ~300ms | $0.88 input / $0.88 output |
| Fireworks.ai | Llama 3.3 70B | ~80–150 | ~250ms | $0.90 input / $0.90 output |

TTFT = Time To First Token. Speeds vary by load; Groq's LPU architecture provides more consistent latency under load than GPU-based competitors.

## LPU vs GPU Architecture

| Dimension | GPU (NVIDIA H100/A100) | Groq LPU |
|-----------|----------------------|----------|
| Design purpose | Parallel matrix math (training + inference) | Sequential token generation |
| Memory architecture | HBM (off-chip, high bandwidth) | On-chip SRAM (no off-chip memory bottleneck) |
| Latency consistency | Variable (memory-bound operations) | Deterministic (compiler-scheduled) |
| Throughput vs latency | Optimized for throughput | Optimized for latency |
| Multi-tenant efficiency | High (batch many requests) | Moderate (optimized per-request) |
| Power efficiency | Moderate | High (less memory movement) |
| Software stack | CUDA ecosystem | Groq compiler (fixed at compile time) |

The key insight: GPU inference latency is dominated by moving model weights from HBM (high-bandwidth memory) to compute units. Groq's LPU stores all weights on-chip in SRAM, eliminating this bottleneck. This makes the LPU extremely fast for sequential token generation (autoregressive decoding) but less suited for training or dynamic batching.

## Available Models (2026)

| Model | Parameters | Context | Best For |
|-------|-----------|---------|----------|
| Llama 3.3 70B | 70B | 128K | Reasoning, instruction following |
| Llama 3.1 8B | 8B | 128K | Fast simple tasks, high volume |
| Llama 3.2 11B Vision | 11B | 128K | Image understanding |
| Mixtral 8x7B | 8x7B MoE | 32K | Code generation, multilingual |
| Gemma 2 9B | 9B | 8K | Efficient tasks |
| Whisper Large v3 | — | — | Audio transcription |

All models are open-weight (Meta Llama, Google Gemma, Mistral). Groq does not currently offer proprietary models.

## OpenAI-Compatible API Quickstart

Groq's API is OpenAI-compatible, allowing drop-in replacement for applications using the OpenAI SDK:

```python
from groq import Groq

client = Groq(api_key="gsk_your_api_key")

chat_completion = client.chat.completions.create(
    messages=[
        {"role": "user", "content": "Explain gradient descent in one paragraph."}
    ],
    model="llama-3.3-70b-versatile",
    stream=True,
    max_tokens=512
)

for chunk in chat_completion:
    print(chunk.choices[0].delta.content or "", end="")
```

Install: `pip install groq`

**Using the OpenAI SDK (drop-in):**

```python
from openai import OpenAI

client = OpenAI(
    api_key="gsk_your_api_key",
    base_url="https://api.groq.com/openai/v1"
)
# All OpenAI SDK calls work identically
```

## Free Tier

Groq provides a free tier with rate limits:

| Limit | Free Tier |
|-------|-----------|
| Requests per minute | 30 |
| Tokens per minute | 6,000 |
| Tokens per day | 14,400 |
| API key required | Yes (free account) |

The free tier is sufficient for development, testing, and low-volume production use cases.

## Use Cases Where Speed Matters

| Use Case | Why Speed Matters | Recommended Model |
|----------|-------------------|------------------|
| Voice AI / speech response | Sub-300ms TTFT required for natural conversation | Llama 3.1 8B |
| Real-time gaming NPCs | Response must feel instant in-game | Llama 3.1 8B or Mixtral |
| Live coding assistance | Developer flow requires immediate feedback | Llama 3.3 70B |
| Autocomplete / typeahead | Must respond faster than user types | Llama 3.1 8B |
| Interactive demos / kiosks | Visible latency breaks user experience | Any Groq model |
| High-volume batch (cost) | Speed enables more requests per minute | Llama 3.1 8B |
| Streaming dashboards | Real-time data narration | Mixtral 8x7B |

For tasks where quality matters more than speed (long-form writing, complex reasoning), Anthropic Claude or OpenAI GPT-4o remain stronger choices. Groq's advantage is specifically latency and throughput at lower cost.

## Pricing (2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Llama 3.3 70B Versatile | $0.59 | $0.79 |
| Llama 3.1 8B Instant | $0.05 | $0.08 |
| Mixtral 8x7B | $0.24 | $0.24 |
| Llama 3.2 11B Vision | $0.18 | $0.18 |
| Gemma 2 9B | $0.20 | $0.20 |
| Whisper Large v3 | $0.111 / audio-hour | — |

Groq's pricing is competitive with other open-model providers and significantly cheaper than GPT-4o or Claude for equivalent-size models.

## Compare Before Building

For applications requiring the highest reasoning quality, Claude remains the benchmark:
[Try Claude](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=groq)

For a practical AI tools overview: [AI Tools Handbook (PDF)](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=groq)

## FAQ

**Q: Is Groq suitable for production applications?**
Yes. Groq Cloud offers SLAs for paid plans and has been used in production voice AI, customer service, and real-time analytics applications. The main constraint for production use is model selection: Groq only offers open-weight models (Llama, Mistral, Gemma), which may be less capable than GPT-4o or Claude on complex reasoning tasks. Teams often use Groq for latency-sensitive paths and route complex queries to higher-quality models.

**Q: How does Groq compare to running Llama locally (e.g., with Ollama)?**
Groq is significantly faster than local Ollama inference on consumer hardware. A MacBook M3 Pro runs Llama 3.1 8B at 30–60 tokens/second; Groq delivers 1,000–2,000 tokens/second for the same model. Local inference has zero API cost and complete data privacy, while Groq adds latency for API round-trips but delivers much higher throughput. For latency-sensitive production workloads, Groq outperforms both local inference and GPU cloud providers.

**Q: Does Groq support function calling and structured outputs?**
Yes. Groq supports OpenAI-compatible tool use (function calling) and JSON mode for structured outputs. These features work with Llama 3.1/3.3 models. Reliability of function calling on open models is generally slightly lower than GPT-4o or Claude, particularly for complex multi-tool scenarios. For straightforward structured extraction, Groq's function calling performs well.

**Q: What are the limitations of the LPU architecture?**
The LPU is optimized for inference (token generation), not training. Model weights must be compiled ahead of time for specific hardware, limiting flexibility to swap models dynamically. Groq does not support fine-tuned custom models — only the pre-compiled model catalog. The architecture is also less suited to heavily batched workloads where GPU-based providers can achieve higher throughput by processing many requests simultaneously.

**Q: Can Groq be used for audio transcription?**
Yes. Groq offers Whisper Large v3 for audio transcription at $0.111 per audio-hour, which is among the fastest transcription APIs available. The speed advantage makes Groq Whisper suitable for near-real-time transcription use cases such as live meeting notes, voice command parsing, and phone call analysis.
