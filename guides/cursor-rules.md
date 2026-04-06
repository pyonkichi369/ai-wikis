# Cursor Rules (.cursorrules) — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Cursor Rules (`.cursorrules` file in project root, or `.cursor/rules/*.mdc` in Cursor v0.45+) are project-level instructions that persistently configure Cursor AI's behavior, coding style, and constraints — similar to how `CLAUDE.md` works for Claude Code.**

Every time Cursor opens a project, it reads the rules file and injects its contents into every AI request as a persistent system prompt. This means the AI consistently applies your stack conventions, naming patterns, and constraints without requiring you to repeat them in each chat.

## How Cursor Rules Work

When Cursor starts a session in your project, it:

1. Reads `.cursorrules` from the project root (or `.cursor/rules/` directory)
2. Injects the content as a persistent system prompt for all AI interactions
3. Applies the rules to Chat, Composer, and Agent mode equally
4. Respects the rules until the session ends or the file changes

The rules file is plain text (Markdown is supported). There is no special syntax required — write instructions as you would give them to a developer joining your team.

## File Location and Format

| Cursor Version | File Location | Format |
|---------------|--------------|--------|
| v0.x (legacy) | `.cursorrules` in project root | Plain text / Markdown |
| v0.45+ (current) | `.cursor/rules/*.mdc` or `.cursorrules` | MDC (Markdown with metadata) |
| Both supported | `.cursorrules` still works in v0.45+ | Plain text |

The `.cursorrules` format remains the most widely adopted and is recommended for portability. The newer `.cursor/rules/` directory allows multiple rule files and can target specific file patterns.

## Effective .cursorrules Structure

```markdown
# Project Context
This is a Next.js 15 app with TypeScript, Tailwind CSS, Supabase.
Backend is Supabase Edge Functions (Deno). No Express or custom server.

## Rules
- Always use TypeScript strict mode — never use `any` type
- Use functional components only — no class components
- All state management via React hooks (useState, useReducer, Zustand)
- Use Tailwind classes only — no custom CSS files or inline styles
- Tests in __tests__/ with Vitest and React Testing Library
- Imports: absolute paths via `@/` alias, never relative `../../`
- Error handling: always use typed error boundaries and try/catch

## File Structure
- app/           — Next.js App Router pages and layouts
- components/    — Reusable UI components (atomic design)
- lib/           — Utilities, Supabase client, helpers
- hooks/         — Custom React hooks
- types/         — Shared TypeScript type definitions
- __tests__/     — Unit and integration tests

## Conventions
- Component files: PascalCase (e.g., UserCard.tsx)
- Utility files: camelCase (e.g., formatDate.ts)
- API routes: kebab-case (e.g., /api/user-profile)
- Database columns: snake_case (mirrors Supabase)
- Environment variables: SCREAMING_SNAKE_CASE, always via process.env

## Do Not
- Do not suggest `npm install` without checking package.json first
- Do not use `pages/` router — this project uses App Router only
- Do not hardcode API keys or secrets — use environment variables
```

## Real-World Examples by Stack

### React / Next.js

```markdown
# Stack
Next.js 15, TypeScript 5, Tailwind CSS 3, shadcn/ui, Prisma, PostgreSQL

## Rules
- Server Components by default; add "use client" only when required
- Use shadcn/ui components from @/components/ui — never rebuild existing components
- Prisma ORM for all DB access — raw SQL only for performance-critical queries
- All forms use react-hook-form + zod validation
- API responses follow { data, error } envelope pattern
```

### Python / FastAPI

```markdown
# Stack
Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL, Alembic

## Rules
- All endpoint functions are async — no sync route handlers
- Pydantic models for all request/response shapes — no raw dicts in signatures
- SQLAlchemy async sessions only — use `async with get_db() as db`
- Migrations via Alembic — never modify tables manually
- Type annotations required on all functions and class attributes
- Tests in tests/ with pytest-asyncio — minimum 80% coverage
```

### Go

```markdown
# Stack
Go 1.22, Chi router, sqlc, PostgreSQL, Docker

## Rules
- Error handling: always check and wrap errors with fmt.Errorf("context: %w", err)
- No global state — pass dependencies via context or constructor injection
- All DB queries through sqlc-generated code in internal/db/
- HTTP handlers return (http.Handler) not http.HandlerFunc where possible
- Table-driven tests for all pure functions
- Struct fields exported only when needed outside the package
```

## .cursorrules vs CLAUDE.md vs GitHub Copilot Instructions

| Dimension | .cursorrules | CLAUDE.md | GitHub Copilot Instructions |
|-----------|-------------|-----------|----------------------------|
| Tool | Cursor IDE | Claude Code (CLI) | GitHub Copilot in VS Code |
| Scope | Project-level | Project-level | Repo-level |
| Injection | Every AI request | Every Claude session | Every Copilot request |
| Format | Plain text / MDC | Markdown | Markdown |
| Version control | Yes (committed) | Yes (committed) | Yes (`.github/copilot-instructions.md`) |
| Multi-file rules | v0.45+ `.cursor/rules/` | Not native | Not native |
| Agent mode | Yes (Cursor Agent) | Yes (Claude Code) | Limited (Copilot Workspace) |
| Supports code blocks | Yes | Yes | Yes |

## Best Practices

**Be specific, not vague.** "Use TypeScript" is weaker than "All functions must have explicit return types. Never use `any`. Use `unknown` for untyped external data."

**Include your tech stack versions.** "React 18 hooks only, no class components" is more actionable than "use React."

**Define what NOT to do.** Negative constraints ("never use `useEffect` for data fetching — use React Query") are as useful as positive rules.

**Document your file structure.** The AI makes better decisions about where to create or modify files when it understands the intended layout.

**Keep it under 200 lines.** Rules files that grow very large lose signal-to-noise ratio. Split into focused sections if needed.

**Commit it to version control.** The `.cursorrules` file should be committed alongside your code so the whole team benefits and rules evolve with the project.

## Community Resources

- **cursor.directory** — Community-contributed `.cursorrules` files organized by stack (Next.js, Python, Go, React Native, etc.)
- **awesome-cursorrules** (GitHub) — Curated list of high-quality rules files for common frameworks
- Both sites let you copy a starting template and customize for your project

## Frequently Asked Questions

**Q: What is .cursorrules?**
A: `.cursorrules` is a plain-text file placed in your project root that gives Cursor AI persistent, project-level instructions. Everything in the file is injected as a system prompt into every AI request — Chat, Composer, and Agent mode included. It functions like a standing brief for the AI: your tech stack, naming conventions, forbidden patterns, and file structure. Without it, Cursor has no awareness of your project's specific conventions and may suggest code that doesn't fit your codebase.

**Q: Where do I put the .cursorrules file?**
A: Place `.cursorrules` in the root of your project directory (same level as `package.json` or `pyproject.toml`). Cursor automatically detects it when opening the project folder. In Cursor v0.45+, you can also use `.cursor/rules/` directory with `.mdc` files to apply different rules to different file patterns — but the single `.cursorrules` file in the root continues to work and is the most portable option.

**Q: Cursor Rules vs CLAUDE.md — what is the difference?**
A: Both serve the same purpose — persistent project-level AI instructions — but for different tools. `.cursorrules` configures Cursor IDE (VS Code-based AI editor). `CLAUDE.md` configures Claude Code (Anthropic's CLI tool). The format is nearly identical: plain Markdown with instructions, stack context, and conventions. If you use both tools on the same project, maintain both files. The content can largely be the same, though Claude Code's `CLAUDE.md` supports additional Claude-specific directives like slash commands and memory references.

**Q: What should I put in my .cursorrules?**
A: At minimum: your tech stack and versions, file structure, naming conventions, and a short list of "never do" constraints. Effective additions include: preferred libraries for common tasks (e.g., "use Zod for validation, not Yup"), error handling patterns, test framework and location, import path conventions, and any security rules (e.g., "never log user PII"). Avoid writing a book — 50-150 lines of focused, actionable rules outperforms 500 lines of vague guidance.

**Q: Do cursorrules work with Cursor Agent?**
A: Yes. Cursor Agent (the autonomous multi-step coding mode) respects `.cursorrules` exactly like Chat and Composer. The rules are injected into every step the agent takes. This is especially important for Agent mode because it makes more autonomous decisions — without rules, it may create files in wrong locations, use incorrect patterns, or install packages you don't want.

## Resources

- Cursor documentation: [docs.cursor.com](https://docs.cursor.com)
- Community rules: [cursor.directory](https://cursor.directory)
- Build AI coding assistants with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=cursor-rules)
- **AI Agent Prompts Pack** (AI coding assistant prompts, rules file templates, Claude Code CLAUDE.md starters): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=cursor-rules)

## Related

- [Cursor](../tools/cursor.md)
- [Claude Code](../tools/claude-code.md)
- [Claude Code Setup Guide](claude-code-setup.md)
- [System Prompts](../concepts/system-prompts.md)
