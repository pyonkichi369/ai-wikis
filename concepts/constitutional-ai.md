# Constitutional AI — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Constitutional AI (CAI) is Anthropic's training methodology that uses a set of principles (a "constitution") to guide an AI model's self-critique and revision process, producing models that are helpful, harmless, and honest without requiring human feedback for every example.**

First described in Anthropic's December 2022 paper "Constitutional AI: Harmlessness from AI Feedback," CAI was developed to address a core limitation of RLHF (Reinforcement Learning from Human Feedback): the need for large amounts of human-labeled data to teach models to avoid harmful outputs. CAI replaces much of that human labeling with AI-generated critiques guided by explicit principles.

## How Constitutional AI Works

CAI training proceeds in two phases:

### Phase 1: Supervised Learning with Self-Critique

1. **Generate harmful response** — The model is prompted to produce a potentially problematic output (red-teaming).
2. **Critique** — The same model critiques its own response against a constitutional principle (e.g., "Does this response support or encourage illegal activity?").
3. **Revise** — The model rewrites its response to address the critique.
4. **Repeat** — Multiple critique-revision rounds occur per example.
5. **Fine-tune** — The model is fine-tuned on the revised (safer) responses.

### Phase 2: RLAIF (Reinforcement Learning from AI Feedback)

Rather than using human preference labels, the model generates preference labels guided by the constitution. A separate preference model (PM) is trained on these AI-generated labels, then used as the reward signal in PPO training — analogous to RLHF but with AI-generated rather than human-generated feedback.

## The Constitution

Anthropic's constitution is a list of principles drawn from multiple sources:

| Source | Example Principle |
|--------|------------------|
| UN Declaration of Human Rights | Responses should respect human dignity and autonomy |
| Apple App Store guidelines | Avoid content inappropriate for general audiences |
| Anthropic's own values | Be honest; don't deceive or manipulate |
| Research best practices | Prioritize user well-being over engagement |

The constitution is public. It covers harms including violence, hate speech, deception, privacy violations, and assistance with weapons of mass destruction — while preserving helpfulness and avoiding excessive refusals.

## CAI vs RLHF vs DPO

| Dimension | RLHF | Constitutional AI (CAI/RLAIF) | DPO (Direct Preference Optimization) |
|-----------|------|-------------------------------|--------------------------------------|
| Human feedback required | High volume per example | Minimal (principles only) | Moderate (preference pairs) |
| Training stages | Supervised → RM → PPO | SL + self-critique → RLAIF → PPO | Supervised → direct optimization |
| Explicit principles | No | Yes (the constitution) | No |
| Scalability | Limited by human labeler throughput | High (AI generates critiques) | Moderate |
| Alignment transparency | Implicit in human preferences | Explicit (principles documented) | Implicit |
| Used by | OpenAI (GPT-4), most RLHF models | Anthropic (Claude) | Many open-source models (Zephyr, etc.) |
| Reward hacking risk | Moderate | Lower (multi-principle) | Lower (no RM) |

## Why Claude Behaves Differently than GPT-4

GPT-4 and most competing models use standard RLHF: human raters label which outputs are preferred, and the model is trained to match those preferences. This produces helpful models but the alignment objective is implicit — it reflects whatever human raters collectively preferred, which may vary and is not fully documented.

Claude's CAI training encodes explicit principles. This means:
- Claude's refusals and caveats trace back to specific constitutional principles
- Claude will sometimes decline a request that RLHF-trained models complete (and vice versa)
- Claude is designed to be more forthcoming about *why* it is declining, rather than giving opaque refusals

Neither approach is strictly superior — they represent different design philosophies around alignment transparency.

## Claude's Core Values Derived from CAI

Claude's constitutional training instills several observable behavioral properties:

| Value | Behavioral Expression |
|-------|-----------------------|
| Honesty | Acknowledges uncertainty; refuses to fabricate citations |
| Non-deception | Will not pretend to be human when sincerely asked |
| Non-manipulation | Persuades only through evidence and reasoning |
| Autonomy-preservation | Presents multiple perspectives rather than pushing one view |
| Harm avoidance | Graduated refusals based on severity and context |
| Helpfulness | Balances safety against over-refusal (unhelpfulness is also a cost) |

## Implications for Safety and Alignment Research

CAI addresses the scalable oversight problem: as AI systems become more capable, human ability to evaluate their outputs decreases. RLAIF — using AI to evaluate AI — is one proposed solution. CAI is an early empirical demonstration that AI-generated feedback guided by explicit principles can produce safer models.

Current open research questions include:
- Whether constitutional principles are sufficiently complete to cover novel harms
- Whether self-critique genuinely internalizes principles or learns to appear compliant
- Whether RLAIF feedback can be adversarially manipulated

Anthropic continues publishing research on these questions, including work on interpretability (mechanistic understanding of what CAI-trained models actually represent internally).

## Try Claude

Claude is Anthropic's publicly available model trained with Constitutional AI:
[Try Claude](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=constitutional-ai)

For a practical guide to AI tools: [AI Tools Handbook (PDF)](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=constitutional-ai)

## FAQ

**Q: Is Anthropic's constitution publicly available?**
Yes. Anthropic published the constitution used for Claude's training as part of their research transparency. It is available on Anthropic's website and in the original Constitutional AI paper on arXiv. The document lists the specific principles, their sources, and how they are prioritized when they conflict.

**Q: Does RLAIF produce worse alignment than human feedback?**
Research results are mixed. Anthropic's original CAI paper showed RLAIF-trained models were preferred by humans over RLHF-trained baselines on harmlessness metrics, while remaining comparably helpful. The key advantage of RLAIF is scalability — AI-generated feedback does not bottleneck on human labeler availability — though it may encode biases present in the model generating the critiques.

**Q: Can other companies adopt Constitutional AI?**
Yes. The methodology is described in detail in the public paper, and the approach has been replicated by researchers. Several open-source models have experimented with CAI-style training. However, the specific constitution Anthropic uses and the full training infrastructure are proprietary.

**Q: What is the difference between CAI and Anthropic's Responsible Scaling Policy (RSP)?**
Constitutional AI is a training methodology that shapes model behavior. The Responsible Scaling Policy (RSP) is an organizational governance framework that governs when and how Anthropic develops and deploys more powerful models based on capability evaluations and safety thresholds. CAI operates at the model level; RSP operates at the organizational and deployment level.

**Q: How does Constitutional AI relate to interpretability research?**
They are complementary but distinct. CAI is a training approach that shapes model behavior using explicit principles. Interpretability research attempts to understand what is happening inside a trained model — which circuits, features, and representations correspond to which behaviors. Ideally, interpretability would verify that CAI training actually instilled the intended principles rather than teaching the model to simulate compliance.
