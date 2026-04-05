# AI Agent Memory — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI agent memory** refers to the mechanisms by which AI agents retain and access information across interactions, tasks, and sessions. Unlike simple LLM calls that are stateless, agents with memory can learn user preferences, track task progress, recall past interactions, and maintain long-term knowledge bases.

Memory is one of the core components that distinguishes a true AI agent from a stateless language model call.

## Types of AI Memory

| Memory Type | Description | Duration | Storage |
|------------|-------------|----------|---------|
| **In-context (Working)** | Current conversation in the context window | Session only | Context window |
| **Episodic** | Records of past interactions and events | Long-term | Vector DB, files |
| **Semantic** | Structured facts and knowledge | Long-term | Knowledge graph, DB |
| **Procedural** | How to perform tasks (skills, tools) | Permanent | Code, tool definitions |
| **Sensory** | Raw recent inputs (latest messages) | Very short | Buffer |

## Memory Architecture for Agents

```
Agent Memory System
├── Working Memory (in-context)
│   ├── System prompt
│   ├── Conversation history (last N turns)
│   └── Retrieved context (RAG results)
├── Episodic Memory (external)
│   ├── Past conversation summaries
│   ├── User preferences learned
│   └── Task completion records
├── Semantic Memory (external)
│   ├── Project-specific facts
│   ├── User profile data
│   └── Domain knowledge base
└── Procedural Memory (code)
    ├── Tool definitions
    ├── Workflow templates
    └── Decision rules
```

## Implementing Memory with Claude API

### Short-Term: Sliding Window

```python
import anthropic
from collections import deque

class ConversationalAgent:
    def __init__(self, max_history: int = 20):
        self.client = anthropic.Anthropic()
        self.history = deque(maxlen=max_history)
    
    def chat(self, user_message: str) -> str:
        self.history.append({"role": "user", "content": user_message})
        
        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system="You are a helpful assistant with memory of our conversation.",
            messages=list(self.history)
        )
        
        assistant_message = response.content[0].text
        self.history.append({"role": "assistant", "content": assistant_message})
        return assistant_message

agent = ConversationalAgent(max_history=20)
agent.chat("My name is Takuya and I'm building an AI startup.")
response = agent.chat("What do you know about me?")
# "Your name is Takuya and you're building an AI startup."
```

### Long-Term: Vector-Based Episodic Memory

```python
import anthropic
import chromadb
import json
from datetime import datetime

client = anthropic.Anthropic()
chroma = chromadb.Client()
memory_collection = chroma.create_collection("agent_memory")

def save_memory(interaction: dict):
    """Save an interaction to long-term vector memory."""
    summary = f"User: {interaction['user']}\nAssistant: {interaction['assistant']}"
    
    # Use Claude to create a searchable memory entry
    embed_response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[{"role": "user", "content": f"Summarize this in 1 sentence for memory storage:\n{summary}"}]
    )
    
    memory_text = embed_response.content[0].text
    memory_collection.add(
        documents=[memory_text],
        metadatas=[{"timestamp": datetime.now().isoformat(), "full_text": summary}],
        ids=[f"mem_{datetime.now().timestamp()}"]
    )

def recall_memories(query: str, n_results: int = 3) -> list[str]:
    """Retrieve relevant past memories."""
    results = memory_collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results["metadatas"][0] if results["metadatas"] else []

def agent_with_memory(user_message: str) -> str:
    # Retrieve relevant memories
    memories = recall_memories(user_message)
    memory_context = "\n".join(m["full_text"] for m in memories)
    
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=f"""You are a helpful assistant with memory of past interactions.
        
Relevant memories:
{memory_context if memory_context else "No relevant memories found."}""",
        messages=[{"role": "user", "content": user_message}]
    )
    
    assistant_text = response.content[0].text
    
    # Save this interaction to memory
    save_memory({"user": user_message, "assistant": assistant_text})
    
    return assistant_text
```

### MCP Memory Server

Claude Code includes the official `memory` MCP server for persistent key-value memory:

```json
// ~/.claude/mcp_settings.json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

This gives Claude Code a persistent knowledge graph that survives across sessions. Claude can call `create_entities`, `add_observations`, and `search_nodes` tools to remember and recall information.

## Memory Patterns by Use Case

### Personal AI Assistant

```
Memory stored:
- User name, preferences, working style
- Frequently asked question types
- Preferred response formats (bullet points vs paragraphs)
- Projects and their status

Implementation: User profile DB + conversation summaries
```

### Coding Agent

```
Memory stored:
- Project architecture decisions
- Coding conventions (from CLAUDE.md)
- Past bug fixes and solutions
- Test patterns used

Implementation: CLAUDE.md file + vector search over codebase
```

### Customer Support Agent

```
Memory stored:
- Customer history (past tickets, purchases)
- Previous resolution attempts
- Escalation thresholds per customer

Implementation: CRM integration + session summaries
```

## Memory vs RAG vs Fine-Tuning

| Approach | What It Remembers | Update Speed | Cost |
|---------|------------------|-------------|------|
| **Context Window** | Current session | Instant | Per-call |
| **Agent Memory** | Cross-session facts | Real-time | Storage + retrieval |
| **RAG** | Document corpus | Minutes | Embedding + storage |
| **Fine-Tuning** | Model-baked knowledge | Days (retrain) | High |

## Memory Failure Modes

| Failure | Cause | Solution |
|---------|-------|---------|
| Hallucinated memories | Model confabulates | Store exact text, not summaries |
| Memory overflow | Too many stored entries | Relevance decay scoring |
| Stale memory | Outdated information | Timestamp + TTL on entries |
| Privacy leakage | User A sees User B's memory | Strict user_id scoping |
| Lost in retrieval | Relevant memory not surfaced | Hybrid search (vector + keyword) |

## Frequently Asked Questions

**Q: What is AI agent memory?**
A: AI agent memory is the mechanism that allows agents to retain information across interactions — including user preferences, past conversations, and learned knowledge. Unlike stateless LLM calls, agents with memory can maintain context over time.

**Q: What types of memory do AI agents use?**
A: Four main types: (1) Working memory (in-context conversation), (2) Episodic memory (past interaction records, stored in vector DBs), (3) Semantic memory (structured facts and knowledge), (4) Procedural memory (skills and tool definitions in code).

**Q: How does Claude Code handle memory?**
A: Claude Code has four memory layers: CLAUDE.md files (project context), user-level memory files, session context, and the optional `memory` MCP server for cross-session persistence. The memory MCP server stores a knowledge graph that persists across sessions.

**Q: How do I add persistent memory to a Claude API agent?**
A: Use a vector database (Supabase pgvector, Chroma, Pinecone) to store conversation summaries. At the start of each session, retrieve relevant past memories via semantic search and inject them into the system prompt. [See Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-memory)

**Q: What is the difference between agent memory and RAG?**
A: RAG retrieves from a static document corpus. Agent memory stores dynamic, evolving data — past interactions, user preferences, learned facts — and updates in real time as the agent operates.

## Resources

- Build memory-enabled agents with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-memory)
- **AI Agent Prompts Pack** (memory architecture templates, episodic memory patterns, MCP memory setup): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-memory)

## Related

- [AI Agent](ai-agent.md)
- [RAG](rag.md)
- [MCP (Model Context Protocol)](mcp.md)
- [Vector Database](vector-database.md)
- [Multi-Agent System](multi-agent-system.md)
