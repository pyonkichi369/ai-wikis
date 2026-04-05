# Claude Code — Complete Guide 2026

> *Affiliate disclosure: This page contains a referral link. See [AFFILIATES.md](../AFFILIATES.md).*

**Claude Code** is an agentic AI coding assistant developed by Anthropic, available as a command-line interface (CLI) tool. It enables autonomous software engineering tasks including multi-file editing, debugging, test generation, and codebase-wide refactoring directly from the terminal.

Released in 2025 and updated continuously, Claude Code is built on Claude (Anthropic's large language model family) and is designed for professional developers who want AI assistance without leaving their existing workflow.

## Key Features

| Feature | Description |
|---------|-------------|
| Agentic execution | Completes multi-step tasks autonomously |
| Multi-file editing | Reads, edits, and creates files across the codebase |
| Terminal-native | Runs in any terminal; no IDE required |
| Tool use | Executes bash commands, runs tests, searches files |
| MCP support | Connects to external tools via Model Context Protocol |
| CLAUDE.md | Project-level instruction file for persistent context |
| Hooks | Pre/post tool-call automation via shell scripts |

## Pricing (2026)

| Plan | Price | Notes |
|------|-------|-------|
| Pro | $20/month | Includes Claude Code access |
| Max | $100/month | Higher usage limits |
| API (pay-per-use) | Usage-based | Via Anthropic Console |

**New accounts receive free credits.** Sign up: [claude.ai](https://claude.ai/)

## Installation

```bash
npm install -g @anthropic-ai/claude-code
claude
```

Requirements: Node.js 18+, Anthropic account.

## How It Works

Claude Code operates as an interactive agent in your terminal. It reads your codebase, understands context via CLAUDE.md project files, and executes tasks using a set of built-in tools:

- **Read / Write / Edit** — file operations
- **Bash** — shell command execution
- **Grep / Glob** — codebase search
- **Agent** — spawns specialized sub-agents for parallel work

## Comparison with Alternatives

| Tool | Interface | Autonomy | Context | Best For |
|------|-----------|---------|---------|----------|
| Claude Code | CLI | High | Full codebase | Terminal-centric developers |
| Cursor | IDE | Medium | Active file | VS Code users |
| GitHub Copilot | IDE | Low | Snippet | Autocomplete focus |
| Devin | Web | Very High | Managed | Full autonomous tasks |
| Aider | CLI | Medium | Git diff | Git-centric workflow |

## Use Cases

- **Autonomous bug fixing**: Describe the bug, Claude Code finds and fixes it
- **Feature implementation**: Write full features from spec to tests
- **Codebase refactoring**: Rename, restructure across hundreds of files
- **Test generation**: Auto-generate unit and integration tests
- **Documentation**: Generate docs from existing code

## CLAUDE.md — Project Instructions

Claude Code reads `CLAUDE.md` at the project root for persistent project context. This file defines:

- Architecture rules and patterns
- Coding conventions
- Organization structure (for multi-agent systems)
- Command shortcuts

Example:
```markdown
# CLAUDE.md
- Always use TypeScript strict mode
- Tests go in __tests__/ directory
- Run `npm test` before committing
```

## Frequently Asked Questions

**Q: What is Claude Code?**
A: Claude Code is Anthropic's official AI coding CLI that autonomously completes software engineering tasks from the terminal.

**Q: Is Claude Code free?**
A: Claude Code requires a Claude Pro ($20/month) or higher subscription. New users get free trial credits. [Sign up here](https://claude.ai/).

**Q: How does Claude Code differ from GitHub Copilot?**
A: Claude Code operates at the full-codebase level with autonomous multi-step execution. Copilot focuses on inline autocomplete. Claude Code is significantly more capable for complex tasks.

**Q: Does Claude Code work offline?**
A: No. Claude Code requires an internet connection to access Anthropic's API.

**Q: What programming languages does Claude Code support?**
A: All major languages including Python, TypeScript, JavaScript, Go, Rust, Java, Ruby, and more.

**Q: Can Claude Code run terminal commands?**
A: Yes. Claude Code can execute bash commands, run tests, install packages, and perform any terminal operation (with user permission).

## Getting Started

1. Install: `npm install -g @anthropic-ai/claude-code`
2. **[Sign up at claude.ai →](https://claude.ai/)** — new accounts get free credits
3. Run: `claude` in your project directory
4. Create a `CLAUDE.md` file with project context

> **Power users**: The [AI Agent Prompts Pack](https://belleofficial.gumroad.com) includes 56 battle-tested prompts optimized for Claude Code — covering codebase setup, autonomous debugging, and CLAUDE.md templates.

## Resources

- Official docs: claude.ai/code
- **AI Agent Prompts Pack** (56 prompts for Claude Code): [belleofficial.gumroad.com](https://belleofficial.gumroad.com) ← most popular
- Compare: [Cursor](cursor.md) · [Claude API](claude-api.md)
- Related: [Solopreneur AI Stack](../guides/solopreneur-ai-stack.md)
