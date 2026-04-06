# LLM Temperature — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Temperature is a parameter in LLMs that controls the randomness of token selection during generation — lower values (0–0.3) produce deterministic, consistent outputs while higher values (0.7–2.0) increase creativity and diversity.**

Temperature is one of the most frequently misunderstood sampling parameters in language model APIs. Despite its apparent simplicity — a single scalar — its effect on output quality can be dramatic, and setting it incorrectly for a given task is a common source of poor results in production applications.

## How Temperature Works

Language models generate text by predicting the next token at each step. Before sampling, the model produces a vector of raw scores called **logits** — one score per token in the vocabulary. These logits are converted to a probability distribution via the **softmax** function:

```
P(token_i) = exp(logit_i / T) / Σ exp(logit_j / T)
```

Where **T** is the temperature parameter. The effect:

- **T → 0**: The highest-scoring token receives probability approaching 1.0. Sampling becomes greedy — the model always picks the most likely token.
- **T = 1.0**: The probability distribution matches the model's raw output without amplification or flattening.
- **T > 1.0**: The distribution is flattened — lower-probability tokens become more likely, increasing randomness and diversity.
- **T → ∞**: All tokens approach equal probability; output becomes random noise.

In practice, even small changes in temperature have large effects on output consistency, especially for tasks with narrow correct-answer distributions (code, math) versus broad valid-output distributions (creative writing).

## Temperature Guide

| Temperature | Behavior | Best For |
|-------------|----------|----------|
| 0 | Deterministic (greedy decoding) | Code generation, data extraction, classification, structured output |
| 0.1–0.3 | Near-deterministic, very consistent | Factual Q&A, JSON formatting, RAG retrieval answers, translation |
| 0.4–0.6 | Low variance, some variation | Summarization, document rewriting, business writing |
| 0.7–1.0 | Balanced creativity and coherence | General chat, brainstorming, ideation, diverse phrasings |
| 1.0–1.3 | Noticeably creative, occasional surprises | Marketing copy, blog outlines, persona-based responses |
| 1.3–2.0 | High variance, exploratory | Creative fiction, poetry, unconventional ideation |

## Top-p (Nucleus Sampling)

Top-p sampling, also called nucleus sampling, is an alternative (or complement) to temperature. Instead of scaling the full probability distribution, top-p dynamically truncates the vocabulary to the smallest set of tokens whose cumulative probability exceeds `p`, then samples from only that set.

```
top_p = 0.9  →  sample only from tokens covering the top 90% of probability mass
top_p = 1.0  →  no truncation (sample from full vocabulary)
top_p = 0.1  →  sample from a very small, high-probability nucleus
```

Top-p adapts the candidate set based on the model's confidence at each step: when the model is confident (one token dominates), the nucleus is small; when uncertain, the nucleus expands. This makes it more task-agnostic than temperature in some cases.

## Top-k Sampling

Top-k sampling restricts sampling to the K most likely tokens at each step regardless of their probability values. It is less adaptive than top-p (a fixed K may be too large when the model is confident, or too small when the distribution is flat) but is computationally simpler. Many APIs expose top-k as an optional parameter.

## Temperature vs. Top-p: Which to Adjust?

In practice, adjusting **temperature** is the primary lever for controlling output randomness. Most practitioners recommend:

- **Adjust temperature first.** It is the most intuitive parameter and has the largest effect.
- **Leave top-p at 0.9–1.0** unless you have a specific reason to restrict the vocabulary.
- **Avoid setting both temperature and top-p to extreme values simultaneously**, as their effects compound and outputs can become incoherent.

A common pattern: set `temperature=0` for deterministic tasks (code, extraction, classification) and `temperature=0.7–1.0` for generative tasks (writing, brainstorming, dialogue).

## Model-Specific Defaults

| Model | Default Temperature | Notes |
|-------|--------------------|-|
| Claude (Anthropic) | 1.0 | Applies to all Claude models unless overridden |
| GPT-4o (OpenAI) | 1.0 | OpenAI API default |
| Gemini 1.5 Pro (Google) | 1.0 | Configurable up to 2.0 |
| Mistral API | 0.7 | Lower default than major providers |
| Ollama (local) | 0.8 | Varies by model configuration |

*Defaults reflect settings as of early 2026. Check each provider's documentation for current values.*

## Common Mistakes

**Setting temperature=0 for creative tasks**: Zero temperature produces the same output on every run. For tasks requiring variety — marketing copy, brainstorming, diverse examples — this leads to repetitive, formulaic outputs. Use 0.7–1.0 instead.

**Using high temperature for code generation**: Code has narrow correctness criteria. High temperature increases the probability of syntactically valid but logically wrong code, hallucinated function names, and inconsistent variable usage. Use 0–0.2 for code.

**Assuming temperature=0 guarantees identical outputs**: At temperature=0, the model uses greedy decoding, but identical outputs are only guaranteed if the system prompt, message history, and model version are also identical. Infrastructure-level floating-point non-determinism can cause minor variations even at temperature=0 across different runs or server instances.

**Ignoring the interaction with context length**: At very long contexts, even temperature=0 models may behave inconsistently because small floating-point differences compound over many tokens. For strict determinism requirements, use short, focused prompts.

## Code Example: Setting Temperature in Claude API

```python
import anthropic

client = anthropic.Anthropic()

# Low temperature: deterministic code generation
code_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    temperature=0,   # deterministic
    messages=[
        {
            "role": "user",
            "content": "Write a Python function that validates an email address using regex."
        }
    ]
)

# Medium temperature: general chat
chat_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=512,
    temperature=0.7,
    messages=[
        {
            "role": "user",
            "content": "Explain quantum entanglement to a 10-year-old."
        }
    ]
)

# High temperature: creative writing
creative_response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    temperature=1.2,
    messages=[
        {
            "role": "user",
            "content": "Write the opening paragraph of a sci-fi novel set on a tidally locked planet."
        }
    ]
)
```

## FAQ

### What temperature should I use for code generation?

Use temperature=0 or 0.1 for code generation. Code has strict correctness criteria — syntax errors, wrong function names, or off-by-one logic errors are all failures regardless of how "creative" the output is. Temperature=0 ensures the model consistently chooses the highest-probability token at each step, producing the most reliable, conventional code the model knows. If you need multiple diverse code solutions to choose from, run temperature=0 multiple times with varied prompt phrasing rather than raising temperature.

### What is the difference between temperature and top-p?

Both control the randomness of token selection but through different mechanisms. Temperature scales the model's probability distribution before sampling — lower values sharpen it (more deterministic), higher values flatten it (more random). Top-p (nucleus sampling) dynamically truncates the vocabulary to the smallest set of tokens that together account for `p` probability mass, then samples from only those tokens. Temperature affects the shape of the distribution; top-p affects how much of the distribution is accessible to the sampler. In practice, temperature is the primary control; top-p is a secondary guard against sampling from the extreme low-probability tail.

### Does temperature=0 make outputs identical every time?

Not always. Temperature=0 switches token selection to greedy decoding (always pick the highest-probability token), which is deterministic in theory. In practice, identical outputs require identical conditions: the same model version, the same system prompt, the same message history, and the same server-side floating-point implementation. Minor floating-point non-determinism across different hardware or distributed inference systems can produce small variations. For most production applications, temperature=0 is sufficiently deterministic; for cryptographic or strictly reproducible requirements, you need additional measures beyond temperature control.

### What temperature is best for chatbots?

Most general-purpose chatbots perform well at temperature 0.7–1.0. This range produces responses that are coherent and contextually appropriate while maintaining enough variation to feel natural across repeated similar queries rather than robotic and repetitive. Customer service bots benefit from the lower end (0.5–0.7) to ensure consistent, on-brand responses. Creative or companionship-style chatbots can use the higher end (1.0–1.3) to produce more expressive, varied conversation. For chatbots that handle any structured data retrieval (account lookups, booking confirmations), use temperature=0 for those specific tool calls while keeping the conversational layer at higher temperature.

### Why does Claude give different answers each time?

Claude's default temperature is 1.0, meaning each generation samples from the model's probability distribution rather than always taking the most likely token. This is intentional: diverse outputs better serve generative tasks, conversational variety, and creative applications. If you require consistent, reproducible answers — for testing, structured extraction, or deterministic pipelines — set `temperature=0` in your API call. Note that even at temperature=0, minor variations can occur across different API calls if model versions are updated or infrastructure changes.

## Resources

- **Claude API (set temperature in your calls)**: [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-temperature)
- **AI Prompt Engineering Handbook (PDF)**: [th19930828.gumroad.com](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-temperature)

---

*Last updated: April 2026*
