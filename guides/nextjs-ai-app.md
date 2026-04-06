# Build a Next.js AI App with Claude API — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Building a Next.js AI application with the Claude API involves creating a Next.js App Router project, setting up a server-side API route that proxies Claude API calls, and implementing a streaming chat interface — the standard architecture for production AI web applications.**

## Overview

Next.js is the dominant framework for production AI web apps in 2026 because it provides server-side rendering, seamless API routes, and first-class Vercel deployment — all essential for building secure, performant Claude-powered applications.

This guide covers the complete stack: Next.js 15 App Router, TypeScript, the Anthropic SDK, Tailwind CSS, streaming responses, and one-command Vercel deployment.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR, routing, API routes |
| Language | TypeScript | Type safety |
| AI provider | Claude API (Anthropic SDK) | LLM backend |
| Styling | Tailwind CSS | Utility-first CSS |
| Deployment | Vercel | Zero-config hosting |
| Rate limiting | Upstash Redis (optional) | Prevent API abuse |

## Project Setup

Create a new Next.js project with the standard flags:

```bash
npx create-next-app@latest my-ai-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
cd my-ai-app
npm install @anthropic-ai/sdk
```

Add your Anthropic API key to `.env.local` (never commit this file):

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

## Server-Side API Route

Create the streaming API route at `app/api/chat/route.ts`. All Claude API calls must happen server-side — never expose your API key to the browser.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages,
  });

  return new Response(stream.toReadableStream());
}
```

The `stream.toReadableStream()` method returns a Web-standard `ReadableStream` that Next.js serves as a streaming response with no additional configuration.

## Client-Side Chat Component

Create the chat interface at `app/page.tsx`:

```typescript
'use client';
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let assistantText = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      // Parse SSE events from Anthropic stream
      const lines = chunk.split('\n').filter(l => l.startsWith('data:'));
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(5));
          if (data.type === 'content_block_delta') {
            assistantText += data.delta?.text ?? '';
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: assistantText },
            ]);
          }
        } catch {}
      }
    }
    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Claude Chat</h1>
      <div className="space-y-3 mb-4 min-h-[200px]">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded ${m.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <span className="font-semibold">{m.role === 'user' ? 'You' : 'Claude'}:</span> {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Claude anything..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </main>
  );
}
```

## Vercel AI SDK Alternative

Vercel's `ai` package provides a higher-level abstraction with the `useChat` hook, which handles streaming, message state, and loading automatically:

```bash
npm install ai @ai-sdk/anthropic
```

```typescript
// app/api/chat/route.ts (Vercel AI SDK style)
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    messages,
  });
  return result.toDataStreamResponse();
}
```

```typescript
// app/page.tsx (Vercel AI SDK style)
'use client';
import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <main className="max-w-2xl mx-auto p-4">
      {messages.map(m => (
        <div key={m.id}><b>{m.role}:</b> {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} className="border p-2 w-full" />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
```

The Vercel AI SDK approach is more concise but adds an extra dependency. The manual approach gives full control over the streaming protocol.

## Security Considerations

| Risk | Mitigation |
|------|-----------|
| API key exposure | Always use server-side API routes — never call Anthropic from the browser |
| Prompt injection | Validate and sanitize user input before including it in messages |
| Cost overruns | Set `max_tokens` limits; add rate limiting with Upstash Redis |
| Data leakage | Do not log full message content in production; use structured logging |

### Rate Limiting with Upstash

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response('Too many requests', { status: 429 });
  // ... rest of handler
}
```

## Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
vercel

# Add environment variable
vercel env add ANTHROPIC_API_KEY
```

Alternatively, connect your GitHub repository in the Vercel dashboard. On every `git push`, Vercel automatically rebuilds and deploys. Set `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables.

## Architecture Comparison

| Approach | Pros | Cons |
|----------|------|------|
| Manual API route + fetch | Full control, no extra deps | More boilerplate |
| Vercel AI SDK (`useChat`) | Minimal code, built-in streaming | Locks you into Vercel's abstraction |
| LangChain.js | Rich chain support, RAG ready | Heavy dependency, slower iteration |
| Direct client-side call | Simplest code | Exposes API key — never do this |

## Frequently Asked Questions

**Q: How do I add Claude to a Next.js app?**
A: Install the Anthropic SDK (`npm install @anthropic-ai/sdk`), create a server-side API route at `app/api/chat/route.ts` that calls `anthropic.messages.create()` or `anthropic.messages.stream()`, and call that route from your client components using `fetch`. Store your API key in `.env.local` as `ANTHROPIC_API_KEY` — it is automatically available server-side in Next.js and never sent to the browser.

**Q: Can I call Claude API from the browser?**
A: No. You must never call the Anthropic API directly from the browser because doing so would expose your API key in client-side JavaScript. Always proxy Claude API calls through a Next.js API route (or any server-side handler). The server makes the actual Anthropic API call and streams or returns the result to the browser.

**Q: How do I stream Claude responses in Next.js?**
A: Use `anthropic.messages.stream()` and return `new Response(stream.toReadableStream())` from your API route. On the client, read the response body as a `ReadableStream` using `res.body.getReader()` and decode the SSE events as they arrive. Alternatively, use the Vercel AI SDK's `streamText` + `useChat`, which handles all streaming plumbing automatically.

**Q: What is the Vercel AI SDK?**
A: The Vercel AI SDK (`ai` package) is an open-source library by Vercel that provides unified interfaces for streaming LLM responses in Next.js (and other frameworks). It includes `streamText` for server-side streaming, `useChat` and `useCompletion` React hooks for client-side state, and adapters for Claude, OpenAI, Gemini, and other providers. It reduces boilerplate significantly but adds a dependency.

**Q: How do I deploy an AI Next.js app to Vercel?**
A: Run `vercel` in your project directory to deploy via the CLI, or connect your GitHub repo in the Vercel dashboard for automatic deployments on each push. In both cases, add `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables in the Vercel dashboard. Vercel's Edge Network handles SSL, CDN, and global distribution automatically.

## Further Resources

- [Claude API — get your API key](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=nextjs-ai-app)
- [AI Tools Mastery Guide (Gumroad)](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=nextjs-ai-app)
- [Claude API quickstart](./claude-api-quickstart.md)
- [Vercel deployment guide](../tools/vercel.md)
- [Upstash rate limiting](../tools/upstash.md)
- [RAG implementation guide](./rag-implementation.md)
