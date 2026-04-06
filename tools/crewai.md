# CrewAI — Multi-Agent Framework Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**CrewAI is a Python framework for building multi-agent AI systems organized as "crews" — teams of specialized AI agents with defined roles, goals, and tools that collaborate on complex tasks through sequential or hierarchical task execution.**

Released in late 2023, CrewAI rapidly became one of the most widely adopted multi-agent frameworks due to its approachable API and role-based mental model. The framework abstracts the complexity of agent coordination, tool use, and inter-agent communication into four primary concepts: Crew, Agent, Task, and Process.

---

## Core Concepts

| Concept | Description |
|---------|------------|
| **Agent** | An individual AI worker with a defined role, goal, backstory, and set of tools. The backstory provides context that shapes behavior. |
| **Task** | A unit of work assigned to an agent, with a description, expected output, and optional context from prior tasks. |
| **Crew** | The team — a collection of agents and tasks organized into a pipeline. |
| **Process** | The execution strategy: `sequential` (tasks run one after another) or `hierarchical` (a manager agent delegates and validates). |
| **Tool** | A callable capability an agent can use: web search, file I/O, code execution, API calls, etc. |

---

## Minimal Working Example

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Researcher",
    goal="Research AI trends",
    backstory="Expert analyst with 10 years in technology research",
    llm="claude-sonnet-4-6"
)

writer = Agent(
    role="Writer",
    goal="Write clear, accurate articles from research summaries",
    backstory="Technical writer specializing in AI and software topics",
    llm="claude-sonnet-4-6"
)

task1 = Task(
    description="Research the latest multi-agent AI frameworks released in 2025-2026. "
                "Summarize key capabilities, adoption metrics, and differentiators.",
    expected_output="A structured summary of 5 multi-agent frameworks with comparisons.",
    agent=researcher
)

task2 = Task(
    description="Write a 600-word article based on the research summary. "
                "Target audience: senior engineers evaluating agent frameworks.",
    expected_output="A polished article ready for publication.",
    agent=writer,
    context=[task1]  # task2 receives task1's output as context
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[task1, task2],
    verbose=True
)

result = crew.kickoff()
print(result.raw)
```

---

## Process Types

### Sequential Process

Tasks execute in order. Each task can receive the output of previous tasks as context. Suitable for linear workflows: research → draft → review → publish.

### Hierarchical Process

A manager agent (specified or auto-created) receives the overall goal, decomposes it into sub-tasks, assigns them to worker agents, and validates outputs before returning results. Suitable for complex tasks where decomposition and quality control are non-trivial.

```python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, writing_task, editing_task],
    process=Process.hierarchical,
    manager_llm="claude-sonnet-4-6"  # LLM used by the manager agent
)
```

---

## Built-in Tools

CrewAI ships with a standard library of tools and integrates with LangChain tools:

| Tool | Function |
|------|---------|
| `SerperDevTool` | Google Search via Serper API |
| `WebsiteSearchTool` | Semantic search within a specific website |
| `FileReadTool` / `FileWriteTool` | Read from and write to local files |
| `CodeInterpreterTool` | Execute Python code in a sandboxed environment |
| `PDFSearchTool` | Semantic search within PDF documents |
| `YoutubeVideoSearchTool` | Search and retrieve YouTube transcript content |
| Custom tools | Any Python function decorated with `@tool` |

---

## Supported LLM Providers

CrewAI uses LiteLLM under the hood, enabling support for most major providers:

| Provider | Example Model String |
|---------|---------------------|
| Anthropic | `claude-sonnet-4-6`, `claude-opus-4-5` |
| OpenAI | `gpt-4o`, `gpt-4o-mini` |
| Google | `gemini/gemini-1.5-pro` |
| Ollama (local) | `ollama/llama3`, `ollama/mistral` |
| OpenRouter | `openrouter/anthropic/claude-sonnet-4-6` |

---

## Framework Comparison

| Framework | Paradigm | Difficulty | State Management | Best Use Case |
|-----------|---------|-----------|-----------------|--------------|
| CrewAI | Role-based crews | Easy | Implicit (task context) | Structured delegation, content pipelines, research workflows |
| AutoGen | Conversation-based | Medium | Conversation history | Code generation, multi-turn problem solving, research |
| LangGraph | State graph (DAG) | Hard | Explicit state dict | Complex stateful flows, branching logic, human-in-the-loop |
| LangChain AgentExecutor | Single agent + tools | Easy | Tool call history | Simple tool-augmented Q&A, single-agent automation |
| Pydantic AI | Type-safe agents | Medium | Typed dependencies | Production APIs requiring validation, typed pipelines |

### CrewAI vs AutoGen

AutoGen uses a conversation metaphor: agents send messages to each other in a chat-like loop. CrewAI uses a workflow metaphor: agents are assigned tasks with defined outputs. AutoGen is more flexible for open-ended code generation tasks; CrewAI is easier to reason about for structured business workflows.

### CrewAI vs LangGraph

LangGraph represents workflows as directed graphs with explicit state. It offers finer control over branching, cycles, and human-in-the-loop interruptions, but requires more code to configure. CrewAI abstracts these concerns behind crews and processes, trading flexibility for simplicity.

---

## Installation and Setup

```bash
pip install crewai crewai-tools

# Optional: set API keys
export ANTHROPIC_API_KEY="your-key"
export SERPER_API_KEY="your-key"  # for web search tool
```

For projects using `.env` files:

```python
from dotenv import load_dotenv
load_dotenv()

import os
os.environ["ANTHROPIC_API_KEY"]  # verified present
```

The minimum supported Python version is 3.10. CrewAI is compatible with virtual environments created via `venv`, `conda`, or `uv`.

---

## Custom Tools

Any Python function can become a CrewAI tool using the `@tool` decorator:

```python
from crewai_tools import tool
import httpx

@tool("Fetch webpage content")
def fetch_url(url: str) -> str:
    """Fetches the text content of a given URL."""
    response = httpx.get(url, timeout=10)
    response.raise_for_status()
    return response.text[:5000]  # truncate to avoid context overflow
```

Agents with this tool in their `tools` list can invoke it autonomously during task execution. The docstring is used as the tool description that the LLM reads when deciding whether to call it.

---

## Production Considerations

| Concern | Recommendation |
|---------|---------------|
| LLM costs | Use `claude-haiku-3-5` for simple agents; reserve Sonnet/Opus for manager or research roles |
| Determinism | Set `temperature=0` on agents where consistent output format matters |
| Timeouts | Wrap `crew.kickoff()` in a timeout handler for user-facing applications |
| Error handling | Catch `crewai.exceptions.TaskError` and log the failing agent and task description |
| Observability | Enable `verbose=True` during development; integrate Langfuse for production tracing |
| Parallel execution | Set `max_workers` on the Crew for independent tasks that can run concurrently |

---

## Memory and Context

CrewAI provides four memory layers for agents:

| Memory Type | Scope | Storage |
|------------|-------|---------|
| Short-term | Current crew run | In-memory (RAG over recent interactions) |
| Long-term | Across runs | SQLite (persisted summaries) |
| Entity | Named entities | SQLite (people, places, concepts) |
| Contextual | Task-level | Passed explicitly via `context` parameter |

Memory is enabled with `memory=True` on the `Crew` object.

---

## FAQ

**What is CrewAI?**
CrewAI is an open-source Python framework for building multi-agent AI systems. It organizes agents into "crews" — teams where each agent has a defined role, goal, and backstory — and assigns tasks to agents in a configured execution order (sequential or hierarchical). The framework handles inter-agent communication, tool use, and context passing, allowing developers to build complex AI workflows without managing low-level orchestration.

**CrewAI vs AutoGen — which should I use?**
CrewAI is easier to get started with and suits structured workflows where tasks have clear inputs, outputs, and ownership. AutoGen is better suited to conversational, iterative tasks — particularly code generation loops where agents need to debate, test, and revise over multiple turns. If the workflow can be expressed as a pipeline with defined stages and outputs, use CrewAI. If the workflow requires open-ended agent dialogue and self-correction, consider AutoGen.

**Does CrewAI support Claude?**
Yes. CrewAI supports Anthropic's Claude models through LiteLLM. Set the `llm` parameter on any `Agent` to a string like `"claude-sonnet-4-6"` or `"claude-opus-4-5"` and ensure `ANTHROPIC_API_KEY` is set in the environment. Claude can also be used as the manager LLM in hierarchical process crews.

**How do I install CrewAI?**
Install via pip: `pip install crewai crewai-tools`. For web search capability, install the Serper integration and set `SERPER_API_KEY`. For local LLM support, install Ollama separately and use model strings prefixed with `ollama/`. The minimum Python version is 3.10.

**What is the difference between CrewAI and LangChain agents?**
LangChain's `AgentExecutor` runs a single agent that iteratively selects and calls tools until it reaches a final answer. It is designed for single-agent, tool-augmented tasks. CrewAI coordinates multiple agents as a team, where each agent specializes in a sub-domain and produces outputs consumed by other agents. CrewAI is appropriate when a task benefits from specialization and parallelism across multiple agent roles; LangChain AgentExecutor is appropriate for single-agent tool use.

---

## Resources

- [Claude API](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=crewai) — Anthropic's API for powering CrewAI agents with Claude models
- [AI Tools & Prompting Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=crewai) — Practical guide to AI tools and agent frameworks
- [CrewAI Documentation](https://docs.crewai.com)
- [CrewAI GitHub](https://github.com/crewAIInc/crewAI)
- Related: [AutoGen](autogen.md) | [LangChain](langchain.md) | [Multi-Agent Systems](../concepts/multi-agent-system.md)
