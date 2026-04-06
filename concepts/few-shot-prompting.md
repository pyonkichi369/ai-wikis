# Few-Shot Prompting — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Few-shot prompting is a technique where examples of desired input-output pairs are included in the prompt to teach an LLM the expected format, style, or reasoning pattern — dramatically improving performance on tasks without additional training.**

The technique exploits the in-context learning capability of large language models: rather than modifying model weights through fine-tuning, few-shot prompting provides concrete demonstrations within the context window. The model infers the underlying pattern from these examples and applies it to the new input.

---

## Prompting Approaches by Example Count

| Approach | Examples in Prompt | Token Cost | When to Use |
|---------|-------------------|-----------|------------|
| Zero-shot | 0 | Lowest | Simple tasks, instruction-following models, exploratory use |
| One-shot | 1 | Low | Format demonstration, basic pattern transfer |
| Few-shot | 2–10 | Medium | Complex tasks, custom formats, specialized classification |
| Many-shot | 10–100+ | High | Specialized domains, rare output formats, edge case coverage |

Zero-shot prompting relies entirely on the model's pre-trained knowledge and instruction-following. Few-shot prompting supplements instructions with evidence of what a correct response looks like.

---

## How Few-Shot Examples Work

When a model receives few-shot examples, it does not update its weights. Instead, it performs a form of in-context pattern matching:

1. **Pattern extraction** — The model identifies the relationship between each input and output in the examples.
2. **Rule inference** — It generalizes an implicit rule from the demonstrated pattern.
3. **Application** — It applies the inferred rule to the new input.

This means few-shot prompting is most effective when the examples are consistent, unambiguous, and representative of the full range of inputs the model will encounter.

---

## Selecting Effective Examples

The quality of few-shot examples determines the quality of outputs. Effective example selection follows these principles:

- **Diversity**: Cover different sub-cases, edge cases, and input lengths rather than repeating similar examples.
- **Representativeness**: Examples should reflect the distribution of real inputs the model will process.
- **Unambiguity**: Each example must have one clearly correct output. Ambiguous examples teach conflicting patterns.
- **Consistent format**: All examples must use identical structure. Inconsistent formatting confuses the model about what is signal and what is noise.
- **Correct labels**: Mislabeled examples degrade performance more than no examples at all.

---

## Format Structure

Consistent delimiters and structure across examples are critical. A standard pattern:

```
Input: [example input 1]
Output: [correct output 1]

Input: [example input 2]
Output: [correct output 2]

Input: [new input]
Output:
```

The model learns that the pattern terminates with an `Output:` that it must complete.

---

## Few-Shot for Common Task Types

### Classification

```
Classify the sentiment of each review as Positive, Negative, or Neutral.

Review: "The interface is clean and the onboarding took under 5 minutes."
Sentiment: Positive

Review: "It crashed twice during my demo and support never responded."
Sentiment: Negative

Review: "It does what the description says, nothing more."
Sentiment: Neutral

Review: "Migrating from the old system was painful but the result is worth it."
Sentiment:
```

### Extraction

```
Extract the company name and funding amount from each sentence.

Sentence: "Acme Corp raised $12M in a Series A led by Sequoia."
Company: Acme Corp | Amount: $12M

Sentence: "DataBridge announced a $45M Series B this morning."
Company: DataBridge | Amount: $45M

Sentence: "Vertex AI secured $8.2M from three undisclosed investors."
Company:
```

### Generation with Style Constraints

```
Rewrite each headline to be under 60 characters and use active voice.

Original: "New AI regulations have been announced by the European Commission"
Rewritten: "European Commission announces new AI rules"

Original: "Record profits were reported by Anthropic in Q1 2026"
Rewritten: "Anthropic reports record Q1 2026 profits"

Original: "A major vulnerability in open-source LLM libraries was discovered by researchers"
Rewritten:
```

---

## Few-Shot vs Fine-Tuning

| Dimension | Few-Shot Prompting | Fine-Tuning |
|-----------|-------------------|-------------|
| Training cost | None | High (GPU time, data preparation) |
| Context overhead | Yes (examples consume tokens) | None |
| Iteration speed | Immediate | Hours to days |
| Performance ceiling | Lower for highly specialized tasks | Higher |
| Data requirement | 2–100 examples in prompt | Hundreds to thousands of labeled examples |
| Model portability | Works with any capable model | Tied to the fine-tuned checkpoint |
| Best for | Rapid prototyping, format control, moderate specialization | Production systems with consistent, high-volume specialized tasks |

Few-shot prompting is the default starting point. Fine-tuning becomes justified when few-shot performance is insufficient after optimization and the task volume is high enough to amortize training costs.

---

## Few-Shot Prompting in the Claude API

In the Claude API (and most OpenAI-compatible APIs), few-shot examples are passed as alternating `user` and `assistant` messages in the `messages` array:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=256,
    system="Classify the sentiment of customer reviews as Positive, Negative, or Neutral.",
    messages=[
        {"role": "user", "content": "The setup took 2 minutes and everything worked perfectly."},
        {"role": "assistant", "content": "Positive"},
        {"role": "user", "content": "The app deleted all my data after the update with no warning."},
        {"role": "assistant", "content": "Negative"},
        {"role": "user", "content": "It works as described. No major issues."},
        {"role": "assistant", "content": "Neutral"},
        {"role": "user", "content": "Migrating was hard but the final result is excellent."},
    ]
)

print(response.content[0].text)
```

This structure signals to the model that the `assistant` turn is where it should continue the established pattern.

---

## Advanced Techniques

### Chain-of-Thought Few-Shot

Including reasoning steps in the example outputs improves performance on multi-step reasoning tasks:

```
Q: A store sells 3 types of products. Type A costs $12, Type B costs $8,
   Type C costs $5. A customer buys 2 of A, 3 of B, and 5 of C. Total?
A: Type A: 2 × $12 = $24. Type B: 3 × $8 = $24. Type C: 5 × $5 = $25.
   Total = $24 + $24 + $25 = $73.

Q: [new math problem]
A:
```

### Dynamic Example Selection

For large example libraries, retrieval-augmented few-shot selects the most semantically similar examples to the current input at runtime using a vector database, rather than using a fixed set.

---

## FAQ

**What is few-shot prompting?**
Few-shot prompting is a prompting technique where two or more input-output examples are included directly in the prompt before presenting the actual input to the model. The examples demonstrate the expected format, style, or reasoning pattern. The model uses these demonstrations to infer the rule it should apply, producing outputs that match the demonstrated pattern without any modification to its underlying weights.

**How many examples should I include in a prompt?**
There is no universal answer. Start with 3–5 examples covering distinct sub-cases of the task. If output quality is insufficient, add more examples that cover failure modes you observe. The practical upper limit is set by the model's context window and cost constraints — each example consumes tokens. For most tasks, 3–8 carefully selected examples outperform 20+ poorly chosen ones. Research on many-shot prompting shows continued gains up to roughly 100 examples for complex classification tasks.

**Few-shot vs fine-tuning — which is better?**
Few-shot prompting is better for rapid iteration, tasks with low volume, or situations where the task definition changes frequently. Fine-tuning is better when few-shot performance is insufficient for the use case, the task is highly specialized, and the volume is high enough to justify training costs. In practice, most production systems start with few-shot prompting and only invest in fine-tuning after validating that the task is stable and the performance gap is significant.

**What is zero-shot prompting?**
Zero-shot prompting means giving the model only an instruction (and optionally a system prompt) with no examples of the desired input-output format. The model relies entirely on its pre-trained capabilities and instruction-following behavior. Zero-shot works well for tasks that align with what the model was trained on, such as answering factual questions, summarizing text, or generating standard-format content. It fails when the required output format is highly specific or the task involves domain knowledge not well represented in training data.

**Do few-shot examples count toward token usage?**
Yes. Every token in the prompt — including few-shot examples — counts toward the input token cost and consumes context window space. For APIs priced per input token (such as the Claude API and OpenAI API), more examples directly increase cost per request. This is one reason to optimize example selection: 4 high-quality, diverse examples typically outperform 20 redundant ones while using fewer tokens.

---

## Resources

- [Claude API](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=few-shot-prompting) — Anthropic's API for building LLM-powered applications
- [AI Tools & Prompting Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=few-shot-prompting) — Practical guide covering prompting techniques with worked examples
- Related concepts: [Prompt Engineering](prompt-engineering.md) | [Chain-of-Thought](chain-of-thought.md) | [Fine-Tuning](fine-tuning.md) | [System Prompts](system-prompts.md)
