# LLM Context Window — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Context window** refers to the maximum amount of text (measured in tokens) that a large language model can process in a single inference call — including the input (system prompt + conversation history + documents) and the output (generated response). Models cannot access text outside their context window; information must be explicitly included or retrieved via RAG.

In 2026, context windows have grown from GPT-3's 4K tokens (2020) to Gemini 1.5 Pro's 2 million tokens — a 500x increase in 6 years.

## Context Windows by Model (2026)

| Model | Context Window | Effective Use | Notes |
|-------|---------------|---------------|-------|
| Claude Sonnet 4.6 | **200K tokens** | ~150K | Best instruction-following in class |
| Claude Opus 4.6 | **200K tokens** | ~150K | Highest reasoning quality |
| GPT-4o | 128K tokens | ~100K | OpenAI standard |
| GPT-4o-mini | 128K tokens | ~100K | Cost-optimized |
| Gemini 2.5 Pro | **1M tokens** | ~800K | Best for long docs |
| Gemini 1.5 Pro | **2M tokens** | ~1.5M | Largest available |
| Gemini 2.0 Flash | 1M tokens | ~800K | Fast + cheap |
| Llama 3.3 70B | 128K tokens | ~100K | Open source |
| Mistral Large | 128K tokens | ~100K | EU-based |

## What Is a Token?

Tokens are the unit of measurement for LLM context windows:

- 1 token ≈ 4 characters in English
- 1 token ≈ 2-3 characters in Japanese/Chinese (denser encoding)
- 100 tokens ≈ 75 words
- 1,000 tokens ≈ 750 words ≈ 1-2 pages of text
- 1M tokens ≈ ~750,000 words ≈ 750-page book

**Context window conversion guide**:

| Context | Approximate Content |
|---------|-------------------|
| 4K tokens | Short essay, 3-page document |
| 32K tokens | ~25-page document, short book chapter |
| 128K tokens | ~100-page document, entire short novel |
| 200K tokens | ~150-page document (Claude default) |
| 1M tokens | ~750-page book, large codebase (~50K LOC) |
| 2M tokens | Two 750-page books, massive codebases |

## Context Window Pricing Impact

Larger context = higher cost per call:

```
Claude Sonnet 4.6 pricing:
Input:  $3.00 / 1M tokens
Output: $15.00 / 1M tokens

A 50,000-token document (25K LOC codebase):
Input cost:  50K × ($3.00/1M) = $0.15 per call
Output cost: 2K  × ($15.00/1M) = $0.03 per call
Total: ~$0.18 per full codebase analysis
```

## "Lost in the Middle" Problem

Research shows LLMs perform worse at retrieving information from the middle of long contexts compared to the beginning and end:

```
Retrieval accuracy by position in context:
Beginning: ████████████ 95%
Middle:    ████████     65%
End:       ██████████   85%
```

**Mitigation strategies**:
1. Place critical instructions at the beginning AND end of context
2. Use RAG to retrieve only relevant chunks instead of stuffing full context
3. Summarize long documents before including in context

## Context Window vs RAG: When to Use Each

| Scenario | Use Context Window | Use RAG |
|---------|-------------------|---------|
| Document fits in context | ✓ | |
| Document > context limit | | ✓ |
| Real-time data (news, prices) | | ✓ |
| Static documents | ✓ | |
| Precise citation required | | ✓ |
| Holistic analysis of whole doc | ✓ | |
| Cost-sensitive high volume | | ✓ |

**Rule of thumb**: If the document fits comfortably (under 50% of context), use full context for better coherence. If it doesn't fit or you need current data, use RAG.

## Context Management Patterns

### Sliding Window

```python
def build_context_window(messages: list[dict], max_tokens: int = 150000) -> list[dict]:
    """Keep only the most recent messages that fit in context."""
    total_tokens = 0
    kept_messages = []
    
    for message in reversed(messages):
        tokens = len(message["content"]) // 4  # approximate
        if total_tokens + tokens > max_tokens:
            break
        kept_messages.insert(0, message)
        total_tokens += tokens
    
    return kept_messages
```

### Summarization Compression

```python
import anthropic

client = anthropic.Anthropic()

def compress_conversation(messages: list[dict]) -> str:
    """Summarize old messages to free up context."""
    conversation_text = "\n".join(
        f"{m['role']}: {m['content']}" for m in messages[:-10]
    )
    
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # Cheap model for compression
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"Summarize this conversation concisely, preserving key decisions:\n\n{conversation_text}"
        }]
    )
    return response.content[0].text
```

## Frequently Asked Questions

**Q: What is a context window in LLMs?**
A: A context window is the maximum amount of text an LLM can process in one inference call. It includes everything: system prompt, conversation history, documents, and generated output. Claude's context window is 200K tokens (~150,000 words). Text outside the context window is inaccessible to the model.

**Q: How many tokens is 200K?**
A: 200,000 tokens ≈ 150,000 words ≈ a 150-page document ≈ a medium-sized codebase (30-40K lines). Claude's 200K context is sufficient for most single-document analysis tasks.

**Q: Which LLM has the largest context window?**
A: Gemini 1.5 Pro has the largest at 2 million tokens (~1.5 million words ≈ two 750-page books). Gemini 2.5 Pro and 2.0 Flash offer 1 million tokens. Claude offers 200K tokens with the best instruction-following at long context.

**Q: Does larger context window mean better performance?**
A: Not always. Larger context windows allow more input, but the "lost in the middle" problem means models recall information from the middle of long contexts less accurately. Claude at 200K typically outperforms Gemini at 1M for precise reasoning tasks, even with less total context.

**Q: When should I use RAG instead of a large context window?**
A: Use RAG when: documents exceed the context limit, data changes frequently (real-time), cost is a concern (RAG retrieves only relevant chunks), or precise citation to specific sources is required. Use full context for holistic document analysis where chunk retrieval might miss cross-document patterns.

**Q: What happens when the context window is exceeded?**
A: The API returns an error (typically "context_length_exceeded"). Older messages are not silently dropped — you must explicitly manage context size. Strategies: sliding window (drop oldest), summarization compression, or switch to RAG.

## Resources

- Build with Claude's 200K context: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-context-window)
- **AI Agent Prompts Pack** (context management templates, summarization patterns, RAG vs context decision trees): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-context-window)

## Related

- [RAG](rag.md)
- [Claude API](../tools/claude-api.md)
- [Gemini API](../tools/gemini-api.md)
- [Prompt Engineering](prompt-engineering.md)
