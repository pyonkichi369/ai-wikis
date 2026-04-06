# AI Agent Tools — Function Calling and Tool Use 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI agent tools (also called function calling or tool use) are structured interfaces that allow LLMs to invoke external functions, APIs, and services — enabling agents to retrieve real-time data, execute code, search the web, read files, and take actions beyond text generation.**

## How Tool Use Works

The model does not execute tools itself. It produces a structured request for a tool call, and the application layer executes the function and returns results.

```
User message
     ↓
LLM decides whether a tool call is needed
     ↓
LLM outputs structured tool_use block (name + input parameters)
     ↓
Application executes the function
     ↓
Result returned to LLM as tool_result
     ↓
LLM continues generating based on result
```

This loop can repeat multiple times in a single conversation turn (multi-step tool use).

## Tool Definition Schema (JSON)

```json
{
  "name": "get_stock_price",
  "description": "Retrieve the current stock price for a given ticker symbol. Use this when the user asks about stock prices or market data.",
  "input_schema": {
    "type": "object",
    "properties": {
      "ticker": {
        "type": "string",
        "description": "Stock ticker symbol, e.g. AAPL, MSFT"
      },
      "currency": {
        "type": "string",
        "enum": ["USD", "EUR", "JPY"],
        "description": "Currency for the price. Defaults to USD."
      }
    },
    "required": ["ticker"]
  }
}
```

The description field is critical — the LLM reads it to decide when and whether to call the tool.

## Claude Tool Use Example

```python
import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_web",
        "description": "Search the web for current information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    }
]

def search_web(query: str) -> str:
    # Your actual search implementation here
    return f"Search results for: {query}"

messages = [{"role": "user", "content": "What AI models were released in Q1 2026?"}]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

# Process tool calls
while response.stop_reason == "tool_use":
    tool_results = []
    for block in response.content:
        if block.type == "tool_use":
            result = search_web(**block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result
            })

    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": tool_results})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )

print(response.content[0].text)
```

## Tool Calling Syntax: Claude vs OpenAI vs Gemini

| Feature | Claude (Anthropic) | OpenAI | Gemini (Google) |
|---------|-------------------|--------|-----------------|
| Parameter name | `tools` | `tools` | `tools` |
| Schema format | `input_schema` (JSON Schema) | `parameters` (JSON Schema) | `parameters` (JSON Schema) |
| Tool result field | `tool_result` block | `tool` role message | `functionResponse` part |
| Parallel tool calls | Yes | Yes | Yes |
| Forced tool use | `tool_choice: {"type": "tool", "name": "..."}` | `tool_choice: {"type": "function", "function": {"name": "..."}}` | `tool_config` |
| Stop reason | `tool_use` | `tool_calls` | `STOP` with functionCall |
| Max tools per request | No documented limit | 128 | 64 |
| Streaming tool use | Yes | Yes | Yes |

## Built-in Tool Categories

Modern AI platforms provide built-in tools that do not require external implementation:

| Category | Examples | Use Cases |
|----------|----------|-----------|
| Web search | Bing Search, Brave, Tavily | Real-time information, news, research |
| Code execution | Python sandbox, Jupyter | Data analysis, math, chart generation |
| File access | Read/write files, PDF parse | Document processing, report generation |
| Database | SQL queries, vector search | Structured data retrieval |
| Computer use | Screenshot, click, type | Browser automation, UI testing |
| Image generation | DALL-E, Stable Diffusion | Visual content creation |
| Communication | Email, calendar, Slack | Workflow automation |

## Parallel Tool Calls

LLMs can issue multiple tool calls simultaneously when operations are independent:

```python
# LLM may return multiple tool_use blocks in one response
for block in response.content:
    if block.type == "tool_use":
        # Execute all tools in parallel using asyncio or threading
        results.append(execute_tool(block.name, block.input))
```

Always check whether the LLM returned multiple tool_use blocks and execute them concurrently to reduce latency.

## Tool Design Best Practices

| Practice | Rationale |
|----------|-----------|
| Write descriptions as imperative sentences | Models parse descriptions to route calls; vague descriptions cause missed or incorrect calls |
| Keep tool scope narrow | One tool per concern reduces ambiguous routing |
| Return structured JSON from tools | Structured results are easier for LLMs to parse than prose |
| Include error states in return values | Return `{"error": "not_found"}` rather than raising exceptions when possible |
| Validate inputs before execution | LLMs can produce syntactically correct but semantically invalid parameters |
| Document edge cases in description | State what the tool does NOT handle explicitly |

## Error Handling

```python
def execute_tool(name: str, inputs: dict) -> str:
    try:
        if name == "get_stock_price":
            return json.dumps(get_stock_price(**inputs))
        elif name == "search_web":
            return search_web(**inputs)
        else:
            return json.dumps({"error": f"Unknown tool: {name}"})
    except KeyError as e:
        return json.dumps({"error": f"Missing parameter: {e}"})
    except Exception as e:
        return json.dumps({"error": str(e), "type": type(e).__name__})
```

Always return a string from tool functions. Pass errors back to the LLM as tool_result content — the model can then inform the user or try an alternative approach.

## Getting Started

Claude API with tool use support: [claude.ai/referral](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-agents-tools)

Practical AI agent implementation guide: [AI Tools Solopreneur Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-agents-tools)

## FAQ

**Q: What is the difference between function calling and tool use?**
A: The terms are used interchangeably. OpenAI introduced the term "function calling" in 2023; Anthropic uses "tool use." Both describe the same mechanism: the LLM produces a structured JSON output containing a function name and arguments, the application executes the corresponding code, and the result is returned to the LLM. Some providers (OpenAI) also offer "built-in tools" (web search, code interpreter) that are managed server-side without developer implementation.

**Q: Does the LLM actually run the code when it calls a tool?**
A: No. The LLM produces a structured request indicating which tool to call and with what parameters. The application developer is responsible for implementing the execution logic. The LLM never directly executes code, queries databases, or makes HTTP calls. This separation is intentional — it gives developers full control over what actions their application can take and allows for authorization checks, rate limiting, and logging before execution.

**Q: How many tools can I give to an LLM at once?**
A: Current limits vary by provider. Claude supports hundreds of tools in a single request, though performance degrades as the tool list grows because all tool definitions consume input tokens. A practical guideline is to include 10–20 highly relevant tools rather than providing all possible tools. For larger tool sets, use a tool router to dynamically select relevant tools based on the user's query before sending the request to the LLM.

**Q: What is a tool router and when should I use one?**
A: A tool router is a lightweight model or embedding-based retrieval system that selects the most relevant tools from a large catalog before passing them to the main LLM. For example, with 200 possible tools, you might use a fast embedding search to find the 15 most semantically relevant tools for a given user message, then pass only those to Claude. This reduces token costs, improves routing accuracy, and avoids hitting context limits with large tool definitions.

**Q: Can tools call other tools or LLMs recursively?**
A: Yes. An agentic architecture can have tools that themselves invoke LLM calls, spawn sub-agents, or call other tools — creating a tree of execution. Frameworks like LangGraph, AutoGen, and Claude's native multi-step tool use support this pattern. The application must implement cycle detection and depth limits to prevent infinite loops, and set a maximum number of tool call iterations (typically 10–50 depending on task complexity).
