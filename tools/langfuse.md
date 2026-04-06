# Langfuse — LLM Observability Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Langfuse is an open-source LLM observability and analytics platform that provides tracing, evaluation, prompt management, and cost monitoring for AI applications in production.**

Released in 2023, Langfuse addresses a critical gap in the LLM toolchain: production visibility. Unlike traditional software where logs and APM tools are sufficient, LLM applications require specialized observability — tracking token usage, prompt versions, model outputs, latency distributions, and evaluation scores across thousands of requests. Langfuse provides all of this in a single platform that can be self-hosted or used as a cloud service.

## Core Concepts

| Concept | Description |
|---------|-------------|
| Trace | A full record of one user request — from input to final output, including all intermediate steps |
| Span | A single step within a trace (an LLM call, a retrieval step, a tool call) |
| Score / Evaluation | A numeric or categorical label attached to a trace or span (human feedback, model-graded, rule-based) |
| Prompt version | A named, versioned prompt template stored in Langfuse and fetched at runtime |
| Generation | A specific LLM call span with token counts, model name, cost, and latency |
| Session | A group of traces that belong to one user session (e.g., a multi-turn conversation) |

## What Langfuse Tracks

For every LLM call in your application, Langfuse can record:

- **Latency** — end-to-end response time, per-span breakdown
- **Token usage** — input tokens, output tokens, total tokens
- **Cost** — estimated USD cost based on model pricing
- **Model** — which model was called (including version)
- **User** — user identifier for per-user analytics
- **Input / Output** — full prompt and response text
- **Metadata** — any arbitrary key-value data you attach
- **Environment** — production, staging, development

## Python Integration Quickstart

Install the SDK:

```bash
pip install langfuse
```

Set environment variables:

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_HOST="https://cloud.langfuse.com"  # or your self-hosted URL
```

Use the `@observe` decorator to automatically trace any function:

```python
from langfuse.decorators import observe, langfuse_context

@observe()
def my_llm_function(query):
    # Your LLM call here
    response = call_your_llm(query)
    langfuse_context.update_current_observation(
        input=query,
        output=response
    )
    return response
```

For direct SDK usage with more control:

```python
from langfuse import Langfuse

langfuse = Langfuse()

trace = langfuse.trace(
    name="chat-request",
    user_id="user-123",
    metadata={"environment": "production"}
)

generation = trace.generation(
    name="claude-call",
    model="claude-sonnet-4-6",
    model_parameters={"temperature": 0.7},
    input=[{"role": "user", "content": query}],
    output=response_text,
    usage={"input": 450, "output": 120}
)

langfuse.flush()
```

## Native SDK Integrations

Langfuse provides drop-in integrations that require minimal code changes:

| Integration | How it works |
|-------------|-------------|
| OpenAI SDK | `langfuse.openai` wrapper — replaces `openai.OpenAI()` |
| LangChain | `CallbackHandler` — pass as a callback, zero code changes |
| LlamaIndex | `LlamaIndexCallbackHandler` — one-line setup |
| Anthropic SDK | `@observe` decorator + manual generation logging |
| LiteLLM | Native Langfuse callback support |
| Instructor | Works via LangChain or OpenAI wrapper |

## Langfuse vs LangSmith vs Helicone vs Arize Phoenix vs Weave

| Dimension | Langfuse | LangSmith | Helicone | Arize Phoenix | Weave (W&B) |
|-----------|----------|-----------|----------|--------------|-------------|
| Open source | Yes (MIT) | No | No | Yes | No |
| Self-hostable | Yes | No | No | Yes | No |
| Cloud free tier | Yes | Yes (limited) | Yes | Yes | Yes |
| Paid cloud | $59/month | $39/month | $20/month | Custom | $50/month |
| LLM provider support | All providers | All providers | All providers | All providers | All providers |
| LangChain integration | Native | Native (built by LC) | Via proxy | Native | Native |
| Prompt versioning | Yes | Yes | No | No | Yes |
| Human feedback / eval | Yes | Yes | Limited | Yes | Yes |
| Dataset management | Yes | Yes | No | Yes | Yes |
| Cost tracking | Yes | Yes | Yes | Yes | Yes |
| Best for | Teams wanting open-source control | LangChain-first teams | Simple proxy analytics | ML + LLM teams | W&B users |

**Key distinction**: LangSmith is built by the LangChain team and has the tightest LangChain integration, but it is closed-source and cloud-only. Langfuse is fully open-source and self-hostable, making it the default choice for teams with data residency requirements or cost sensitivity.

## Self-Hosting with Docker

Langfuse can be self-hosted in under 10 minutes using Docker Compose:

```bash
git clone https://github.com/langfuse/langfuse
cd langfuse
cp .env.example .env
# Edit .env: set NEXTAUTH_SECRET, SALT, DATABASE_URL, etc.
docker compose up -d
```

The default stack includes:
- **langfuse-web**: Next.js frontend and API
- **postgres**: Primary database for traces, scores, and prompts
- **redis**: Queue for async ingestion

For production deployment, the recommended setup uses a managed PostgreSQL instance (e.g., RDS, Supabase, Neon) and runs the Langfuse container on Railway, Fly.io, or a VPS.

**Langfuse Cloud** is the hosted version at `cloud.langfuse.com`. The Hobby plan is free (50,000 traces/month). The Pro plan starts at $59/month for higher volume and team features.

## Evaluation Workflows

Langfuse supports three evaluation approaches that can be used independently or in combination:

**Human feedback**: Attach a thumbs-up/thumbs-down or numeric score to any trace from the Langfuse UI. Useful for seeding evaluation datasets and measuring quality over time.

**Model-based scoring**: Use an LLM as a judge to automatically score outputs for criteria like faithfulness, relevance, or toxicity. Langfuse provides an `@observe`-decorated evaluation function that logs scores back to traces.

**Rule-based checks**: Write Python functions that inspect outputs and return scores (e.g., check if a JSON schema is valid, verify that a required field is present, assert response length constraints).

Scores are queryable in the Langfuse dashboard and via API, enabling data-driven prompt improvement and regression detection between deployments.

## Prompt Management

Langfuse acts as a prompt registry: store named, versioned prompts in the UI and fetch them at runtime so prompt changes don't require code deployments.

```python
from langfuse import Langfuse

langfuse = Langfuse()
prompt = langfuse.get_prompt("my-prompt-name")
compiled = prompt.compile(variable="value")
```

Each prompt version is linked to the traces it generated, creating a direct feedback loop from production data to prompt iteration.

## Frequently Asked Questions

**Q: What is Langfuse?**
A: Langfuse is an open-source observability and analytics platform built specifically for LLM applications. It records every LLM call in your application as a structured trace — capturing inputs, outputs, token counts, latency, cost, and custom metadata. Developers use Langfuse to debug unexpected outputs in production, monitor cost trends, compare model performance, manage prompt versions, and run systematic evaluations. It can be self-hosted for free using Docker or accessed as a cloud service at cloud.langfuse.com.

**Q: Langfuse vs LangSmith — which is better?**
A: It depends on your team's priorities. LangSmith is built by the LangChain team and offers the tightest LangChain integration, plus a polished evaluation and dataset UI. However, it is closed-source and cloud-only, which is a blocker for teams with data residency requirements. Langfuse is open-source (MIT license), self-hostable, supports all LLM providers equally, and has a free cloud tier. For teams not exclusively using LangChain, or teams needing self-hosting, Langfuse is generally the better choice. Both tools are actively developed and roughly comparable on features as of 2026.

**Q: Is Langfuse free?**
A: Yes, in two ways. The open-source version is free to self-host with no feature limitations — you only pay for infrastructure (a small VPS or managed Postgres). Langfuse Cloud has a free Hobby tier that includes 50,000 traces per month, which covers most early-stage production applications. The Pro plan at $59/month adds higher volume, team collaboration features, and SLA. There is no artificial feature gating between tiers — all evaluation, prompt versioning, and analytics features are available on the free plan.

**Q: How do I trace LLM calls with Langfuse?**
A: The simplest way is the `@observe` decorator from `langfuse.decorators`. Wrap any function that makes an LLM call with `@observe()`, set your `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` environment variables, and Langfuse automatically captures inputs, outputs, and timing. For more control, use the `langfuse.trace()` and `trace.generation()` SDK methods to manually log each step. If you use LangChain, add `LangfuseCallbackHandler()` as a callback and all traces are captured automatically without any other changes.

**Q: What is LLM observability?**
A: LLM observability is the practice of monitoring and analyzing the runtime behavior of AI applications that use large language models. Unlike traditional software observability (CPU, memory, error rates), LLM observability focuses on: prompt quality and versioning, token usage and costs, response quality and consistency, latency at each pipeline step, evaluation scores over time, and per-user or per-session analytics. Observability is essential for production LLM applications because model behavior is probabilistic — the same input can produce different outputs, and subtle prompt changes can have large downstream effects that are only visible through systematic monitoring.

## Resources

- Langfuse documentation: [langfuse.com/docs](https://langfuse.com/docs?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langfuse)
- Use Claude as your LLM backend: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langfuse)
- **LLM Engineering Prompts Pack** (evaluation prompts, observability setup guides, cost optimization templates): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langfuse)

## Related

- [LangChain](langchain.md)
- [RAG](../concepts/rag.md)
- [Prompt Engineering](../concepts/prompt-engineering.md)
- [Claude API](claude-api.md)
- [Supabase](supabase.md)
