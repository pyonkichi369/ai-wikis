# Fine-Tuning vs RAG — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Fine-tuning** is the process of training a pre-trained language model on a custom dataset to adapt its behavior, tone, or domain knowledge. Unlike prompt engineering (which guides the model at inference time), fine-tuning modifies the model's weights during a training phase, making new behaviors persistent.

Fine-tuning and RAG (Retrieval-Augmented Generation) are the two primary methods for customizing LLM behavior for specific applications. They are often combined in production systems.

## Fine-Tuning vs RAG vs Prompt Engineering

| Approach | When to Use | Cost | Knowledge Updates | Best For |
|---------|------------|------|-------------------|---------|
| **Prompt Engineering** | Quick behavior changes | Zero | Instant | Style, format, persona |
| **RAG** | External knowledge injection | Low | Real-time | Q&A, search, docs |
| **Fine-Tuning** | Behavior/style change | High (training) | Requires retraining | Tone, format, specialized domain |
| **Fine-Tuning + RAG** | Production AI systems | Highest | RAG handles updates | Enterprise knowledge systems |

**Key insight**: RAG retrieves facts. Fine-tuning changes behavior. Use RAG when your data changes; use fine-tuning when you need consistent tone, format, or style.

## When to Fine-Tune

Fine-tuning is appropriate when:

1. **Consistent output format**: JSON schema, specific markdown structure, code style
2. **Domain vocabulary**: Medical/legal/technical terms the base model handles poorly
3. **Tone and persona**: Brand voice, character consistency, language formality
4. **Task specialization**: SQL generation, code review comments, translation pairs
5. **Reducing prompt length**: Bake system prompt behavior into weights, cut costs

**Do NOT fine-tune when**:
- You need up-to-date information (use RAG instead)
- You have less than 100 training examples (use prompt engineering)
- The base model already handles the task well (wasted cost)

## Fine-Tuning Methods

### Supervised Fine-Tuning (SFT)

The most common method. Train on (input, desired output) pairs:

```jsonl
{"messages": [{"role": "user", "content": "Extract entities from: 'Apple CEO Tim Cook announced iPhone 16'"}, {"role": "assistant", "content": "{\"company\": \"Apple\", \"person\": \"Tim Cook\", \"product\": \"iPhone 16\"}"}]}
{"messages": [{"role": "user", "content": "Extract entities from: 'OpenAI launched GPT-5 in 2025'"}, {"role": "assistant", "content": "{\"company\": \"OpenAI\", \"product\": \"GPT-5\", \"year\": \"2025\"}"}]}
```

### LoRA (Low-Rank Adaptation)

Fine-tune only a small subset of parameters — 10,000x fewer trainable parameters than full fine-tuning:

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.3-70B")

config = LoraConfig(
    r=16,              # rank — lower = fewer parameters
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, config)
model.print_trainable_parameters()
# trainable params: 4,194,304 || all params: 70,553,882,624 || trainable%: 0.006%
```

LoRA is the standard for fine-tuning open-source models (Llama, Mistral, Qwen) on consumer hardware.

### RLHF (Reinforcement Learning from Human Feedback)

Training method used to create aligned models like Claude and GPT-4. Requires:
1. Supervised pre-training
2. Reward model training from human preference pairs
3. PPO optimization against reward model

Used by Anthropic, OpenAI, and Google to align base models. Too complex for most production teams — use SFT instead.

## Fine-Tuning via APIs

### OpenAI Fine-Tuning

```python
from openai import OpenAI

client = OpenAI()

# Upload training data
file = client.files.create(
    file=open("training_data.jsonl", "rb"),
    purpose="fine-tune"
)

# Create fine-tune job
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini",
    hyperparameters={"n_epochs": 3}
)

print(f"Job ID: {job.id}")
# Use fine-tuned model: "ft:gpt-4o-mini:org:custom:id"
```

### Anthropic (Claude) Fine-Tuning

Claude fine-tuning is available via the Anthropic API for enterprise customers. Contact [Anthropic](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=fine-tuning) for access. Fine-tuned Claude models retain Constitutional AI safety properties.

## Combining Fine-Tuning + RAG

Production AI systems often combine both:

```
User Query
    ↓
Fine-tuned model (knows domain vocabulary, output format)
    +
RAG retrieval (current facts, specific documents)
    ↓
Generated response (correct format + up-to-date content)
```

Example: A medical AI assistant fine-tuned on clinical note format + RAG over current drug interaction databases.

## Dataset Size Requirements

| Use Case | Minimum Examples | Quality Required |
|---------|-----------------|-----------------|
| Style/tone change | 50-100 | High |
| Format consistency | 100-500 | Medium |
| Domain adaptation | 500-2,000 | High |
| New task | 1,000-5,000 | High |
| Production quality | 10,000+ | Very high |

**Quality > quantity**: 100 high-quality examples outperform 1,000 noisy examples every time.

## Frequently Asked Questions

**Q: What is fine-tuning in AI?**
A: Fine-tuning is training a pre-trained LLM on custom data to adapt its behavior, style, or domain knowledge. It modifies model weights during a training phase — unlike prompts, which guide the model at inference time without changing the model.

**Q: Fine-tuning vs RAG — which should I use?**
A: Use RAG when you need up-to-date or frequently changing information. Use fine-tuning when you need consistent output format, tone, or domain vocabulary. Use both for production systems requiring both accurate facts and consistent behavior.

**Q: How much data do I need to fine-tune an LLM?**
A: Minimum 50-100 high-quality examples for style changes; 1,000+ for domain adaptation; 10,000+ for production-grade quality. Quality matters more than quantity — noisy data degrades performance.

**Q: What is LoRA fine-tuning?**
A: LoRA (Low-Rank Adaptation) fine-tunes only a small fraction (~0.006%) of model parameters instead of all weights. This makes fine-tuning feasible on consumer GPUs (RTX 3090, A100) for models up to 70B parameters. The standard method for open-source model fine-tuning.

**Q: Can I fine-tune Claude?**
A: Claude fine-tuning is available to enterprise customers via the Anthropic API. Fine-tuned Claude models retain Constitutional AI alignment. [Contact Anthropic →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=fine-tuning)

**Q: Does fine-tuning replace the system prompt?**
A: No. Fine-tuning bakes behavior into model weights, reducing the need for long system prompts. But system prompts still work in fine-tuned models and can override fine-tuned defaults. Together they're additive.

## Resources

- Build production AI with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=fine-tuning)
- **AI Agent Prompts Pack** (fine-tuning dataset templates, SFT examples, evaluation prompts): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=fine-tuning)

## Related

- [RAG](rag.md)
- [Prompt Engineering](prompt-engineering.md)
- [Claude API](../tools/claude-api.md)
- [Vector Database](vector-database.md)
