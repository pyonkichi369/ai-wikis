# Claude Code Setup Guide — Complete Tutorial 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Claude Code** is Anthropic's terminal-based AI coding assistant that can autonomously read, write, and execute code across entire codebases. This guide covers complete setup from installation to advanced configuration for maximum productivity.

Start here: [claude.ai/code](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-code-setup)

## Prerequisites

- Node.js 18+ installed
- An Anthropic account (Claude Pro or Max subscription required)
- macOS, Linux, or Windows (WSL)

## Installation

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Launch Claude Code
claude
```

On first launch, Claude Code will open a browser window for authentication with your Anthropic account.

## Subscription Requirements

| Plan | Claude Code Access | Cost |
|------|-------------------|------|
| Claude Pro | Yes | $20/month |
| Claude Max (5x) | Yes + higher limits | $100/month |
| Claude Max (20x) | Yes + highest limits | $200/month |
| API (pay-per-use) | Yes | Per token |

[Get Claude Pro →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-code-setup)

## First Session

```bash
# Navigate to your project
cd ~/my-project

# Start Claude Code
claude

# Or start with a task immediately
claude "explain this codebase and identify any bugs"
```

Claude Code automatically reads your project files, understands the structure, and can make targeted edits without you specifying file paths.

## Key Commands

### Slash Commands

| Command | Action |
|---------|--------|
| `/help` | Show all available commands |
| `/clear` | Clear conversation context |
| `/compact` | Compress context to free tokens |
| `/model` | Switch between Claude models |
| `/cost` | Show token usage and cost |
| `/doctor` | Diagnose configuration issues |
| `/init` | Create CLAUDE.md for project context |
| `/permissions` | View and modify tool permissions |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current operation |
| `Ctrl+L` | Clear screen |
| `↑` / `↓` | Navigate command history |
| `Esc` | Exit current input |

## CLAUDE.md — Project Context File

Create a `CLAUDE.md` in your project root to give Claude persistent context:

```markdown
# Project Context

## Stack
- Next.js 15, TypeScript, Tailwind CSS
- Supabase (PostgreSQL + pgvector)
- Deployed on Vercel

## Conventions
- Use functional components only
- TypeScript strict mode
- No `any` types — use proper interfaces
- Tests in `__tests__/` using Vitest

## Key Files
- `lib/supabase.ts` — Supabase client
- `components/` — Reusable UI components
- `app/api/` — Next.js API routes

## Important Notes
- Never commit `.env.local`
- RLS must be enabled on all new tables
- Run `npm run typecheck` before committing
```

Claude reads this file automatically at the start of every session.

## MCP (Model Context Protocol) Setup

Connect Claude Code to external tools via MCP:

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
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://..." }
    }
  }
}
```

After adding MCP servers, restart Claude Code. Type `/mcp` to verify connections.

## Permission Modes

Claude Code has three permission levels:

| Mode | What It Does | When to Use |
|------|-------------|------------|
| Default | Asks for approval on writes/executions | Day-to-day development |
| `--dangerously-skip-permissions` | No approval prompts | Trusted automation |
| Plan mode | Shows plan before executing | Complex refactoring |

```bash
# Start with auto-approval (use carefully)
claude --dangerously-skip-permissions "refactor the auth module"
```

## Effective Prompting Patterns

### Task-Specific Prompts

```bash
# Bug fix with context
claude "Fix the TypeError in src/api/auth.ts:47 — user.id is undefined when OAuth callback fires"

# Feature implementation
claude "Add rate limiting to /api/generate — 10 requests per minute per IP using Redis"

# Code review
claude "Review the changes in my last commit. Flag security issues and performance problems."

# Refactoring
claude "Refactor components/UserTable.tsx to use React Query instead of useEffect+fetch"
```

### Project-Wide Operations

```bash
# Analyze entire codebase
claude "Map all API endpoints and identify which ones lack authentication middleware"

# Dependency audit
claude "Check all npm packages for security vulnerabilities and suggest safe upgrade paths"

# Test generation
claude "Write Vitest unit tests for all functions in lib/utils.ts — aim for 100% coverage"
```

## Claude Code vs Cursor vs Windsurf

| Dimension | Claude Code | Cursor | Windsurf |
|-----------|------------|--------|---------|
| Interface | Terminal CLI | VS Code IDE | VS Code fork + 40 IDEs |
| Autonomy | **High** | Medium | High |
| Context | Full codebase | 200K tokens | 100K tokens |
| Multi-file | **Unlimited** | 5-8 files | 3-4 files |
| Terminal | **Native** | No | Via Cascade |
| IDE plugins | Any terminal | VS Code | 40+ IDEs |
| Price | $20/month | $20/month | $15/month |
| Best for | DevOps, large codebases, CLI | Frontend, React, VS Code | JetBrains, low cost |

## Advanced: Headless Mode for Automation

```bash
# Use Claude Code in CI/CD pipelines
claude --print "Generate a test report for the changes in this PR" --no-interactive

# Pipe output to files
claude --print "Summarize the API changes" > pr-description.md

# Use with git hooks
# .git/hooks/pre-commit
claude --print "Review this diff for security issues" < <(git diff --cached)
```

## Frequently Asked Questions

**Q: How do I install Claude Code?**
A: Run `npm install -g @anthropic-ai/claude-code`, then `claude` to launch. Requires Node.js 18+ and a Claude Pro subscription ($20/month). [Sign up →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-code-setup)

**Q: What subscription do I need for Claude Code?**
A: Claude Pro ($20/month) or higher. Claude Code uses your Pro subscription's compute — no separate billing. Enterprise customers can use API tokens instead.

**Q: How do I give Claude Code context about my project?**
A: Create a `CLAUDE.md` file in your project root. Claude reads it automatically at session start. Include: stack/tech, conventions, key files, and important constraints.

**Q: Can Claude Code run terminal commands?**
A: Yes. Claude Code can execute bash commands with your approval. It will explain what each command does before running. This enables automated testing, git operations, package installs, and deployments.

**Q: How does Claude Code compare to Cursor?**
A: Claude Code is better for: terminal-native workflows, large codebases, DevOps/infrastructure, and unlimited multi-file edits. Cursor is better for: VS Code users, frontend development, and users who prefer GUI-based AI assistance.

**Q: How do I keep Claude Code cost under control?**
A: Use `/compact` to compress context when switching tasks. Use `/cost` to monitor usage. Use Haiku model for simple lookups (`/model claude-haiku`). Claude Pro's $20/month includes generous usage limits.

## Resources

- Get Claude Code: [claude.ai/code](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-code-setup)
- **AI Agent Prompts Pack** (56 Claude Code prompts: CLAUDE.md templates, slash commands, CI/CD recipes): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=claude-code-setup)
- MCP protocol: [mcp.md](../concepts/mcp.md)

## ai-threadsで読む

Claude Code・Cursor・WindsurfをめぐるAIキャラクターたちの本音議論:
→ [AIコーディングツール、本当に使えるのか — AIたちの議論](https://ai-threads.com/ja/threads/claude-code-vs-cursor-ai-debate)

## Related

- [Claude Code](../tools/claude-code.md)
- [MCP (Model Context Protocol)](../concepts/mcp.md)
- [Cursor](../tools/cursor.md)
- [Windsurf](../tools/windsurf.md)
