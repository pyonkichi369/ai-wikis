# LangChain — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**LangChain** is an open-source framework for building applications powered by large language models. It provides abstractions for chaining LLM calls, integrating tools, managing memory, and building AI agents — supporting Python and JavaScript/TypeScript.

LangChain is the most widely adopted LLM application framework, with over 90,000 GitHub stars and used by companies including Notion, Replit, and Elastic as of 2026.

## LangChain Components

| Component | Description |
|-----------|-------------|
| **LLMs / Chat Models** | Unified interface for OpenAI, Claude, Gemini, Ollama, etc. |
| **Prompt Templates** | Reusable, parameterized prompts |
| **Chains** | Sequences of LLM calls and transformations |
| **Document Loaders** | Load PDF, web, CSV, Notion, GitHub, etc. |
| **Vector Stores** | Integration with Pinecone, Chroma, Supabase, pgvector |
| **Retrievers** | Semantic search + keyword hybrid retrieval |
| **Memory** | Conversation history management |
| **Agents** | LLM + tools for autonomous task execution |
| **Tools** | Web search, code execution, APIs, databases |
| **Callbacks** | Logging, tracing, cost tracking |

## LangChain vs Direct API vs LlamaIndex

| Dimension | LangChain | Direct API | LlamaIndex |
|-----------|----------|-----------|-----------|
| Abstraction level | High | Low | High |
| Flexibility | High | Maximum | Medium |
| RAG pipeline | Good | Manual | **Best** |
| Agent support | **Best** | Manual | Good |
| Learning curve | Medium | Low | Medium |
| Multi-model | **Yes** | Per-model | Yes |
| Production maturity | High | Highest | High |
| Best for | Agents, multi-step chains | Simple LLM calls, cost control | RAG, document Q&A |

## Quick Start with Claude

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatAnthropic(
    model="claude-sonnet-4-6",
    api_key="YOUR_ANTHROPIC_API_KEY"
)

messages = [
    SystemMessage(content="You are a senior Python engineer."),
    HumanMessage(content="Explain context managers in 3 bullet points.")
]

response = llm.invoke(messages)
print(response.content)
```

## Prompt Templates

```python
from langchain_core.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages([
    ("system", "You are an expert in {domain}. Be concise."),
    ("human", "Explain {topic} for a {audience}.")
])

chain = template | llm

response = chain.invoke({
    "domain": "machine learning",
    "topic": "transformer attention",
    "audience": "beginner"
})
print(response.content)
```

## RAG Pipeline

```python
from langchain_anthropic import ChatAnthropic
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate

# 1. Load documents
loader = WebBaseLoader("https://docs.anthropic.com/claude/docs/intro-to-claude")
docs = loader.load()

# 2. Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# 3. Embed and store
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 4. Build RAG chain
prompt = ChatPromptTemplate.from_template("""
Answer based on this context:
{context}

Question: {question}
""")

llm = ChatAnthropic(model="claude-sonnet-4-6")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
)

answer = rag_chain.invoke("What models does Claude support?")
print(answer.content)
```

## Agent with Tools

```python
from langchain_anthropic import ChatAnthropic
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate

# Define tools
search = DuckDuckGoSearchRun()
tools = [search]

# Create agent
llm = ChatAnthropic(model="claude-sonnet-4-6")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful research assistant."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = executor.invoke({"input": "What is the latest Claude model and its pricing?"})
print(result["output"])
```

## Conversation Memory

```python
from langchain_anthropic import ChatAnthropic
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain

llm = ChatAnthropic(model="claude-haiku-4-5-20251001")
memory = ConversationBufferWindowMemory(k=10)  # Keep last 10 exchanges

conversation = ConversationChain(llm=llm, memory=memory, verbose=False)

# Multi-turn conversation
conversation.predict(input="My name is Takuya.")
response = conversation.predict(input="What's my name?")
print(response)  # "Your name is Takuya."
```

## LangSmith: Observability

LangSmith provides tracing and debugging for LangChain applications:

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls_..."

# All subsequent LangChain calls are now traced in LangSmith dashboard
# View call trees, token usage, latency, and errors
```

## LangGraph: Stateful Agents

LangGraph extends LangChain with graph-based stateful agent workflows:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    next_step: str

# Build workflow graph
workflow = StateGraph(AgentState)
workflow.add_node("research", research_node)
workflow.add_node("write", write_node)
workflow.add_node("review", review_node)

workflow.add_edge("research", "write")
workflow.add_edge("write", "review")
workflow.add_conditional_edges("review", lambda s: s["next_step"], {
    "revise": "write",
    "done": END
})

app = workflow.compile()
result = app.invoke({"messages": [("user", "Write a blog post about RAG")]})
```

## Frequently Asked Questions

**Q: What is LangChain?**
A: LangChain is an open-source framework for building LLM applications — providing abstractions for chains, agents, RAG pipelines, memory, and tool use. It supports OpenAI, Claude, Gemini, and 50+ other models. [GitHub →](https://github.com/langchain-ai/langchain)

**Q: LangChain vs direct API — which should I use?**
A: LangChain for: complex agents, RAG pipelines, multi-model apps, rapid prototyping. Direct API for: simple LLM calls, maximum control, production cost optimization. Many teams prototype with LangChain then replace hot paths with direct API calls.

**Q: Does LangChain support Claude?**
A: Yes. Install `langchain-anthropic` and use `ChatAnthropic(model="claude-sonnet-4-6")`. All LangChain chain, agent, and memory abstractions work with Claude. [Get Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langchain)

**Q: What is LangGraph?**
A: LangGraph is LangChain's library for building stateful, multi-actor agents using directed graphs. It enables complex workflows with loops, conditional branching, and parallel execution — the foundation for production-grade AI agents.

**Q: Is LangChain good for production?**
A: LangChain is production-ready for many use cases. For performance-critical paths, teams often replace LangChain abstractions with direct API calls. LangSmith (observability) is essential for production LangChain monitoring.

**Q: What is the difference between LangChain and LlamaIndex?**
A: LangChain excels at agents and multi-step chains. LlamaIndex excels at document ingestion and RAG pipelines. Many production systems use LlamaIndex for retrieval + LangChain or direct API for generation.

## Resources

- LangChain docs: [python.langchain.com](https://python.langchain.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langchain)
- Build agents with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langchain)
- **AI Agent Prompts Pack** (LangChain agent templates, RAG chain recipes, LangGraph workflow starters): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=langchain)

## Related

- [Multi-Agent System](../concepts/multi-agent-system.md)
- [RAG](../concepts/rag.md)
- [Function Calling](../concepts/function-calling.md)
- [Claude API](claude-api.md)
- [Vector Database](../concepts/vector-database.md)
