# LLM Evaluation — How to Test AI Systems in Production 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**LLM evaluation is the systematic process of measuring AI system quality through automated metrics, human feedback, and behavioral testing — covering correctness, relevance, faithfulness, toxicity, and task-specific performance.**

As LLM applications move from prototypes to production, evaluation becomes a continuous engineering discipline rather than a one-time benchmark exercise. Teams that ship reliable AI products invest in evaluation infrastructure as heavily as in the models themselves.

## Evaluation Categories

| Category | Metrics | Tooling |
|---------|---------|---------|
| **Correctness** | Exact match, ROUGE, BLEU, F1 | Custom scripts, promptfoo |
| **Semantic quality** | Embedding cosine similarity, BERTScore | sentence-transformers, evaluate |
| **RAG faithfulness** | Faithfulness, answer relevance, context recall, context precision | RAGAS |
| **LLM-as-judge** | G-Eval, MT-Bench, pairwise preference | LangSmith, Langfuse, Braintrust |
| **Human preference** | Chatbot Arena-style, thumbs up/down, annotation | Argilla, Label Studio |
| **Safety / toxicity** | Toxicity score, refusal rate, jailbreak resistance | Perspective API, custom classifiers |
| **Task-specific: Code** | pass@k, execution accuracy | HumanEval, EvalPlus, SWE-Bench |
| **Task-specific: Math** | Accuracy, step correctness | MATH, GSM8K |
| **Latency / cost** | TTFT, TPS, cost per query | Langfuse, custom telemetry |

## RAG Evaluation with RAGAS

RAGAS (Retrieval-Augmented Generation Assessment) is the standard framework for evaluating RAG pipelines across four core dimensions:

| Metric | Measures | Interpretation |
|--------|---------|---------------|
| **Faithfulness** | Are claims in the answer grounded in retrieved context? | High = no hallucination |
| **Answer relevance** | Does the answer address the user's question? | High = on-topic responses |
| **Context recall** | Does retrieved context contain the needed information? | High = retriever is effective |
| **Context precision** | Is retrieved context noise-free and relevant? | High = retriever is precise |

### RAGAS Quickstart

```python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_recall,
    context_precision,
)

# Each row: question, answer, contexts (list of retrieved chunks), ground_truth
data = {
    "question": ["What is the return policy?"],
    "answer": ["Items can be returned within 30 days with receipt."],
    "contexts": [["Our return policy allows returns within 30 days of purchase..."]],
    "ground_truth": ["30-day return policy with receipt required."],
}
dataset = Dataset.from_dict(data)

result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, context_precision],
)
print(result)
# Output: {'faithfulness': 0.97, 'answer_relevancy': 0.91, ...}
```

RAGAS uses an LLM internally to compute most metrics — a model such as GPT-4o or Claude Sonnet is configured as the evaluation judge.

## LLM-as-Judge

LLM-as-judge is a technique where a capable LLM evaluates the outputs of another LLM (or the same model) according to a rubric. This scales human-quality evaluation to large datasets without manual annotation.

### G-Eval Pattern

G-Eval structures evaluation as a chain-of-thought scoring task:

```python
import anthropic

client = anthropic.Anthropic()

def g_eval(question: str, response: str, rubric: str) -> dict:
    prompt = f"""You are an evaluator. Score the following response on a scale of 1-5.

Rubric: {rubric}

Question: {question}
Response: {response}

Think step by step, then provide a score (1-5) and a brief justification.
Format: {{"score": <int>, "reasoning": "<str>"}}"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    import json
    return json.loads(message.content[0].text)

result = g_eval(
    question="Explain gradient descent",
    response="Gradient descent minimizes a function by iteratively moving in the direction of steepest descent...",
    rubric="Accuracy, clarity, completeness (1=poor, 5=excellent)"
)
print(result)
# {"score": 4, "reasoning": "Accurate and clear, but lacks mention of learning rate."}
```

### LLM-as-Judge Best Practices

| Practice | Rationale |
|---------|-----------|
| Use a more capable judge than the system under test | Avoids self-preference bias |
| Include explicit rubrics with anchor examples | Reduces scoring variance |
| Run multiple judge calls and average | Improves reliability |
| Test judge calibration against human labels | Validates judge quality |
| Be aware of position bias | Randomize answer order in pairwise comparisons |

## Evaluation Platforms

| Platform | Type | Key Features | Pricing |
|---------|------|-------------|---------|
| **Langfuse** | Open-source / cloud | Tracing, scoring, datasets, prompt management | Free tier + cloud |
| **LangSmith** | LangChain cloud | Dataset management, run comparison, Hub | $39/seat/month |
| **Braintrust** | Cloud | Eval pipelines, dataset versioning, experiments | Usage-based |
| **Weights & Biases** | ML platform | Experiment tracking, prompt eval, artifacts | Free tier + cloud |
| **promptfoo** | Open-source CLI | Prompt eval, red-teaming, CI integration | Free |
| **Argilla** | Open-source | Human annotation, RLHF data collection | Free / cloud |

### Langfuse Integration Example

```python
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

langfuse = Langfuse()

@observe()
def run_rag_pipeline(question: str) -> str:
    # Your retrieval + generation logic here
    answer = "..."
    
    # Log an evaluation score
    langfuse_context.score_current_observation(
        name="faithfulness",
        value=0.95,
        comment="All claims grounded in context"
    )
    return answer
```

## Continuous Evaluation in CI/CD

Production-grade LLM systems run evaluations as part of every deployment pipeline:

```yaml
# .github/workflows/eval.yml
name: LLM Eval Regression
on: [pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ragas promptfoo anthropic
      - run: python evals/run_eval.py --dataset evals/golden_set.json
      - run: python evals/assert_thresholds.py --faithfulness 0.90 --relevance 0.85
```

### Evaluation-Driven Development Workflow

1. **Define eval dataset** before shipping a new feature
2. **Establish baseline** scores on the current production prompt
3. **Make changes** (prompt update, model upgrade, RAG improvement)
4. **Run eval** and compare scores against baseline
5. **Gate deployment** on score thresholds — block if regression detected
6. **Monitor production** with online eval (sampling + LLM-as-judge on live traffic)

## Building Evaluation Datasets

| Dataset Type | Construction Method | Use Case |
|-------------|--------------------|---------| 
| **Golden dataset** | Human-curated question/answer pairs | Ground truth for automated metrics |
| **Adversarial examples** | Red-team prompts, edge cases, jailbreaks | Robustness and safety testing |
| **Synthetic dataset** | LLM-generated Q&A from documents | Rapid coverage at scale |
| **Production samples** | Logged real user queries | Reflects actual distribution |
| **Regression suite** | Previously failing examples | Prevent regressions |

A minimal production eval suite combines 50–200 golden examples with a regression suite that grows as bugs are found and fixed.

## Task-Specific Benchmarks (Reference)

| Benchmark | Domain | Metric | Notes |
|-----------|--------|--------|-------|
| HumanEval / EvalPlus | Code generation | pass@1, pass@10 | Python function completion |
| SWE-Bench | Software engineering | % resolved | Real GitHub issues |
| MATH | Mathematical reasoning | Accuracy | Competition math |
| GSM8K | Grade school math | Accuracy | Multi-step word problems |
| MT-Bench | Multi-turn conversation | LLM judge score | 80 multi-turn questions |
| MMLU | General knowledge | Accuracy | 57 academic subjects |
| TruthfulQA | Factual accuracy | Truthful % | Common misconceptions |

## Related Resources

- Build and evaluate AI applications with the Claude API: [Get started with Claude](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-evaluation)
- AI Engineering Toolkit (PDF): [ZENERA AI Toolkit on Gumroad](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=llm-evaluation)

---

## Frequently Asked Questions

### How do I evaluate an LLM application?

LLM application evaluation combines three approaches: automated metrics (ROUGE, BERTScore, RAGAS metrics) computed against a golden dataset; LLM-as-judge scoring where a capable model evaluates outputs against a rubric; and human annotation for high-stakes or novel failure modes. Start by defining a golden dataset of 50–200 representative input/output pairs, establish baseline scores on the current system, and gate future deployments on maintaining or improving those scores. Tools like promptfoo (CLI-native, open-source) and Langfuse (hosted, with tracing) make this workflow tractable for small teams.

### What is RAGAS?

RAGAS (Retrieval-Augmented Generation Assessment) is an open-source Python framework for evaluating RAG pipelines. It computes four primary metrics: faithfulness (are answers grounded in retrieved context?), answer relevance (does the answer address the question?), context recall (does the retrieved context contain the needed information?), and context precision (is the retrieved context noise-free?). RAGAS uses an LLM internally to compute these metrics, making it fast to run on large datasets without human annotation. It integrates with LangChain, LlamaIndex, and custom RAG pipelines.

### How do I use Claude to evaluate AI outputs?

Claude can serve as an LLM judge using the G-Eval pattern: define a scoring rubric (e.g., accuracy 1–5, with anchor examples), send the question and candidate response to Claude with an instruction to reason step-by-step and output a structured score, and parse the JSON result. For production use, run multiple judge calls per example and average the scores to reduce variance. Claude Sonnet is the recommended judge model for cost/quality balance. Tools like Langfuse and Braintrust provide built-in LLM-as-judge templates and score logging.

### What metrics should I use for RAG evaluation?

For RAG systems, the four RAGAS metrics cover the essential dimensions: faithfulness measures hallucination risk (are claims supported by retrieved chunks?), answer relevance measures whether the response addresses the user's intent, context recall measures retriever effectiveness (does retrieval surface the needed information?), and context precision measures retriever precision (is retrieved content relevant vs. noisy?). In addition, track end-to-end latency, cost per query, and a task-specific accuracy metric aligned to your domain (e.g., exact match for factual Q&A, or code execution pass rate for coding assistants).

### What is LLM-as-judge?

LLM-as-judge is an evaluation technique where a language model — typically one more capable than the system under test — scores AI outputs according to a defined rubric. It scales human-quality evaluation to thousands of examples without manual annotation. Common implementations include G-Eval (structured rubric + CoT scoring), MT-Bench (80 multi-turn questions scored 1–10), and pairwise preference evaluation (judge picks the better of two responses). Key risks are self-preference bias (models favor outputs from similar models) and position bias (the first option tends to be preferred); both can be mitigated with randomization and calibration against human labels.
