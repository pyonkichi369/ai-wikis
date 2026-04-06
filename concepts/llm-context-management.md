# LLM Context Management — Strategies for Long Sessions 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**LLM context management refers to techniques for handling the finite context window of language models — including conversation summarization, sliding window approaches, retrieval augmentation, and context compression — to maintain coherent long-running conversations and reduce costs.**

Every language model has a maximum context window (measured in tokens) beyond which it cannot process additional input. Effective context management is critical for multi-turn applications, document analysis, and AI coding assistants where conversation history or document content accumulates over time.

## The Context Window Problem

```
Token budget (e.g., 200K for Claude):
┌──────────────────────────────────────────────────────────┐
│ System prompt │ Conversation history │ Documents │ Query │
│   ~1K tokens  │    grows over time   │  variable │  ~500 │
└──────────────────────────────────────────────────────────┘
                         ↑
                  Fills up over time.
                  What happens at the limit?
                  → Truncation (oldest drops off)
                  → Error (context exceeded)
                  → Degraded coherence (model forgets)
```

The context window is not just a hard limit — performance degrades before it is reached. Research ("lost in the middle") shows LLMs perform better on information at the start and end of context than in the middle. Long contexts also significantly increase cost, as most providers charge per input token.

## Context Window Comparison (2026)

| Model | Max Context | Typical Cost / 1M Input Tokens | Notes |
|-------|------------|-------------------------------|-------|
| **Gemini 1.5 Pro / 2.0** | **1,000,000** | ~$1.25 | Best for single massive documents |
| **Claude 3.5 / 3.7** | **200,000** | ~$3.00 | Strong performance at full context |
| **GPT-4o** | 128,000 | ~$2.50 | Standard for OpenAI ecosystem |
| **Llama 3.3 70B** | 128,000 | ~$0.60 | Open-source, self-hostable |
| **Mistral Large** | 128,000 | ~$2.00 | European compliance option |
| **GPT-4o mini** | 128,000 | ~$0.15 | Cost-optimized, smaller capability |

Larger context does not mean unlimited — cost scales linearly with input tokens. A 1M-token Gemini call costs ~$1.25 in input fees alone, making context management economically important even with large windows.

## Context Management Strategies Comparison

| Strategy | How It Works | Pros | Cons | Best For |
|----------|-------------|------|------|---------|
| **Truncation** | Drop oldest messages when limit reached | Simple, zero latency | Loses context abruptly | Short sessions, stateless Q&A |
| **Sliding window** | Keep last N turns, drop older | Preserves recent context | Loses early context | Chat interfaces |
| **Summarization** | Compress old history to a summary | Retains semantic content | Loses exact details | Long multi-turn sessions |
| **RAG** | Store history externally, retrieve on demand | Scales to millions of tokens | Retrieval latency, setup cost | Knowledge bases, long documents |
| **Context compression** | Remove redundant tokens (LLMLingua) | Reduces tokens, keeps info | Requires preprocessing | Cost optimization |
| **Hierarchical summary** | Summary of summaries | Handles very long sessions | Complex implementation | Weeks-long sessions |

## Summarization Strategy with Code

Summarization is the most practical strategy for most applications. When the conversation exceeds a threshold, compress older history:

```python
import anthropic
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class ConversationManager:
    messages: list = None
    summary: str = ""
    max_tokens_before_summary: int = 80000  # Summarize when history > 80K tokens

    def __post_init__(self):
        self.messages = self.messages or []

    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        self._maybe_summarize()

    def _estimate_tokens(self) -> int:
        # Rough estimate: 4 chars per token
        total = sum(len(m["content"]) for m in self.messages)
        return total // 4

    def _maybe_summarize(self):
        if self._estimate_tokens() < self.max_tokens_before_summary:
            return

        # Keep last 10 messages, summarize the rest
        to_summarize = self.messages[:-10]
        self.messages = self.messages[-10:]

        history_text = "\n".join(
            f"{m['role'].upper()}: {m['content']}" for m in to_summarize
        )

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",  # Use cheap model for summarization
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"""Summarize this conversation history concisely, 
                preserving key facts, decisions, and context:

                {history_text}
                
                Previous summary (if any): {self.summary}"""
            }]
        )

        self.summary = response.content[0].text

    def get_messages_for_api(self) -> list:
        """Return messages with summary prepended if it exists."""
        if not self.summary:
            return self.messages

        return [
            {
                "role": "user",
                "content": f"[Previous conversation summary: {self.summary}]"
            },
            {"role": "assistant", "content": "Understood, I have that context."},
            *self.messages
        ]

# Usage
manager = ConversationManager()
manager.add_message("user", "Let's discuss our Q1 marketing strategy...")
manager.add_message("assistant", "Of course. What are your main goals?")
# ... many more turns ...

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    system="You are a strategic business advisor.",
    messages=manager.get_messages_for_api()
)
```

## /compact Command in Claude Code

Claude Code (Anthropic's CLI) has a built-in `/compact` command that triggers context compaction when the context window becomes large. When invoked:

1. Claude reads the full conversation history
2. Generates a compressed summary preserving key decisions, code changes, and task state
3. Replaces the conversation history with the summary
4. Continues from the compressed state

This is equivalent to the programmatic summarization strategy above, applied to the CLI coding session context. It is recommended when the context indicator shows high usage (typically visible in the CLI interface). Claude Code also supports **auto-compact**, which triggers compaction automatically when context reaches ~95%.

## Sliding Window Implementation

```python
def sliding_window_messages(
    messages: list,
    max_tokens: int = 100000,
    always_keep_first: int = 2  # Keep system-like early messages
) -> list:
    """Keep most recent messages within token budget."""
    if not messages:
        return messages

    # Always keep the first N messages (often system context)
    pinned = messages[:always_keep_first]
    sliding = messages[always_keep_first:]

    # Estimate tokens (4 chars ≈ 1 token)
    def token_estimate(msgs):
        return sum(len(m["content"]) for m in msgs) // 4

    # Drop from oldest of sliding window until within budget
    while token_estimate(pinned + sliding) > max_tokens and len(sliding) > 1:
        sliding = sliding[1:]  # Drop oldest

    return pinned + sliding
```

## Cost Implications of Context Management

| Session Type | No Management | With Summarization | Savings |
|-------------|--------------|-------------------|---------|
| 50-turn chat (Claude Sonnet) | ~$0.45/session | ~$0.12/session | **73%** |
| 200-turn support session | ~$2.80/session | ~$0.35/session | **88%** |
| Document analysis (100 pages) | ~$1.20/query | ~$0.15/query (RAG) | **88%** |

Summarization uses a cheap model (Claude Haiku, ~10× cheaper than Sonnet) for compression, then the main model only sees the compressed history.

## When to Use Each Strategy

```
Is the context primarily conversation history?
  → Yes, short session (<20 turns): Sliding window
  → Yes, long session (20+ turns): Summarization
  → Yes, critical session (every word matters): Full context (large model)

Is the context primarily external documents?
  → Fits in context: Send directly (simple)
  → Too large: RAG with vector search

Is cost the primary constraint?
  → Context compression (LLMLingua) or aggressive summarization

Is the session recurring across days/weeks?
  → Hierarchical summary + external storage (Redis, Supabase)
```

## Frequently Asked Questions

**Q: What is an LLM context window?**
A: An LLM context window is the maximum amount of text (measured in tokens, approximately 0.75 words each) that a language model can process in a single request, including all input (system prompt, conversation history, documents) and the generated output. As of 2026, context windows range from 128K tokens (GPT-4o, Llama 3) to 200K (Claude 3.5/3.7) to 1M tokens (Gemini 1.5/2.0). Exceeding the context window results in an error or forced truncation. Even within the limit, very long contexts increase latency and cost, and some models show degraded performance on information in the middle of long contexts.

**Q: What is the best strategy for long multi-turn conversations?**
A: Conversation summarization is the most practical strategy for most applications. When conversation history exceeds a threshold (typically 50–80K tokens), use a fast, cheap model (Claude Haiku, GPT-4o mini) to compress older turns into a concise summary, then continue the session with the summary plus recent turns. This preserves semantic context while dramatically reducing token count — typically reducing per-session costs by 70–90%. The tradeoff is that exact earlier utterances are lost, which matters only if verbatim recall is required (use RAG for that case).

**Q: How does Claude's 200K context compare to Gemini's 1M?**
A: Gemini 1.5/2.0's 1M token context is approximately 750,000 words or 700+ pages of text — sufficient to fit entire codebases, books, or months of conversation history in a single request. Claude's 200K window covers approximately 150,000 words or 150 dense pages. For most applications, 200K is sufficient and Claude tends to show stronger performance and instruction-following within its window. Gemini's 1M context is most valuable for document analysis tasks requiring full-book or full-codebase processing. Cost-wise, Gemini 1.5 Pro charges ~$1.25/1M input tokens vs Claude Sonnet's ~$3/1M, making large-context Gemini calls significantly cheaper for document analysis.

**Q: What is context compression and how does LLMLingua work?**
A: Context compression removes redundant, low-information tokens from a prompt before sending it to the LLM, reducing input size by 2–10× while preserving key information. LLMLingua (Microsoft Research, 2023) and its successor LLMLingua-2 use a small language model to score each token's importance, then drop low-scoring tokens. This is different from summarization — the output is still the original text, just with less-important words removed, rather than a reformulated summary. LLMLingua is available as an open-source Python library and can reduce input costs by 50–80% with minimal quality degradation for retrieval-heavy tasks.

**Q: What is the /compact command in Claude Code?**
A: `/compact` is a built-in Claude Code CLI command that triggers context compaction for the current coding session. When a long session accumulates significant context (code files read, edits made, conversation turns), `/compact` instructs Claude to summarize the session state — preserving task progress, key decisions, file paths modified, and current goals — into a compressed representation. The full history is replaced by this summary, freeing context space for continued work. This is particularly useful in long refactoring or debugging sessions. Claude Code also supports automatic compaction (`/auto-compact`) which triggers this process automatically when context nears its limit.

## Resources

- Try Claude's 200K context window: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-context-management)
- **AI Agent Prompts Pack** (context management system prompt templates): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-context-management)

## Related

- [LLM Context Window](llm-context-window.md)
- [RAG — Retrieval-Augmented Generation](rag.md)
- [AI Memory Types](ai-memory-types.md)
- [Claude API](../tools/claude-api.md)
- [AI API Cost Optimization](../guides/ai-api-cost-optimization.md)
