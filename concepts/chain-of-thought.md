# Chain-of-Thought Prompting — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Chain-of-thought (CoT) prompting is a technique that instructs LLMs to show their reasoning step-by-step before producing a final answer, significantly improving accuracy on complex reasoning, math, and logic tasks.**

Introduced in a 2022 Google Research paper, CoT prompting emerged from the observation that large language models perform dramatically better on multi-step problems when guided to verbalize intermediate reasoning rather than jumping directly to a conclusion. The technique is now a foundational component of advanced prompt engineering.

## How Chain-of-Thought Works

Standard prompting asks a model to map an input directly to an output. Chain-of-thought inserts an explicit reasoning trace between input and output. This trace forces the model to decompose the problem, check intermediate steps, and arrive at a conclusion grounded in those steps — mimicking how humans solve complex problems by working through them systematically.

```
Standard:   [Problem] → [Answer]
CoT:        [Problem] → [Step 1] → [Step 2] → ... → [Answer]
```

The reasoning chain is generated autoregressively: each reasoning token becomes part of the context that informs subsequent tokens, creating a self-reinforcing loop that catches errors a direct-answer approach would miss.

## Zero-Shot CoT

Zero-shot CoT requires no examples. Simply append a trigger phrase to your prompt:

```
Prompt: "A train travels 60 km/h. How long to travel 150 km?
Let's think step by step."
```

The phrase **"Let's think step by step"** — or equivalents like "Think through this carefully" — reliably elicits reasoning chains from capable LLMs. Research shows this single addition improves arithmetic accuracy by 40–60% on benchmarks. It works because the trigger activates reasoning-oriented patterns learned during training on structured problem-solving content.

Other effective zero-shot CoT triggers:
- `"Let's work through this systematically."`
- `"Break this down step by step."`
- `"Think carefully before answering."`

## Few-Shot CoT

Few-shot CoT provides explicit examples of the reasoning format you want the model to follow:

```
Example:
Q: Roger has 5 tennis balls. He buys 2 cans with 3 balls each. How many balls total?
A: Roger starts with 5 balls. He buys 2 × 3 = 6 new balls. Total: 5 + 6 = 11 balls.

Now answer:
Q: A baker makes 24 muffins. She sells 1/3 in the morning and 1/4 of the remainder in the afternoon. How many remain?
A:
```

Few-shot CoT consistently outperforms zero-shot CoT on complex tasks by demonstrating the desired format, depth, and level of decomposition. The trade-off is longer prompts and the effort of writing high-quality examples.

## Self-Consistency

Self-consistency addresses a limitation of single-pass CoT: a single reasoning chain can be wrong even if its conclusion appears confident. The technique:

1. Sample the same problem multiple times with temperature > 0 (e.g., 5–20 samples)
2. Extract the final answer from each reasoning chain
3. Take a majority vote across all sampled answers

Self-consistency improves accuracy by 5–15% over single-path CoT on math and reasoning benchmarks, at the cost of proportionally higher inference compute and latency. It is most effective on tasks with discrete, verifiable answers.

## Tree of Thoughts (ToT)

Tree of Thoughts extends CoT from a linear chain to a branching tree. The model:

1. Generates multiple distinct "thoughts" (partial solutions or reasoning steps) at each decision point
2. Evaluates the promise of each branch (self-evaluation or heuristic scoring)
3. Prunes low-value branches and expands high-value ones via BFS or DFS
4. Returns the answer at the leaf of the best path

ToT is designed for problems where mid-course correction matters — creative writing with constraints, multi-step planning, proof search. It requires significantly more compute than standard CoT (typically 10–100× more tokens) but can solve problems that defeat linear reasoning chains entirely.

## Comparison Table

| Method | Accuracy Improvement | Cost Multiplier | Best Use Case |
|--------|--------------------|-----------------|-|
| Standard prompting | Baseline | 1× | Simple lookups, classification |
| Zero-shot CoT | +20–50% on reasoning | 1.5–2× | Quick improvement, no examples available |
| Few-shot CoT | +30–60% on reasoning | 2–4× | Domain-specific tasks with known format |
| Self-consistency | +5–15% over CoT | 5–20× | High-stakes answers, math, logic |
| Tree of Thoughts | +20–40% on hard planning | 10–100× | Multi-step planning, complex puzzles |

*Accuracy improvements are approximate and task-dependent. Cost multiplier reflects token usage relative to standard prompting.*

## When CoT Helps vs. Hurts

**CoT improves performance on:**
- Multi-step arithmetic and algebra
- Logical and deductive reasoning
- Code generation with complex logic
- Scientific problem solving
- Tasks requiring constraint satisfaction

**CoT offers minimal or negative benefit on:**
- Simple factual recall ("What is the capital of France?")
- Single-step classification
- Direct extraction tasks (find the date in this document)
- Short creative outputs where fluency matters more than accuracy

Adding CoT to simple tasks wastes tokens without accuracy gains, and in some cases introduces unnecessary hedging or over-thinking that degrades output quality.

## Claude's Extended Thinking Mode

Claude implements CoT natively through its extended thinking feature. When enabled, the model generates a `<thinking>` block containing its full reasoning trace before producing the final `<answer>`. This reasoning is:

- Performed with higher compute budgets (`budget_tokens` parameter)
- Not charged at the same rate as output tokens in some configurations
- Explicitly surfaced to the developer for inspection and debugging

Extended thinking is especially effective for math, code reasoning, and strategic analysis tasks where intermediate steps are long and verification matters.

## Code Example: CoT in Claude API

```python
import anthropic

client = anthropic.Anthropic()

# Zero-shot CoT via system prompt
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="When solving problems, always think step by step before giving your final answer.",
    messages=[
        {
            "role": "user",
            "content": "A company has 240 employees. 30% work remotely. Of those remote workers, 25% are in engineering. How many remote engineers are there?"
        }
    ]
)

# Extended thinking (native CoT)
response_thinking = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8000,
    thinking={
        "type": "enabled",
        "budget_tokens": 5000
    },
    messages=[
        {
            "role": "user",
            "content": "Solve: If f(x) = 3x² + 2x - 8, find all values of x where f(x) = 0."
        }
    ]
)

for block in response_thinking.content:
    if block.type == "thinking":
        print("Reasoning:", block.thinking)
    elif block.type == "text":
        print("Answer:", block.text)
```

## FAQ

### What is chain-of-thought prompting?

Chain-of-thought prompting is a technique for improving LLM accuracy on complex tasks by instructing the model to produce explicit reasoning steps before its final answer. Rather than outputting a conclusion directly, the model narrates its problem-solving process — decomposing the problem, applying relevant knowledge, and checking intermediate results. This reasoning trace acts as scaffolding that reduces errors on arithmetic, logic, and multi-step reasoning tasks.

### Does chain-of-thought improve accuracy?

Yes, consistently on complex reasoning tasks. Research benchmarks show CoT improves accuracy by 20–60% on arithmetic, commonsense reasoning, and symbolic reasoning tasks compared to standard prompting — with larger improvements on harder problems. The gains are most pronounced with larger models (≥7B parameters for open models, frontier-class for best results). On simple factual lookups or single-step tasks, CoT provides little benefit and may slightly reduce accuracy by introducing unnecessary verbosity.

### Zero-shot vs. few-shot chain-of-thought — what is the difference?

Zero-shot CoT uses a trigger phrase alone ("Let's think step by step") with no examples. It requires no example writing and works well for general reasoning. Few-shot CoT prepends two to eight worked examples that demonstrate the reasoning format before the actual question. Few-shot CoT is more accurate on domain-specific tasks where the desired decomposition style is non-obvious, but requires effort to write high-quality examples and increases prompt length. For most production use cases, zero-shot CoT is the recommended starting point; switch to few-shot if accuracy is insufficient.

### What is Tree of Thoughts?

Tree of Thoughts (ToT) is an extension of chain-of-thought that explores multiple reasoning branches simultaneously rather than following a single linear chain. At each reasoning step, the model generates several candidate "thoughts," evaluates their quality, and selectively expands the most promising ones — similar to a search tree. ToT is designed for problems where a wrong intermediate step can derail the entire solution and backtracking is beneficial. It achieves higher accuracy than standard CoT on complex planning and puzzle-solving tasks but requires 10–100× more tokens and is impractical for latency-sensitive applications.

### When should I use chain-of-thought prompting?

Use CoT when: (1) the task requires multiple steps to solve, (2) errors in intermediate reasoning cause wrong final answers, or (3) the answer benefits from verification. Typical trigger scenarios include math word problems, logical deductions, code debugging, and complex instructions with multiple constraints. Avoid CoT for simple factual queries, single-step extractions, or high-volume tasks where the accuracy gain does not justify the token cost. A practical heuristic: if a thoughtful human would need to work through multiple steps to answer, CoT will likely help the model too.

## Resources

- **Claude API with extended thinking**: [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=chain-of-thought)
- **AI Prompt Engineering Handbook (PDF)**: [th19930828.gumroad.com](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=chain-of-thought)

---

*Last updated: April 2026*
