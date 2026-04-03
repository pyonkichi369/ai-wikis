# AI Agent — Definition, Types, and Implementation Guide

**An AI agent** is an autonomous software system that perceives its environment, makes decisions, and takes actions to achieve specific goals — without requiring step-by-step human instruction for each action. AI agents combine large language models (LLMs) with external tools, memory, and planning capabilities to complete multi-step tasks independently.

## Core Components

| Component | Description | Example |
|-----------|-------------|---------|
| LLM (brain) | Reasoning and decision-making | Claude, GPT-4, Gemini |
| Tools | Actions the agent can take | Web search, code execution, file I/O |
| Memory | State persistence across steps | Vector DB, conversation history |
| Planning | Task decomposition strategy | ReAct, CoT, Tree of Thought |
| Perception | Input processing | Text, images, structured data |

## Agent Architectures

### ReAct (Reason + Act)

The most common pattern. Agent alternates between reasoning (thinking) and acting (tool use):

```
Thought: I need to find the current Bitcoin price.
Action: web_search("Bitcoin price USD 2026")
Observation: Bitcoin is trading at $95,000.
Thought: Now I can answer the question.
Answer: Bitcoin is currently ~$95,000.
```

### Multi-Agent Systems

Multiple specialized agents collaborate, each handling one domain:

```
Orchestrator Agent
├── Research Agent    → gathers information
├── Writing Agent     → drafts content
├── QA Agent          → reviews output
└── Publisher Agent   → distributes final content
```

### Agentic Loop

```
User Request
    ↓
Plan tasks
    ↓
Execute task → Use tools → Observe result
    ↓ (loop until complete)
Return final output
```

## Types of AI Agents

| Type | Autonomy | Use Case |
|------|---------|----------|
| Simple reflex | Low | Rule-based responses |
| Goal-based | Medium | Task completion with planning |
| Learning | High | Adapts based on feedback |
| Multi-agent | Very High | Complex collaborative tasks |

## Popular Frameworks

| Framework | Language | Best For |
|-----------|---------|---------|
| LangChain | Python/JS | General agent development |
| CrewAI | Python | Multi-agent collaboration |
| AutoGen | Python | Conversational multi-agent |
| LlamaIndex | Python | Document-grounded agents |
| Claude Code | CLI | Software engineering tasks |
| n8n | Visual | No-code agent workflows |

## Practical Example: Research Agent

```python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "web_search",
        "description": "Search the web for current information",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    }
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=tools,
    messages=[{"role": "user", "content": "What are the top AI agent frameworks in 2026?"}]
)
```

## Frequently Asked Questions

**Q: What is an AI agent?**
A: An AI agent is an autonomous software system powered by an LLM that can plan, use tools, and complete multi-step tasks without human instruction at each step.

**Q: What is the difference between an AI agent and a chatbot?**
A: A chatbot responds to single messages. An AI agent autonomously executes multi-step tasks, uses external tools (web search, code execution), and maintains state across many actions.

**Q: What tools can AI agents use?**
A: Common tools include web search, code execution, file I/O, database queries, API calls, email/calendar access, and browser control.

**Q: What LLM is best for AI agents?**
A: Claude (Anthropic) and GPT-4o (OpenAI) are the top choices for agentic tasks. Claude excels at long-context and tool use accuracy. See [Claude API guide](../tools/claude-api.md).

**Q: How do I build my first AI agent?**
A: Start with Claude API + one tool (web search). Use the ReAct pattern. Grow complexity incrementally. Starter kit: [belleofficial.gumroad.com](https://belleofficial.gumroad.com).

**Q: What is a multi-agent system?**
A: A system where multiple AI agents with different specializations collaborate to complete complex tasks, similar to a human team with different roles.

## Getting Started

1. Choose a framework: [LangChain](https://langchain.com) or [CrewAI](https://crewai.com) for Python
2. Get an API key: [Claude API](../tools/claude-api.md) or OpenAI
3. Start simple: single agent + one tool
4. Reference: AI Agent Prompts Pack → [belleofficial.gumroad.com](https://belleofficial.gumroad.com)

## Related

- [Claude API](../tools/claude-api.md)
- [RAG](rag.md)
- [Prompt Engineering](prompt-engineering.md)
- [Multi-Agent Systems](multi-agent.md)
