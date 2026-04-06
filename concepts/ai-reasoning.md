# AI Reasoning Models — o1, o3, Claude Extended Thinking 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI reasoning models are LLMs trained to spend additional compute on step-by-step internal reasoning ("thinking") before producing a final answer — trading latency for significantly improved accuracy on complex math, science, coding, and logical problems.**

Standard LLMs generate tokens autoregressively: each output token is predicted from the preceding context in a single forward pass. Reasoning models introduce a deliberation phase in which the model generates a chain of intermediate reasoning steps — sometimes called a "scratchpad" or "thinking trace" — before committing to a final response. This process allocates more computation to difficult problems and allows the model to self-correct during generation, resulting in substantially higher accuracy on benchmarks that require multi-step deduction.

## How Reasoning Works

When a reasoning model receives a prompt, it does not immediately produce an answer. Instead, it generates a series of reasoning tokens that explore the problem space:

```
Standard LLM:
  [Prompt] → [Answer]          (1 generation pass)

Reasoning model:
  [Prompt] → [Think step 1]
           → [Think step 2]
           → [Check step 2]
           → [Revise step 2]
           → [Think step 3]
           → [Final Answer]    (many generation passes, longer latency)
```

The reasoning tokens become context for subsequent generation, enabling the model to catch its own errors and reconsider intermediate conclusions. This is mechanically similar to chain-of-thought prompting but implemented at the training level rather than through prompt engineering — the model learns when and how to reason rather than being instructed to do so.

## Reasoning Model Comparison (2026)

| Model | Thinking visibility | MATH benchmark | Coding | Latency | Input / Output cost (per 1M tokens) |
|-------|--------------------|--------------------|--------|---------|--------------------------------------|
| OpenAI o1 | Hidden CoT | ~95% | High | High | $15 / $60 |
| OpenAI o3-mini | Hidden CoT | ~93% | High | Medium | $1.1 / $4.4 |
| OpenAI o4-mini | Hidden CoT | High | High | Medium | $1.1 / $4.4 |
| Claude (extended thinking) | Visible CoT | High | High | High | Sonnet rate + thinking tokens |
| Gemini 2.0 Flash Thinking | Visible CoT | High | High | Medium | Free tier available |
| DeepSeek-R1 | Visible CoT | High | High | Medium | Very low / self-host free |

**Hidden CoT** means the reasoning trace is generated internally but not returned to the caller. **Visible CoT** means the thinking tokens are returned as a separate block in the response, allowing developers to inspect and log the model's reasoning process.

## OpenAI o-Series

OpenAI's o1, o3, and o4-mini models use reinforcement learning to train the model to produce internal reasoning before answering. Key characteristics:

- Thinking is hidden — callers receive only the final answer
- Best-in-class performance on AIME (math olympiad), GPQA (PhD-level science), and SWE-bench (software engineering)
- o1 is the most capable; o3-mini and o4-mini trade some accuracy for lower cost and latency
- Suitable for agentic tasks, code generation, and complex research queries
- Not ideal for high-volume, low-complexity tasks due to cost and latency

## Claude Extended Thinking

Anthropic's extended thinking feature allows Claude Sonnet and Opus models to perform visible reasoning before responding. Unlike OpenAI's hidden CoT, Claude returns the thinking block in the API response, enabling inspection and debugging.

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # max tokens Claude may spend on reasoning
    },
    messages=[{
        "role": "user",
        "content": "A snail travels at 0.03 mph. How many hours to cross a 500-foot field? Show your work."
    }]
)

# The response contains two content blocks:
for block in response.content:
    if block.type == "thinking":
        print("Reasoning:\n", block.thinking)
    elif block.type == "text":
        print("Answer:\n", block.text)
```

`budget_tokens` controls how much reasoning compute is allocated. Higher values improve accuracy on harder problems at the cost of latency and token spend. Minimum is 1,024 tokens; practical range for difficult problems is 5,000–16,000.

### When Thinking Tokens Are Billed

Extended thinking tokens (both input reasoning and output reasoning) are billed at Claude's standard token rates. A 10,000-token thinking budget that fully executes costs significantly more than a standard 1,024-token response. Use extended thinking selectively on problems that warrant it.

## DeepSeek-R1

DeepSeek-R1 is an open-source reasoning model released by DeepSeek in early 2025. It achieves performance comparable to OpenAI o1 on several benchmarks at a fraction of the cost, and can be self-hosted via Ollama.

```bash
# Run DeepSeek-R1 locally with Ollama
ollama run deepseek-r1:7b     # 7B parameter version (fast, lower accuracy)
ollama run deepseek-r1:70b    # 70B parameter version (higher accuracy)
```

DeepSeek-R1 returns visible reasoning in `<think>` tags, making it easy to parse:

```python
import ollama

response = ollama.chat(
    model="deepseek-r1:7b",
    messages=[{"role": "user", "content": "Prove that sqrt(2) is irrational."}]
)
# response.message.content contains <think>...</think> followed by the answer
```

## When to Use Reasoning Models

| Task type | Recommended approach | Reasoning |
|-----------|---------------------|-----------|
| Complex math / proofs | o1, o3, Claude extended thinking | Multi-step verification required |
| Hard coding problems | o1, o4-mini, Claude extended thinking | Bug detection across long chains |
| PhD-level science Q&A | o1, Gemini 2.0 Flash Thinking | Requires domain reasoning |
| Multi-step logic puzzles | Any reasoning model | CoT improves accuracy significantly |
| Simple Q&A | Claude Haiku, GPT-4o-mini | Reasoning overhead wasteful |
| Creative writing | Standard LLMs | Reasoning offers no benefit |
| High-volume classification | Standard LLMs (Haiku, Flash) | Cost and latency prohibitive |
| Fast chat responses | Standard LLMs | Latency of reasoning unacceptable |
| Agentic task planning | o3-mini, Claude extended thinking | Complex decision trees benefit |

## Gemini 2.0 Flash Thinking

Google's Gemini 2.0 Flash Thinking is a reasoning model available through the Gemini API and AI Studio. It exposes its chain-of-thought process in the response, similar to Claude's extended thinking. Key characteristics:

- Available on the free tier of Google AI Studio (rate-limited)
- Faster than o1 and Claude extended thinking in most tasks
- Visible reasoning trace enables debugging
- Strong performance on MATH and science benchmarks
- Integrates with the Google ecosystem (Vertex AI, Workspace)

Gemini 2.0 Flash Thinking is a practical choice for teams already invested in the Google Cloud ecosystem or for developers who need reasoning capabilities without paying OpenAI pricing.

## Accuracy Benchmark Reference

Performance on key benchmarks as of early 2026. Exact numbers vary by test conditions and continue to improve with model updates:

| Benchmark | What it tests | o1 | o3-mini | Claude Sonnet (thinking) | DeepSeek-R1 |
|-----------|--------------|-----|---------|--------------------------|-------------|
| AIME 2024 | Math olympiad | ~83% | ~63% | Competitive | ~79% |
| GPQA Diamond | PhD science | ~78% | ~68% | ~75% | ~71% |
| SWE-bench Verified | Real GitHub issues | ~49% | ~49% | High | Competitive |
| MATH-500 | Graduate math | ~97% | ~93% | ~97% | ~97% |

## Reasoning vs Chain-of-Thought Prompting

Chain-of-thought (CoT) prompting — instructing a standard LLM to "think step by step" in the output — predates dedicated reasoning models and is related but distinct:

| Dimension | Reasoning models (o1, extended thinking) | Chain-of-thought prompting |
|-----------|------------------------------------------|---------------------------|
| Where it runs | Internal training; model decides when to reason | Output tokens visible to the user |
| Control | Via budget_tokens or model selection | Via prompt instructions |
| Cost | Higher (billed thinking tokens) | Standard token cost |
| Effectiveness | Higher on hard problems | Moderate improvement |
| Requires | Specific model support | Any capable LLM |
| Visibility | Hidden (o1) or separate block (Claude/Gemini) | Inline in the response |

For most production applications, use chain-of-thought prompting on standard models for moderate complexity tasks, and reserve reasoning models for the hardest problems where the accuracy gain justifies the cost.

## Cost and Latency Trade-offs

Reasoning models are expensive and slow relative to standard models. A practical rule: use a reasoning model only when the problem would benefit from multi-step verification and accuracy is more important than speed or cost.

For a concrete example, a simple customer support reply costs ~$0.001 with Claude Haiku and takes ~500ms. The same task on o1 costs ~$0.15 and takes 10–30 seconds. The added accuracy provides no value for a simple support reply.

For a complex algorithmic problem — debugging a concurrency bug in a distributed system — o1 or Claude extended thinking may solve the issue in one pass where a standard model requires multiple attempts, making the higher cost worthwhile.

## Frequently Asked Questions

**Q: What is a reasoning model?**
A: A reasoning model is an LLM that generates a chain of intermediate reasoning steps — often called a "thinking trace" or "scratchpad" — before producing a final answer. This deliberation phase allows the model to explore the problem, verify intermediate conclusions, and self-correct before committing to a response. The result is significantly higher accuracy on complex multi-step problems at the cost of increased latency and token consumption. OpenAI's o1/o3 series and Anthropic's extended thinking feature in Claude are the primary examples in commercial use as of 2026.

**Q: OpenAI o1 vs Claude extended thinking — what is the difference?**
A: Both are reasoning models that allocate extra compute to internal deliberation, but they differ in implementation and transparency. OpenAI o1 uses hidden chain-of-thought: the reasoning trace is generated internally but not returned to the caller — you only see the final answer. Claude's extended thinking returns the reasoning as a separate `thinking` content block in the API response, which is visible and loggable. This makes Claude's approach more transparent and debuggable. On benchmarks, o1 leads on AIME math and some coding tasks, while Claude extended thinking is competitive across most domains. Pricing also differs: o1 charges $15/$60 per million input/output tokens, while Claude extended thinking is billed at Sonnet's rate plus thinking token cost.

**Q: When should I use a reasoning model?**
A: Use a reasoning model when: (1) the problem requires multiple logical steps with dependencies between them, (2) accuracy is more important than response speed, and (3) the problem is in a domain with an objectively correct answer (math, logic, code). Do not use reasoning models for simple Q&A, creative writing, customer service chat, or any high-volume task where latency and cost are constraints. A practical heuristic: if a human expert would need scratch paper to solve the problem, a reasoning model is likely warranted.

**Q: What is DeepSeek-R1?**
A: DeepSeek-R1 is an open-source reasoning model developed by DeepSeek, a Chinese AI research lab, and released in January 2025. It achieves performance comparable to OpenAI o1 on several reasoning benchmarks including AIME and MATH-500. DeepSeek-R1 is available under a permissive open-source license, meaning it can be self-hosted via tools like Ollama at near-zero variable cost. It returns visible reasoning in `<think>` XML tags. The 7B parameter variant runs on consumer hardware; the 70B variant requires a server-grade GPU. Its release marked the first open-source reasoning model competitive with proprietary alternatives.

**Q: How much does OpenAI o1 cost?**
A: As of 2026, OpenAI o1 is priced at $15 per million input tokens and $60 per million output tokens through the OpenAI API. This is approximately 10–20x more expensive than GPT-4o ($2.50/$10) and significantly more expensive than Claude Sonnet or Gemini 1.5 Pro for comparable capabilities on non-reasoning tasks. For reasoning-specific tasks (complex math, hard coding problems), o1's higher accuracy may justify the cost by reducing the number of attempts required. For most tasks, the cheaper o3-mini ($1.1/$4.4 per million tokens) provides a better cost-to-performance ratio.

## Resources

- Use Claude's extended thinking: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-reasoning)
- **AI Agent Prompts Pack** (reasoning prompts, extended thinking system prompts, chain-of-thought templates): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-reasoning)
- Anthropic extended thinking docs: [docs.anthropic.com/en/docs/build-with-claude/extended-thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- DeepSeek-R1 on Ollama: [ollama.com/library/deepseek-r1](https://ollama.com/library/deepseek-r1)
- OpenAI reasoning models: [platform.openai.com/docs/guides/reasoning](https://platform.openai.com/docs/guides/reasoning)

## Related

- [Chain-of-Thought Prompting](chain-of-thought.md)
- [LLM Benchmarks](llm-benchmarks.md)
- [Claude API](../tools/claude-api.md)
- [Ollama](../tools/ollama.md)
- [AI Agent](ai-agent.md)
