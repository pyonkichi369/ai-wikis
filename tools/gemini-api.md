# Gemini API — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Gemini API** is Google DeepMind's API for accessing the Gemini family of large language models, including Gemini 2.5 Pro, Gemini 2.0 Flash, and Gemini 1.5 Pro. It offers a free tier via Google AI Studio, 1 million token context windows, and native multimodal capabilities (text, image, audio, video, code).

Gemini API is the primary competitor to Anthropic's Claude API and OpenAI's GPT-4o API in the enterprise LLM market.

## Model Lineup (2026)

| Model | Context | Best For | Price (input/1M) |
|-------|---------|---------|-----------------|
| Gemini 2.5 Pro | 1M tokens | Complex reasoning, long docs | $3.50 |
| Gemini 2.0 Flash | 1M tokens | Speed + cost balance | $0.075 |
| Gemini 1.5 Flash | 1M tokens | High-volume tasks | $0.075 |
| Gemini 1.5 Pro | 2M tokens | Longest context | $3.50 |
| Gemma 3 (open) | 128K | Self-hosted, privacy | Free |

**Free tier**: Gemini 2.0 Flash available at 0 cost via Google AI Studio (rate-limited). Ideal for prototyping.

## Gemini API vs Claude API vs OpenAI API

| Dimension | Gemini API | Claude API | OpenAI API |
|-----------|-----------|-----------|-----------|
| Free tier | **Yes** (AI Studio, Flash) | No | No |
| Max context | **2M tokens** (1.5 Pro) | 200K tokens | 128K tokens |
| Multimodal | Text/Image/Audio/Video | Text/Image | Text/Image |
| Coding (SWE-bench) | Strong | **Best** (Sonnet) | Strong |
| Safety filtering | Strict (Google policy) | Balanced | Balanced |
| Structured output | JSON mode | Tool use | JSON mode |
| Enterprise compliance | SOC 2, HIPAA (Vertex AI) | SOC 2, HIPAA | SOC 2, HIPAA |
| Pricing | Competitive | Competitive | Higher |
| Speed | Very fast (Flash) | Fast | Fast |
| Best for | Long docs, free tier, Google ecosystem | Coding, agents, safety | Broad compatibility |

## Getting Started with Gemini API

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

model = genai.GenerativeModel("gemini-2.0-flash")
response = model.generate_content("Explain RAG in 3 bullet points")
print(response.text)
```

Get API key: [aistudio.google.com](https://aistudio.google.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=gemini-api)

## Gemini API Multimodal (Vision + Audio)

```python
import google.generativeai as genai
from pathlib import Path

model = genai.GenerativeModel("gemini-2.0-flash")

# Vision: analyze an image
image_data = Path("screenshot.png").read_bytes()
response = model.generate_content([
    {"mime_type": "image/png", "data": image_data},
    "Describe the UI issues in this screenshot"
])
print(response.text)
```

Gemini natively handles PDFs, images, audio files, and YouTube video URLs — without separate preprocessing.

## 1M Token Context: Use Cases

The 1 million token context window (vs Claude's 200K) enables:

| Use Case | Tokens Required | Fits in Gemini? |
|---------|----------------|----------------|
| Entire codebase (50K LOC) | ~600K | Yes |
| 800-page PDF book | ~400K | Yes |
| Full conversation history | ~200K | Yes |
| 10-hour audio transcript | ~500K | Yes |
| Claude's max context | 200K | Yes (5x) |

**When to choose Gemini**: Long document analysis, full-codebase review, PDF processing, audio transcription + analysis.

**When to choose Claude**: Coding agents, instruction-following, safety-critical outputs, multi-step reasoning.

## Gemini API Pricing vs Claude

| Task | Gemini 2.0 Flash | Claude Haiku | Winner |
|------|-----------------|-------------|--------|
| 1M input tokens | $0.075 | $0.80 | Gemini 10x cheaper |
| 1M output tokens | $0.30 | $4.00 | Gemini 13x cheaper |
| Free tier | Yes | No | Gemini |
| Quality (coding) | Good | Better | Claude |
| Quality (reasoning) | Good | Better | Claude |

**Cost optimization pattern**: Use Gemini Flash for high-volume preprocessing → Claude Sonnet for final generation requiring quality.

## Google AI Studio vs Vertex AI

| Feature | AI Studio | Vertex AI |
|---------|-----------|----------|
| Setup | Minutes | Days |
| Free tier | Yes | No |
| Enterprise compliance | No | Yes (SOC 2, HIPAA) |
| Fine-tuning | Limited | Full |
| SLAs | No | Yes |
| Best for | Dev/prototype | Production |

## Integration with LangChain / LlamaIndex

```python
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key="...")
response = llm.invoke([HumanMessage(content="Explain vector databases")])
print(response.content)
```

Both LangChain and LlamaIndex support Gemini with drop-in compatibility alongside Claude and OpenAI.

## Frequently Asked Questions

**Q: What is Gemini API?**
A: Gemini API is Google DeepMind's API for accessing Gemini language models. It offers free access via Google AI Studio, 1M+ token context windows, and multimodal capabilities (text, image, audio, video). Start at [aistudio.google.com](https://aistudio.google.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=gemini-api).

**Q: Is Gemini API free?**
A: Yes. Gemini 2.0 Flash is available for free via Google AI Studio with rate limits. This is the only major LLM API with a meaningful free tier — useful for prototyping and high-volume preprocessing.

**Q: Gemini API vs Claude API — which is better?**
A: Gemini wins on: free tier, context window (1M vs 200K), multimodal breadth (video/audio), and cost (10x cheaper per token with Flash). Claude wins on: coding accuracy (SWE-bench), instruction-following, agent reliability, and safety. For AI applications requiring code generation or agents, Claude is preferred.

**Q: What is the context window of Gemini 1.5 Pro?**
A: 2 million tokens — the largest of any production LLM API as of 2026. This enables processing entire codebases, full books, or 10+ hours of audio in one call.

**Q: Can I use Gemini API with LangChain?**
A: Yes. Install `langchain-google-genai` and use `ChatGoogleGenerativeAI`. Full compatibility with LangChain's chain/agent abstractions, with the same interface as Claude and OpenAI.

**Q: How does Vertex AI differ from Google AI Studio?**
A: AI Studio is for development (free, no SLA). Vertex AI is for production (paid, enterprise compliance: SOC 2, HIPAA, VPC isolation). For applications handling sensitive data or requiring 99.9%+ uptime, use Vertex AI.

## Resources

- Google AI Studio (free): [aistudio.google.com](https://aistudio.google.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=gemini-api)
- For Claude API (higher coding quality): [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=gemini-api)
- **AI Agent Prompts Pack** (multi-LLM prompts, Gemini + Claude orchestration templates): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=gemini-api)

## Related

- [Claude API](claude-api.md)
- [ChatGPT API](chatgpt-api.md)
- [RAG](../concepts/rag.md)
- [Multi-Agent System](../concepts/multi-agent-system.md)
