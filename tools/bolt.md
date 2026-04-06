# Bolt.new — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Bolt.new is an AI-powered full-stack web development environment by StackBlitz that generates, runs, and deploys complete web applications from text prompts directly in the browser.**

## What Is Bolt.new?

Bolt.new is a browser-based development environment that combines AI code generation with a live execution sandbox. A developer types a plain-language description of an application — "build a task manager with a React frontend and SQLite database" — and Bolt.new generates the full project, installs dependencies, runs a development server, and presents a live preview, all without leaving the browser and without any local tooling installed.

Bolt.new is developed by StackBlitz and is built on their WebContainers technology, which runs a full Node.js environment inside the browser using WebAssembly. It was publicly launched in late 2024 and expanded significantly in 2025 with deployment integrations and multi-framework support.

## How Bolt.new Works

### WebContainers Technology

WebContainers is StackBlitz's core infrastructure innovation. It runs a complete Node.js environment — including npm, file system operations, and a development server — inside a browser tab using WebAssembly and service workers. This eliminates the need for a cloud VM per user; the entire development environment runs locally in the browser.

When Bolt.new generates code, it writes files into this WebContainer, runs `npm install`, starts the dev server, and renders the output in a side-by-side preview pane. The experience mimics a local development environment without any local installation.

### AI Code Generation

Bolt.new uses large language models (primarily Claude Sonnet from Anthropic) to interpret prompts and generate full project scaffolds. The AI can:

- Create the initial project from scratch based on a prompt
- Edit existing files in response to follow-up instructions
- Debug errors shown in the terminal
- Add features to an existing generated project

The AI has direct write access to the file system and can run terminal commands, making it more autonomous than chat-based tools that only suggest code.

## What Bolt.new Can Build

Bolt.new is capable of generating complete, runnable applications including:

- **React and Next.js apps** — full single-page apps and server-side rendered applications
- **Vue and Svelte projects** — with proper project structure and tooling
- **Node.js backends** — Express APIs, REST endpoints, middleware
- **SQLite databases** — schema creation, migrations, queries within the sandbox
- **Full-stack apps** — frontend + backend + database in a single project
- **Static sites** — HTML/CSS/JS without a framework

Generated apps can be deployed directly to Netlify or Vercel with a single click from within the Bolt.new interface.

## Bolt.new vs Comparable Tools

| Dimension | Bolt.new | v0 (Vercel) | Replit | Lovable | Claude Code |
|-----------|---------|------------|--------|---------|-------------|
| Full-stack support | Yes | No (UI only) | Yes | Partial (React + Supabase) | Yes |
| Instant deployment | Netlify / Vercel | Vercel only | Replit hosting | Yes | Manual |
| Backend generation | Yes (Node.js) | No | Yes | Limited | Yes |
| Database | SQLite in sandbox | No | PostgreSQL | Supabase | Any (project-dependent) |
| AI model | Claude Sonnet | Proprietary (Vercel) | Multiple | GPT-4o + custom | Claude |
| Free tier | Yes (limited) | Yes (limited) | Yes (limited) | Yes (limited) | No (requires Claude Pro) |
| Best for | New full-stack apps from prompt | React UI prototypes | Learning + small projects | React + Supabase apps | Existing large codebases |

### Bolt.new vs v0

v0 is strictly a UI generation tool. It outputs React components with Tailwind CSS and shadcn/ui — no backend, no deployment, no runtime environment. Bolt.new generates entire applications including server-side logic and databases. v0 is the right choice when you need a React component to integrate into an existing Next.js project. Bolt.new is the right choice when you are starting a new application from a prompt and want it running immediately.

### Bolt.new vs Claude Code

Claude Code is a terminal-based autonomous coding agent that operates on existing codebases. It reads, edits, and executes code across hundreds of files and is designed for professional software development workflows. Bolt.new is a browser-based tool optimized for generating new applications quickly from prompts. They serve different use cases: Bolt.new excels at greenfield projects needing rapid prototyping; Claude Code excels at complex, ongoing development on established codebases.

### Bolt.new vs Replit

Replit is a cloud IDE with AI features added to an existing development environment. It supports more languages and has a longer history of educational use. Bolt.new is AI-first by design — the prompt is the primary interface. Replit is better for learning programming and long-term project development. Bolt.new is better for rapidly spinning up a working web application from a description.

## Getting Started

1. Navigate to [bolt.new](https://bolt.new)
2. Type a description of the application you want to build
3. Wait for generation (typically 30–90 seconds for a full-stack app)
4. Interact with the live preview in the right panel
5. Refine with follow-up prompts in the chat
6. Deploy directly to Netlify or Vercel from the interface

### Effective Prompt Patterns

| Goal | Prompt Pattern |
|------|---------------|
| CRUD app | "Build a [resource] manager with create, edit, delete, and list views using React and a SQLite database" |
| API server | "Create a Node.js REST API for [domain] with Express, including input validation and error handling" |
| Dashboard | "Build a dashboard that displays [metrics] using React with charts and a data table" |
| Auth app | "Create a full-stack app with user authentication, protected routes, and a profile page" |

## Pricing (2026)

| Plan | Price | Token Allowance | Notes |
|------|-------|----------------|-------|
| Free | $0/month | Limited daily tokens | Sufficient for evaluation and small projects |
| Pro | $20/month | ~10M tokens/month | Suitable for regular development use |
| Teams | Custom | Custom | Multi-seat, priority support |

Bolt.new's usage model is token-based. Each prompt, file generation, and code edit consumes tokens from the monthly allowance. Complex multi-file applications consume more tokens per generation than simple single-page apps.

## Limitations

- **Context limits on large projects**: As an application grows in size and complexity, the AI's ability to maintain coherent context across all files degrades. Very large codebases (50+ files) are better managed in Claude Code or Cursor.
- **Not for existing large codebases**: Bolt.new is optimized for greenfield generation. Importing and meaningfully editing an existing large project is difficult.
- **SQLite only**: The sandbox database is SQLite. Production applications typically require PostgreSQL or MySQL, requiring migration after export.
- **Browser dependency**: Everything runs in the browser. Very compute-intensive applications or those requiring non-web runtimes cannot be developed in Bolt.new.
- **Export required for production**: Bolt.new is a prototyping and development environment, not a production hosting platform. Applications must be exported or deployed to a real host.
- **Token consumption**: Generating and iterating on complex applications can exhaust the free tier quickly.

## FAQ

### What is Bolt.new?

Bolt.new is a browser-based AI development environment built by StackBlitz. It allows users to describe a web application in plain language and receive a fully generated, running application within the browser — including frontend, backend, and database. It uses StackBlitz's WebContainers technology to run a full Node.js environment in the browser without a cloud VM, and uses Claude Sonnet as its AI code generation model.

### Is Bolt.new free?

Bolt.new has a free tier with limited daily token usage. The free tier is sufficient for evaluating the tool and building small projects. Heavier usage requires a Pro subscription at $20/month, which provides approximately 10 million tokens per month. Token consumption varies by project complexity — a simple React app uses fewer tokens than a full-stack application with a database.

### Bolt.new vs v0 — which is better?

They serve different purposes. v0 is a UI-only tool that generates React components with Tailwind CSS for integration into existing Next.js projects. Bolt.new generates complete full-stack applications that run immediately in the browser. Choose v0 when you need a UI component for an existing project. Choose Bolt.new when you are starting a new application from scratch and want a working prototype including backend logic and database within minutes.

### Can Bolt.new build full-stack apps?

Yes. Bolt.new can generate applications with a React or Vue frontend, a Node.js/Express backend, and a SQLite database — all running together in the browser sandbox. It can create API routes, handle form submissions, persist data to the database, and render that data in the frontend. For deployment, the generated application can be exported and deployed to Netlify or Vercel directly from the interface.

### What AI model does Bolt.new use?

Bolt.new primarily uses Claude Sonnet (Anthropic) for code generation. StackBlitz has described this as a deliberate choice for its balance of code quality, instruction-following, and context handling. The AI model is embedded in the Bolt.new product and is not user-selectable in the standard interface.

## Resources

**Add AI features to apps you build with Bolt.new**

Once you have generated a working application in Bolt.new, extend it with AI capabilities using Claude's API — chat interfaces, content generation, classification, and more.

- [Claude API — Get Started](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=bolt) — Anthropic's API for adding LLM features to any web application, including those built and prototyped in Bolt.new.

**AI Tools for Builders**

- [AI Solopreneur Stack PDF](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=bolt) — Curated guide to the tools, workflows, and configurations used by solo AI builders in 2026, including AI-assisted development tools.

## Related Articles

- [v0 by Vercel — Complete Guide](v0.md)
- [Claude Code — Complete Guide](claude-code.md)
- [Cursor — AI Code Editor Guide](cursor.md)
- [Vercel Guide](vercel.md)
