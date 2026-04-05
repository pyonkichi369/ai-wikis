# Supabase — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Supabase** is an open-source Backend-as-a-Service (BaaS) platform built on PostgreSQL, offering a hosted database, authentication, real-time subscriptions, storage, and Edge Functions. It is the leading open-source alternative to Firebase, used by over 1 million developers as of 2026.

Supabase is particularly popular in the AI development stack because it includes **pgvector** for vector embeddings natively, enabling semantic search without a separate vector database.

## Core Features

| Feature | Description |
|---------|-------------|
| PostgreSQL | Fully managed Postgres — all extensions, full SQL access |
| Auth | Built-in authentication: email/password, OAuth (Google/GitHub/Apple), magic link, phone |
| Real-time | Broadcast, Presence, Postgres Changes — WebSocket subscriptions |
| Storage | S3-compatible object storage with CDN and image transformations |
| Edge Functions | Deno-based serverless functions (TypeScript/JavaScript) |
| pgvector | Native vector search — semantic search without a separate DB |
| Row Level Security | PostgreSQL RLS for per-row tenant isolation |
| Database Migrations | CLI-based migration management |
| Supabase AI | Built-in AI assistant for SQL queries and schema design |

## Pricing (2026)

| Plan | Price | Database | Best For |
|------|-------|---------|---------|
| Free | ¥0 | 500MB, 2 projects | Prototypes |
| Pro | $25/month | 8GB + $0.125/GB | Production apps |
| Team | $599/month | 256GB | Growing companies |
| Enterprise | Custom | Unlimited | Large scale |

**Free tier**: 500MB database, 1GB file storage, 50K MAU auth, 500K Edge Function invocations. Generous enough for MVPs.

## Supabase vs Firebase

| Dimension | Supabase | Firebase |
|-----------|---------|---------|
| Database | PostgreSQL (relational + JSON) | Firestore (document) |
| Query language | SQL | Proprietary SDK |
| Open source | **Yes** (self-hostable) | No |
| Vendor lock-in | Low | High |
| Vector search | **Yes** (pgvector) | No |
| Real-time | PostgreSQL triggers | Firestore streams |
| Functions | Deno Edge Functions | Cloud Functions (Node.js) |
| Auth | Built-in + OAuth | Firebase Auth |
| Price | Cheaper at scale | Google pricing |
| Learning curve | SQL knowledge required | Lower barrier |
| Best for | Structured data, AI apps, open-source | Mobile apps, Google ecosystem |

## Quick Start with JavaScript

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Insert
const { data, error } = await supabase
  .from("threads")
  .insert({ title: "AI Agent Guide", slug: "ai-agent-guide" });

// Query with filter
const { data: threads } = await supabase
  .from("threads")
  .select("*")
  .eq("published", true)
  .order("created_at", { ascending: false });
```

## pgvector: Semantic Search in Supabase

Supabase includes pgvector natively — no separate vector DB needed:

```sql
-- Enable pgvector
CREATE EXTENSION vector;

-- Create table with embedding column
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536)
);

-- Create IVFFlat index for fast search
CREATE INDEX ON articles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Semantic search query
SELECT content, 1 - (embedding <=> '[0.1, 0.2, ...]') AS similarity
FROM articles
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

```python
import anthropic
from supabase import create_client

client = anthropic.Anthropic()
supabase = create_client(url, key)

# Generate embedding
response = client.embeddings.create(
    model="voyage-3",
    input="What is RAG?"
)
embedding = response.embeddings[0]

# Search
results = supabase.rpc("match_articles", {
    "query_embedding": embedding,
    "match_threshold": 0.78,
    "match_count": 5
}).execute()
```

## Row Level Security (RLS)

RLS enforces tenant isolation at the database level — critical for multi-tenant SaaS:

```sql
-- Enable RLS on table
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own rows
CREATE POLICY "Users see own data" ON threads
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: users can only insert their own rows
CREATE POLICY "Users insert own data" ON threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

This means even if a user modifies the request client-side, they cannot access another user's data.

## Real-time Subscriptions

```javascript
// Subscribe to all inserts on "messages" table
const channel = supabase
  .channel("messages")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => console.log("New message:", payload.new)
  )
  .subscribe();
```

Use cases: live dashboards, chat apps, collaborative editors, live view counters.

## Supabase + Next.js Pattern

```typescript
// lib/supabase.ts — server-side client
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
}
```

## Edge Functions

Supabase Edge Functions are TypeScript/Deno functions deployed globally (300ms cold start):

```typescript
// supabase/functions/generate/index.ts
import Anthropic from "npm:@anthropic-ai/sdk";

Deno.serve(async (req) => {
  const { prompt } = await req.json();
  const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  return new Response(JSON.stringify({ text: message.content[0].text }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## Frequently Asked Questions

**Q: What is Supabase?**
A: Supabase is an open-source Firebase alternative built on PostgreSQL. It provides a hosted database, authentication, real-time subscriptions, file storage, and Edge Functions. Start for free at [supabase.com](https://supabase.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=supabase).

**Q: Is Supabase free?**
A: Yes. The free tier includes 500MB database, 1GB storage, 50K MAU authentication, and 500K Edge Function invocations — sufficient for MVPs and side projects. Pro plan is $25/month for production.

**Q: Does Supabase support vector search?**
A: Yes. Supabase includes pgvector natively, enabling semantic search with OpenAI, Claude, or Voyage embeddings without a separate vector database. This makes it a popular choice for RAG applications.

**Q: Supabase vs Firebase — which is better?**
A: Supabase is better for: SQL/relational data, open-source self-hosting, vector search (pgvector), and structured queries. Firebase is better for: rapid mobile development, document-style data, and deep Google integration. For AI applications, Supabase wins due to pgvector and SQL flexibility.

**Q: Can I self-host Supabase?**
A: Yes. Supabase is fully open-source (MIT license) and can be self-hosted with Docker. This eliminates vendor lock-in and is preferred for enterprise deployments requiring data residency compliance.

**Q: How does Supabase handle authentication?**
A: Supabase Auth supports email/password, OAuth (Google, GitHub, Apple, 20+ providers), magic links, phone OTP, and anonymous auth. JWT tokens are issued and can be validated in Row Level Security policies for per-row access control.

## Resources

- Get started free: [supabase.com](https://supabase.com?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=supabase)
- Build AI apps with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=supabase)
- **AI Agent Prompts Pack** (Supabase + pgvector RAG templates, RLS patterns): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=supabase)

## Related

- [Vector Database](../concepts/vector-database.md)
- [RAG](../concepts/rag.md)
- [Vercel](vercel.md)
- [Claude API](claude-api.md)
