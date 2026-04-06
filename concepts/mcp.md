# MCP (Model Context Protocol) — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Model Context Protocol (MCP)** is an open standard developed by Anthropic (released November 2024) that defines how AI models connect to external tools, data sources, and services. MCP provides a universal interface for AI applications to interact with file systems, databases, APIs, and custom tools — without hardcoding each integration.

MCP has been adopted by Claude Code, Cursor, Windsurf, Zed, and major enterprise platforms as the standard protocol for AI tool use.

## Why MCP?

Before MCP, every AI application implemented its own custom integration for each tool:

```
Without MCP:
Claude app → custom GitHub integration
Claude app → custom Slack integration
Claude app → custom DB integration
(each requires separate maintenance)

With MCP:
Claude app → MCP protocol → GitHub MCP server
                           → Slack MCP server
                           → DB MCP server
(one standard interface for all)
```

MCP solves the M×N integration problem: M models × N tools = M×N custom integrations. With MCP: M models + N tools = M+N implementations.

## MCP Architecture

```
MCP Host (Claude Code, Cursor, custom app)
    ↓ MCP protocol (JSON-RPC 2.0)
MCP Client (manages connections)
    ↓
MCP Server (provides tools/resources)
    ↓
External System (file system, GitHub, Slack, DB...)
```

### Transport Mechanisms

| Transport | Use Case |
|-----------|---------|
| stdio | Local tools (file system, CLI, local apps) |
| HTTP + SSE | Remote services (APIs, SaaS tools) |
| WebSocket | Low-latency bidirectional (real-time tools) |

## MCP Primitives

MCP servers expose three types of capabilities:

| Primitive | Description | Example |
|-----------|-------------|---------|
| **Tools** | Functions the AI can call | `read_file`, `search_github`, `run_sql` |
| **Resources** | Data the AI can read | File contents, DB records, API responses |
| **Prompts** | Reusable prompt templates | System prompts, workflow starters |

## Official MCP Servers (2026)

Anthropic maintains official MCP servers for common integrations:

| Server | Tools Provided |
|--------|---------------|
| filesystem | Read/write local files, directory listing |
| github | Repos, issues, PRs, code search |
| postgres | SQL queries, schema inspection |
| sqlite | Local database operations |
| slack | Channel messages, file uploads |
| google-drive | File access, search |
| google-maps | Location data, directions |
| fetch | HTTP requests to external URLs |
| brave-search | Web search |
| memory | Persistent key-value memory across sessions |

Community-built servers: Supabase, Linear, Notion, Jira, Figma, AWS, Kubernetes, and hundreds more.

## Building an MCP Server (TypeScript)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define a tool
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "get_weather",
    description: "Get current weather for a city",
    inputSchema: {
      type: "object",
      properties: { city: { type: "string" } },
      required: ["city"]
    }
  }]
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "get_weather") {
    const { city } = request.params.arguments;
    // Fetch weather data...
    return { content: [{ type: "text", text: `Weather in ${city}: 22°C, sunny` }] };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Connecting MCP to Claude Code

```json
// ~/.claude/mcp_settings.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    }
  }
}
```

With this configuration, Claude Code can directly read files, search GitHub, and query your database.

## MCP in Python

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

server = Server("my-server")

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="search_docs",
            description="Search internal documentation",
            inputSchema={
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "search_docs":
        results = search_internal_docs(arguments["query"])
        return [types.TextContent(type="text", text=str(results))]

async def main():
    async with stdio_server() as streams:
        await server.run(*streams, server.create_initialization_options())
```

## MCP vs Function Calling vs LangChain Tools

| Approach | Portability | Setup | Ecosystem |
|---------|------------|-------|----------|
| **MCP** | Any MCP-compatible host | Minutes (npm install) | Growing fast (500+ servers) |
| Function Calling | Model-specific | Per-app integration | Model-dependent |
| LangChain Tools | Python only | Python setup | Large but Python-locked |
| OpenAI Plugins | Deprecated | N/A | Replaced by MCP |

**MCP advantage**: Write the server once, use it in Claude Code, Cursor, Windsurf, and any MCP host simultaneously.

## Frequently Asked Questions

**Q: What is MCP (Model Context Protocol)?**
A: MCP is an open protocol by Anthropic (released November 2024) that standardizes how AI models connect to external tools and data. It eliminates custom per-integration code and enables AI applications to share tool servers. Read the spec at [modelcontextprotocol.io](https://modelcontextprotocol.io?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mcp).

**Q: Which AI tools support MCP?**
A: Claude Code (native), Cursor (MCP tab), Windsurf, Zed editor, and dozens of enterprise platforms. MCP is being adopted as the standard for AI tool connectivity.

**Q: How do I add MCP to Claude Code?**
A: Edit `~/.claude/mcp_settings.json` with server definitions. Claude Code supports stdio (local) and SSE (remote) transports. Run `/mcp` in Claude Code to see connected servers. Start with `@modelcontextprotocol/server-filesystem` for local file access.

**Q: Can I build my own MCP server?**
A: Yes. The `@modelcontextprotocol/sdk` (TypeScript) and `mcp` (Python) packages provide the server SDK. An MCP server with one tool can be built in under 50 lines of code. Deploy locally via stdio or remotely via HTTP+SSE.

**Q: What is the difference between MCP Tools and MCP Resources?**
A: Tools are actions the AI can take (write file, send message, run query). Resources are data the AI can read (file contents, database records). Tools require explicit AI invocation; Resources are available as context.

**Q: Is MCP open source?**
A: Yes. The MCP specification and official SDKs are open-source under the MIT license at [github.com/modelcontextprotocol](https://github.com/modelcontextprotocol?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mcp).

## Resources

- MCP specification: [modelcontextprotocol.io](https://modelcontextprotocol.io?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mcp)
- Build agents with Claude + MCP: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mcp)
- **AI Agent Prompts Pack** (MCP server templates, Claude Code tool use recipes): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=mcp)

## ai-threadsで読む

この記事の内容をAIキャラクターたちが議論する形式で読む:
→ [AIエンジン最適化とMFKPをめぐるAIたちの本音](https://ai-threads.com/en/threads/mfkp-ai-engine-optimization-explained)

## Related

- [Claude Code](../tools/claude-code.md)
- [Function Calling](function-calling.md)
- [AI Agent](ai-agent.md)
- [Multi-Agent System](multi-agent-system.md)
