# AutoGen — Microsoft's Multi-Agent Framework 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AutoGen is an open-source multi-agent conversation framework by Microsoft Research that enables building AI systems where multiple specialized agents collaborate through structured conversations to solve complex tasks.**

## What Is AutoGen?

AutoGen, developed by Microsoft Research and released in 2023, provides a framework for building applications where multiple AI agents communicate with each other to complete tasks. Instead of relying on a single monolithic LLM call, AutoGen decomposes problems across specialized agents — a planner, a coder, a critic, a user proxy — that exchange messages in a structured conversation until the task is complete.

AutoGen 0.4 (released 2025) introduced a significant architectural rewrite: the framework moved to an actor model with asynchronous messaging, making it suitable for production multi-agent systems beyond research prototypes.

## Core Concepts

### Agent Types

| Agent Type | Role | Behavior |
|------------|------|----------|
| `AssistantAgent` | AI worker | LLM-backed; generates plans, code, or responses |
| `UserProxyAgent` | Human proxy | Executes code, provides human input, or auto-replies |
| `CodeExecutorAgent` | Sandboxed executor | Runs generated code in a Docker container or local sandbox |
| Custom agents | Domain specialist | Any agent with a custom `on_message` handler |

### Conversation Patterns

| Pattern | Description | Use Case |
|---------|-------------|---------|
| Two-agent chat | One assistant + one user proxy | Simple task delegation |
| Round-robin group | Agents take turns responding | Iterative refinement |
| Selector group | LLM picks the next speaker | Dynamic task routing |
| Swarm | Agents hand off to each other | Sequential pipeline tasks |
| Nested chat | One agent spawns a sub-conversation | Complex sub-tasks |

## AutoGen 0.4 Architecture

AutoGen 0.4 introduced breaking changes from earlier versions:

- **Actor model**: Agents are actors that process messages asynchronously
- **Runtime**: `SingleThreadedAgentRuntime` (local) or `WorkerAgentRuntime` (distributed)
- **Topics and subscriptions**: Agents subscribe to message topics instead of being directly addressed
- **Composable teams**: `RoundRobinGroupChat`, `SelectorGroupChat`, `Swarm` built on top of the core runtime

The new architecture enables deploying AutoGen agents across multiple processes or machines.

## Basic Example

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.anthropic import AnthropicChatCompletionClient

async def main():
    # Configure Claude as the model backend
    claude_client = AnthropicChatCompletionClient(
        model="claude-sonnet-4-6",
    )

    assistant = AssistantAgent(
        name="assistant",
        model_client=claude_client,
        system_message="You are a helpful coding assistant.",
    )

    user = UserProxyAgent(
        name="user",
        code_execution_config={"work_dir": "workspace", "use_docker": False},
    )

    team = RoundRobinGroupChat([assistant, user], max_turns=6)

    await Console(
        team.run_stream(task="Write and test a Python function to sort a list of dicts by a key")
    )

asyncio.run(main())
```

## Code Execution

AutoGen's `UserProxyAgent` can execute Python code blocks that the `AssistantAgent` generates. Execution can happen in:

| Environment | Setup | Security |
|-------------|-------|---------|
| Local process | Default, no setup | Low isolation |
| Docker container | `use_docker: True` | High isolation |
| Jupyter kernel | `JupyterCodeExecutor` | Interactive, stateful |
| Remote sandbox | Custom executor | Production-grade |

For production use, Docker-based code execution is strongly recommended to prevent generated code from affecting the host system.

## AutoGen vs CrewAI vs LangGraph vs LlamaIndex Workflows

| Framework | Paradigm | Learning Curve | Best For |
|-----------|---------|---------------|---------|
| AutoGen | Conversation-based agents | Medium | Code generation, research, dynamic dialogue |
| CrewAI | Role-based crews with tasks | Low | Structured task delegation, content pipelines |
| LangGraph | State machine graphs | High | Complex stateful workflows, fine-grained control |
| LlamaIndex Workflows | Event-driven | Medium | RAG + agent pipelines, document processing |

**Choose AutoGen when**: You need agents that reason through problems in a back-and-forth conversation, especially for coding tasks where code generation and execution need to be tightly coupled.

**Choose CrewAI when**: You have a clear pipeline of distinct roles (researcher, writer, editor) and want minimal configuration.

**Choose LangGraph when**: You need explicit state machines with conditional branching, human-in-the-loop approval gates, or fine-grained control over the agent execution graph.

## AutoGen Studio

AutoGen Studio is a visual, no-code interface for building and testing AutoGen workflows without writing Python:

| Feature | Description |
|---------|-------------|
| Drag-and-drop agents | Create and configure agents visually |
| Workflow builder | Chain agents into multi-step workflows |
| Live playground | Test workflows in the browser |
| Export to code | Generate Python AutoGen code from visual designs |
| Model configuration | Connect GPT-4, Claude, Gemini, or local Ollama |

AutoGen Studio is available as a web application and can be run locally:

```bash
pip install autogenstudio
autogenstudio ui --port 8080
```

## Supported Models

AutoGen is model-agnostic through its `ModelClient` abstraction:

| Model Provider | Client Class | Notes |
|---------------|-------------|-------|
| OpenAI (GPT-4o, o1) | `OpenAIChatCompletionClient` | Default in most examples |
| Anthropic (Claude) | `AnthropicChatCompletionClient` | Via `autogen-ext` |
| Google (Gemini) | `GoogleAIClient` | Via `autogen-ext` |
| Azure OpenAI | `AzureOpenAIChatCompletionClient` | Enterprise deployments |
| Local (Ollama) | `OllamaChatCompletionClient` | Offline / private |

## Installation

```bash
# Core package
pip install autogen-agentchat

# Extensions (Claude, Gemini, code executors)
pip install autogen-ext[anthropic,openai,docker]

# AutoGen Studio (visual UI)
pip install autogenstudio
```

AutoGen 0.4 packages have been renamed: use `autogen-agentchat` (not `pyautogen`) for the new API.

## Production Considerations

| Concern | Recommendation |
|---------|---------------|
| Infinite loops | Set `max_turns` on all group chats |
| Cost control | Set token budgets per agent; log usage |
| Code safety | Use Docker executor; never run untrusted code locally |
| Observability | Integrate with LangFuse or OpenTelemetry for tracing |
| Determinism | Set temperature to 0 for reproducible agent behavior |

## Frequently Asked Questions

**Q: What is AutoGen?**
A: AutoGen is an open-source framework from Microsoft Research for building multi-agent AI systems. It defines a conversation-based model where specialized agents (planners, coders, critics, executors) exchange messages to collaboratively solve complex tasks. AutoGen 0.4 introduced an actor-based architecture with async messaging, making it production-ready beyond research prototypes.

**Q: AutoGen vs CrewAI — which is better?**
A: The two frameworks suit different use cases. AutoGen excels at code generation and research tasks where agents need to reason through problems in dialogue — generating code, running it, observing output, and iterating. CrewAI is better for structured content pipelines where roles are clearly defined upfront (researcher, writer, editor) and the workflow is linear. AutoGen has a steeper learning curve but more flexibility; CrewAI is faster to get running for standard use cases.

**Q: Does AutoGen support Claude?**
A: Yes. AutoGen's `autogen-ext` package includes an `AnthropicChatCompletionClient` that routes agent LLM calls through the Claude API. All Claude models (claude-sonnet-4-6, claude-opus-4, etc.) are supported. Claude's strong instruction-following and extended context window make it a good backend for AutoGen agents handling large codebases.

**Q: What is AutoGen Studio?**
A: AutoGen Studio is a browser-based visual interface for building AutoGen multi-agent workflows without writing Python code. It allows dragging and dropping agents, configuring their roles and model backends, connecting them into workflows, and testing them in a live playground. Workflows can be exported as Python code. It runs locally via `autogenstudio ui` or as a hosted service.

**Q: Can AutoGen write and execute code?**
A: Yes. The `UserProxyAgent` or `CodeExecutorAgent` can execute Python code blocks generated by an `AssistantAgent`. Execution can happen in a local process, a Docker container (recommended for safety), or a Jupyter kernel. The agent observes the output (stdout, errors) and the conversation continues based on the result, enabling an iterative code-write-debug loop.

**Q: Is AutoGen production-ready?**
A: AutoGen 0.4's actor model and async runtime make it more production-ready than earlier versions. For production use, configure Docker-based code execution, set `max_turns` limits to prevent runaway loops, add observability via LangFuse or OpenTelemetry, and implement token budgets per agent. It is in active use at Microsoft and several enterprise deployments as of 2026.

## Further Resources

- [AutoGen GitHub repository](https://github.com/microsoft/autogen)
- [AutoGen documentation](https://microsoft.github.io/autogen/)
- [Claude API — use Claude as AutoGen's model backend](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=autogen)
- [AI Tools Mastery Guide (Gumroad)](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=autogen)
- [Multi-agent systems overview](../concepts/multi-agent-system.md)
- [Agentic AI concepts](../concepts/agentic-ai.md)
- [LangChain comparison](./langchain.md)
