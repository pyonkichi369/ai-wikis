# Mistral AI API — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**The Mistral AI API provides access to Mistral's family of efficient open-weight and proprietary LLMs — including Mistral Large, Mistral Small, and Codestral — via an OpenAI-compatible REST API, offering competitive performance at lower cost with European data residency.**

## Model Lineup (2026)

| Model | Context | Input Cost | Output Cost | Best For |
|-------|---------|-----------|------------|----------|
| Mistral Large 2 | 128K tokens | $2/1M | $6/1M | Complex reasoning, multilingual |
| Mistral Small 3 | 128K tokens | $0.10/1M | $0.30/1M | High-volume tasks, low latency |
| Mistral Nemo | 128K tokens | $0.15/1M | $0.15/1M | On-device and edge deployment |
| Mistral 7B | 32K tokens | $0.25/1M | $0.25/1M | Self-hosted, fine-tuning base |
| Codestral | 256K tokens | $1/1M | $3/1M | Code generation, completion, FIM |
| Pixtral Large | 128K tokens | $2/1M | $6/1M | Vision + language tasks |

## OpenAI-Compatible Quick Start

The Mistral API uses the same request/response schema as OpenAI, making migration straightforward.

```python
from mistralai import Mistral

client = Mistral(api_key="your_api_key")

response = client.chat.complete(
    model="mistral-large-latest",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain transformer attention in 3 sentences."}
    ],
    temperature=0.7,
    max_tokens=512
)

print(response.choices[0].message.content)
```

Using the OpenAI SDK directly (drop-in replacement):

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_mistral_api_key",
    base_url="https://api.mistral.ai/v1"
)

response = client.chat.completions.create(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Hello"}]
)
```

## European Data Residency

Mistral AI is a French company headquartered in Paris. Key privacy properties:

- Data processed within EU infrastructure by default
- Compliant with GDPR and EU AI Act requirements
- No data used for model training by default (enterprise tier)
- Le Plateforme (la Plateforme) offers dedicated deployments in EU regions
- Suitable for organizations with EU data sovereignty requirements (healthcare, finance, government)

## Codestral: Code-Specialized Model

Codestral is Mistral's dedicated code model with a 256K token context window.

```python
# Fill-in-the-Middle (FIM) for code completion
response = client.fim.complete(
    model="codestral-latest",
    prompt="def fibonacci(n):\n    ",
    suffix="\n    return result",
    max_tokens=256
)

# Standard code generation
response = client.chat.complete(
    model="codestral-latest",
    messages=[{
        "role": "user",
        "content": "Write a Python function to parse ISO 8601 timestamps"
    }]
)
```

Codestral supports 80+ programming languages and is optimized for autocomplete tasks, making it suitable as a GitHub Copilot alternative.

## Le Chat: Mistral's Consumer Interface

Le Chat (chat.mistral.ai) is Mistral's equivalent to Claude.ai or ChatGPT. It provides:

- Web and mobile access to Mistral models
- Image and document upload
- Web search integration
- Free tier with Mistral Small; paid tier unlocks Mistral Large
- Canvas feature for document drafting and editing

## Mistral vs Claude vs GPT-4o Comparison

| Dimension | Mistral Large 2 | Claude Sonnet 4.6 | GPT-4o |
|-----------|----------------|-------------------|--------|
| Input price (1M tokens) | $2 | $3 | $5 |
| Output price (1M tokens) | $6 | $15 | $15 |
| Context window | 128K | 200K | 128K |
| Code quality | Strong | Strong | Strong |
| Multilingual | Excellent (EU languages) | Good | Good |
| Data residency | EU by default | US (AWS) | US (Azure) |
| Open weights available | Yes (7B, Nemo) | No | No |
| Function calling | Yes | Yes | Yes |
| Vision | Yes (Pixtral) | Yes | Yes |

For EU-based applications with cost pressure, Mistral Large offers comparable quality to GPT-4o at lower cost with better regulatory positioning.

## Mistral Function Calling

```python
import json
from mistralai import Mistral

client = Mistral(api_key="your_api_key")

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.complete(
    model="mistral-large-latest",
    messages=[{"role": "user", "content": "What is the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"
)
```

## Embeddings API

Mistral provides its own embedding model for RAG and semantic search pipelines.

```python
from mistralai import Mistral

client = Mistral(api_key="your_api_key")

response = client.embeddings.create(
    model="mistral-embed",
    inputs=["AI is transforming enterprise workflows", "Machine learning basics"]
)

vectors = [item.embedding for item in response.data]
print(f"Embedding dimension: {len(vectors[0])}")  # 1024
```

`mistral-embed` produces 1024-dimensional vectors at $0.10/1M tokens — significantly cheaper than OpenAI's `text-embedding-3-large` ($0.13/1M) and equivalent in quality on English and French benchmarks.

## Streaming Responses

```python
from mistralai import Mistral

client = Mistral(api_key="your_api_key")

with client.chat.stream(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Explain gradient descent step by step."}]
) as stream:
    for text in stream.get_text_stream():
        print(text, end="", flush=True)
```

## Pricing Summary

| Tier | Model | Input | Output |
|------|-------|-------|--------|
| Budget | Mistral Small 3 | $0.10/1M | $0.30/1M |
| Budget | Mistral Nemo | $0.15/1M | $0.15/1M |
| Mid | Codestral | $1/1M | $3/1M |
| Premium | Mistral Large 2 | $2/1M | $6/1M |
| Premium | Pixtral Large | $2/1M | $6/1M |
| Embeddings | mistral-embed | $0.10/1M | — |

Batch processing is available at a 50% discount for asynchronous workloads.

## Getting Started

1. Create an account at [console.mistral.ai](https://console.mistral.ai)
2. Generate an API key under API Keys
3. Install: `pip install mistralai`
4. Free tier includes limited credits for evaluation

For Claude API as an alternative with larger context (200K tokens) and strong reasoning: [claude.ai/referral](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mistral-api)

For a practical guide to AI stack selection and cost optimization: [AI Tools Solopreneur Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mistral-api)

## FAQ

**Q: Is the Mistral API compatible with existing OpenAI client code?**
A: Yes. The Mistral API follows the OpenAI REST schema for chat completions. You can use the official OpenAI Python SDK by setting `base_url="https://api.mistral.ai/v1"` and replacing your API key. Most endpoints — chat completions, embeddings, and function calling — are fully compatible without code changes.

**Q: What is the difference between open-weight Mistral models and the API models?**
A: Mistral releases certain models (such as Mistral 7B and Mixtral 8x7B) as open weights under the Apache 2.0 license, meaning you can download and self-host them. The API models (Mistral Large, Mistral Small, Codestral) are proprietary and available only through the managed API. Open-weight models are suitable for fine-tuning and on-premise deployment; API models offer better performance without infrastructure management.

**Q: Does Mistral store or train on my API data?**
A: By default, Mistral does not use API inputs and outputs for model training. Enterprise agreements include explicit data processing addendums (DPAs) for GDPR compliance. Data is processed within EU infrastructure, which distinguishes Mistral from US-based providers for organizations with European data sovereignty requirements.

**Q: What makes Codestral different from using a general model for code?**
A: Codestral is trained specifically on code with a 256K token context window (versus 128K for general models), enabling analysis of large codebases in a single request. It natively supports Fill-in-the-Middle (FIM) — a technique where the model completes code given both a prefix and suffix — which is the standard method used by IDE autocomplete tools. General models lack FIM support and perform less accurately on large-file code tasks.

**Q: How does Mistral's multilingual performance compare to other providers?**
A: Mistral models show particularly strong performance on European languages (French, German, Spanish, Italian, Portuguese) due to training data composition and the company's European origins. On standard multilingual benchmarks such as MGSM, Mistral Large 2 is competitive with or exceeds GPT-4o on EU languages while remaining behind on low-resource Asian and African languages. For applications primarily targeting EU language speakers, Mistral is a cost-effective choice.
