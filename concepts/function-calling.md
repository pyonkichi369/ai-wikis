# Function Calling (Tool Use) — Complete Guide 2026

**Function calling** (also called **tool use**) is a capability of large language models (LLMs) that allows the model to invoke developer-defined functions as part of generating a response. Instead of producing text only, the LLM can decide to call a function — such as a web search, database query, or API call — and incorporate the returned data into its answer.

Function calling is the core mechanism that transforms a static LLM into an AI agent capable of taking actions in the real world.

## How Function Calling Works

```
1. Developer defines functions with name, description, and parameter schema
2. User sends query to LLM
3. LLM decides: "I need to call function X with args Y"
4. LLM returns structured function call request (not a text response)
5. Developer executes the function and returns result to LLM
6. LLM uses result to generate final answer
```

```python
# Step 1: Define function schema
tools = [{
    "name": "web_search",
    "description": "Search the web for current information",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query"}
        },
        "required": ["query"]
    }
}]

# Step 2: LLM decides to call the function
response = client.messages.create(
    model="claude-sonnet-4-6",
    tools=tools,
    messages=[{"role": "user", "content": "What is today's Bitcoin price?"}]
)
# response.stop_reason == "tool_use"
# response contains: {"name": "web_search", "input": {"query": "Bitcoin price today"}}

# Step 3: Execute function and return result
search_result = web_search(response.tool_use.input["query"])

# Step 4: LLM generates final answer using result
final_response = client.messages.create(
    model="claude-sonnet-4-6",
    tools=tools,
    messages=[
        {"role": "user", "content": "What is today's Bitcoin price?"},
        {"role": "assistant", "content": response.content},
        {"role": "user", "content": [{"type": "tool_result", "content": search_result}]}
    ]
)
```

## Function Calling vs Tool Use: Terminology

| Term | Provider | Meaning |
|------|---------|---------|
| Function calling | OpenAI | Model invokes developer-defined functions |
| Tool use | Anthropic (Claude) | Model uses tools (equivalent concept) |
| Tool calling | Generic | Either of the above |

These terms are functionally equivalent. OpenAI introduced "function calling" in 2023; Anthropic uses "tool use" in Claude's API. Both enable the same pattern.

## Claude Tool Use (Anthropic)

```python
import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_stock_price",
        "description": "Retrieves the current stock price for a given ticker symbol",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "Stock ticker symbol (e.g., AAPL, GOOGL)"
                }
            },
            "required": ["ticker"]
        }
    }
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What is Apple's current stock price?"}]
)

if response.stop_reason == "tool_use":
    tool_call = next(b for b in response.content if b.type == "tool_use")
    print(f"Calling: {tool_call.name}({tool_call.input})")
```

## Common Tool Patterns

| Tool Type | Description | Use Case |
|-----------|-------------|---------|
| Web search | Query live search results | Real-time information |
| Code execution | Run Python/JS in sandbox | Data analysis, calculations |
| Database query | Execute SQL or NoSQL queries | Application data retrieval |
| File operations | Read/write files | Document processing |
| API calls | External service integration | CRM, calendar, payments |
| Calculator | Precise arithmetic | Avoid LLM math errors |
| Browser control | Navigate web pages | Web scraping, automation |

## Multi-Tool Agents

In agentic systems, the LLM can call multiple tools in sequence or in parallel:

```
User: "Research competitor pricing and create a comparison table"

Agent:
→ web_search("competitor A pricing 2026")
→ web_search("competitor B pricing 2026")  
→ web_search("competitor C pricing 2026")
→ create_spreadsheet(data=all_results)
→ Returns: formatted comparison table
```

Claude supports **parallel tool use**: multiple tool calls in a single response, reducing latency for independent operations.

## Tool Use Best Practices

1. **Write precise descriptions** — The LLM decides which tool to call based on the description. Be specific about what the tool does, its limitations, and when to use it.

2. **Define strict input schemas** — Use `required` fields and type constraints to prevent invalid function calls.

3. **Return structured data** — Tool results should be structured (JSON > plain text) for reliable LLM parsing.

4. **Handle errors gracefully** — Return error messages as tool results so the LLM can adapt.

5. **Limit tool count** — More than 10-15 tools degrades decision quality. Group related operations.

## Frequently Asked Questions

**Q: What is function calling in AI?**
A: Function calling is an LLM capability that lets the model invoke developer-defined functions (web search, database queries, API calls) to gather real-world data before generating a response.

**Q: What is the difference between function calling and tool use?**
A: They are the same concept. OpenAI uses "function calling"; Anthropic uses "tool use" in Claude's API. Both enable LLMs to call external functions.

**Q: Which models support function calling?**
A: Claude Sonnet/Opus/Haiku (Anthropic), GPT-4o/GPT-4o-mini (OpenAI), Gemini 1.5 Pro (Google), and most major LLMs released in 2024+.

**Q: Can Claude call multiple tools at once?**
A: Yes. Claude supports parallel tool use — calling multiple tools simultaneously in a single response when the calls are independent, reducing total latency.

**Q: What is the difference between function calling and RAG?**
A: RAG retrieves documents from a knowledge base using vector similarity. Function calling executes arbitrary functions (web search, code, APIs). RAG is typically implemented as a tool in function calling systems.

**Q: How do I prevent the LLM from calling the wrong tool?**
A: Write clear, distinct descriptions for each tool. Use `description` fields to specify when NOT to use a tool. Provide examples in system prompts.

## Resources

- Build tool-use agents with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=function-calling)
- **AI Agent Prompts Pack** (56 prompts including tool-use patterns, multi-tool orchestration): [belleofficial.gumroad.com](https://belleofficial.gumroad.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=function-calling)

## Related

- [AI Agent](ai-agent.md)
- [Claude API](../tools/claude-api.md)
- [RAG](rag.md)
- [Prompt Engineering](prompt-engineering.md)
