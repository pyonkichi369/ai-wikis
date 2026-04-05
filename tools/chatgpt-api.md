# ChatGPT API (OpenAI API) — Complete Guide 2026

**ChatGPT API** (officially the **OpenAI API**) is a REST API developed by OpenAI that provides programmatic access to GPT-4o, GPT-4o mini, o1, o3, and other OpenAI language models. It enables developers to integrate AI text generation, image analysis, function calling, and reasoning capabilities into applications.

## Model Lineup (2026)

| Model | Context | Input Cost | Output Cost | Best For |
|-------|---------|-----------|------------|----------|
| gpt-4o | 128K tokens | $5/1M | $15/1M | General tasks, vision |
| gpt-4o-mini | 128K tokens | $0.15/1M | $0.60/1M | High-volume, cost-sensitive |
| o3 | 200K tokens | $10/1M | $40/1M | Complex reasoning |
| o3-mini | 200K tokens | $1.10/1M | $4.40/1M | Reasoning at lower cost |
| o1 | 200K tokens | $15/1M | $60/1M | Research, complex problems |

## OpenAI API vs Claude API

| Dimension | OpenAI API | Claude API |
|-----------|-----------|-----------|
| Context window | 128K tokens | 200K tokens |
| Pricing (mid-tier) | $5/$15 per 1M (GPT-4o) | $3/$15 per 1M (Sonnet) |
| Reasoning models | o1, o3, o3-mini | — |
| Safety focus | Moderation API | Constitutional AI |
| Vision | Yes (GPT-4o) | Yes |
| Function calling | Yes | Yes (Tool use) |
| Streaming | Yes | Yes |
| Best known for | Breadth of integrations, DALL-E | Long context, safety, coding |

**Cost comparison (mid-tier)**:
- GPT-4o: $5/1M input, $15/1M output
- Claude Sonnet: $3/1M input, $15/1M output
- **Claude Sonnet is 40% cheaper on input tokens**

## Quick Start

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Explain RAG in one paragraph."}
    ]
)
print(response.choices[0].message.content)
```

Install: `pip install openai`

## Function Calling (Tool Use)

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools
)
```

## Use Cases

- **Chatbots**: Customer support, FAQ automation
- **Code generation**: Copilot-style features, code review
- **Document processing**: Summarization, extraction, classification
- **Image analysis**: Receipt parsing, product recognition (GPT-4o vision)
- **Reasoning tasks**: Multi-step problem solving (o3, o1)
- **Content creation**: Blog posts, product descriptions

## Frequently Asked Questions

**Q: What is the ChatGPT API?**
A: The ChatGPT API (OpenAI API) is OpenAI's programmatic interface to GPT-4o, o1, and other models, enabling developers to add AI capabilities to applications via REST API.

**Q: Is the OpenAI API free?**
A: No. The OpenAI API is usage-based, starting at $0.15/1M tokens (GPT-4o mini). New accounts receive $5 in free credits. See pricing at platform.openai.com.

**Q: What is the difference between ChatGPT and the OpenAI API?**
A: ChatGPT is OpenAI's consumer product (chat interface). The OpenAI API is the developer interface for building applications. Both use the same underlying models.

**Q: Is GPT-4o better than Claude?**
A: For breadth of third-party integrations and vision tasks, GPT-4o is widely used. For long-document analysis (200K context), safety-critical applications, and coding tasks, Claude Sonnet is generally preferred and 40% cheaper on input. See [Claude API →](claude-api.md)

**Q: Does the OpenAI API support streaming?**
A: Yes. Streaming is supported via Server-Sent Events using `stream=True`.

**Q: What is o3?**
A: o3 is OpenAI's advanced reasoning model that uses chain-of-thought processing for complex multi-step problems. It is significantly more capable than GPT-4o for math, science, and coding challenges, but slower and more expensive.

## Getting Started

1. Sign up at [platform.openai.com](https://platform.openai.com/)
2. Install SDK: `pip install openai`
3. Set API key: `export OPENAI_API_KEY=sk-...`
4. Start with `gpt-4o-mini` for cost efficiency

> **Comparing APIs?** The [AI Agent Prompts Pack](https://belleofficial.gumroad.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=chatgpt-api) includes production-ready prompts for both OpenAI and Claude APIs — with routing logic to use the cheapest model for each task type.

## Resources

- Official docs: platform.openai.com/docs
- Compare with Claude: [Claude API →](claude-api.md)
- **AI Agent Prompts Pack** (multi-model agent patterns): [belleofficial.gumroad.com](https://belleofficial.gumroad.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=chatgpt-api)
- Related: [Prompt Engineering](../concepts/prompt-engineering.md) · [AI Agent](../concepts/ai-agent.md) · [RAG](../concepts/rag.md)
