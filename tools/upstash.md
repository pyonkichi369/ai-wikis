# Upstash — Serverless Redis & Kafka Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Upstash is a serverless data platform providing a Redis-compatible in-memory database, a Kafka-compatible message queue, and QStash (an HTTP message scheduler) — all with per-request pricing designed for serverless and edge deployments.**

Unlike traditional Redis or Kafka, Upstash requires no server provisioning, no connection pooling management, and no infrastructure to maintain. You connect via REST API or SDK, and pay only for the operations you execute.

## Upstash Product Suite

| Product | What It Is | Primary Use Cases |
|---------|-----------|------------------|
| Upstash Redis | Serverless Redis | Caching, rate limiting, sessions, leaderboards |
| Upstash Kafka | Serverless Kafka | Event streaming, async job queues, audit logs |
| QStash | HTTP message scheduler | Delayed jobs, webhook delivery, cron tasks |
| Upstash Vector | Serverless vector database | RAG pipelines, semantic search, recommendations |

## Redis Quickstart

Upstash Redis is compatible with the standard Redis protocol and offers a REST API and official SDKs for Python, TypeScript, and Go.

```python
from upstash_redis import Redis

redis = Redis(
    url="https://your-instance.upstash.io",
    token="your-token"
)

# Basic operations
redis.set("user:1:name", "Alice")
name = redis.get("user:1:name")          # "Alice"

# Set with expiry (TTL in seconds)
redis.setex("session:abc123", 3600, "user_data_json")

# Increment counter
redis.incr("page:views:/home")

# Hash operations
redis.hset("user:1", mapping={"name": "Alice", "plan": "pro"})
user = redis.hgetall("user:1")
```

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

await redis.set("key", "value");
const value = await redis.get("key");
```

## Rate Limiting AI API Calls

One of the most common Upstash patterns in AI applications is rate limiting Claude or OpenAI API calls to prevent quota exhaustion and control costs.

```python
from upstash_redis import Redis
from upstash_ratelimit import Ratelimit, FixedWindow

redis = Redis(url="https://...", token="...")

# Allow 10 requests per user per minute
ratelimit = Ratelimit(
    redis=redis,
    limiter=FixedWindow(max_requests=10, window="1m")
)

def handle_ai_request(user_id: str, message: str):
    result = ratelimit.limit(f"user:{user_id}")

    if not result.allowed:
        return {
            "error": "Rate limit exceeded",
            "reset_at": result.reset
        }

    # Safe to call Claude API
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": message}]
    )
    return {"content": response.content[0].text}
```

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

// In your API route (Next.js App Router)
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, limit, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // Proceed with AI call
}
```

## QStash — HTTP Message Scheduling

QStash delivers messages to any HTTP endpoint at a scheduled time or after a delay. No workers or queues to manage.

```python
from qstash import QStash

qstash = QStash(token="your-qstash-token")

# Send a message to your endpoint after 60 seconds
qstash.message.publish_json(
    url="https://yourapp.com/api/process-report",
    body={"report_id": "rpt_123", "user_id": "usr_456"},
    delay="60s"
)

# Schedule a cron job (runs every day at 9am UTC)
qstash.schedule.create(
    cron="0 9 * * *",
    destination="https://yourapp.com/api/daily-digest"
)
```

## Upstash Vector for RAG

```python
from upstash_vector import Index

index = Index(
    url="https://your-vector-instance.upstash.io",
    token="your-token"
)

# Upsert document embeddings
index.upsert([
    {"id": "doc1", "vector": [0.1, 0.2, ...], "metadata": {"text": "content"}},
])

# Query by vector similarity
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=5,
    include_metadata=True
)
```

## Upstash vs Alternatives

| Dimension | Upstash Redis | Redis Cloud | Vercel KV | AWS ElastiCache |
|-----------|--------------|-------------|-----------|----------------|
| Pricing model | Per-request | Per GB/hour | Per command | Per hour (always on) |
| Free tier | 10K commands/day | 30MB free | 30K commands/day | No |
| Serverless | Yes | No | Yes (Upstash under the hood) | No |
| Edge-compatible | Yes (REST API) | No | Yes | No |
| Self-hostable | No | No | No | No |
| Latency | ~10ms (global) | ~5ms (regional) | ~10ms | ~1ms (same VPC) |
| Max data size | Varies by plan | Varies by plan | Varies by plan | Configurable |
| Best for | Serverless, edge, per-request | Always-on, high throughput | Vercel-first projects | AWS ecosystem, latency-critical |

*Vercel KV is built on Upstash infrastructure and shares the same underlying technology.*

## Vercel + Upstash Integration

Upstash has an official Vercel marketplace integration. From the Vercel dashboard:

1. Go to Integrations → Add Integration → Upstash
2. Create a Redis or Vector database
3. Environment variables are automatically added to your Vercel project
4. Access via `Redis.fromEnv()` in your code — no manual configuration needed

This is the recommended setup for Next.js applications deployed on Vercel.

## Pricing (2026)

| Plan | Commands/Day | Price | Best For |
|------|-------------|-------|---------|
| Free | 10,000 | $0 | Development, low-traffic apps |
| Pay-as-you-go | Unlimited | $0.20 per 100K commands | Variable traffic |
| Fixed (Pro) | From 100K/day | From $10/month | Predictable traffic |

QStash and Vector have separate pricing tiers. QStash free tier includes 500 messages/day; Vector free tier includes 10,000 queries/day.

## Frequently Asked Questions

**Q: What is Upstash?**
A: Upstash is a serverless data platform offering Redis-compatible key-value storage, Kafka-compatible message streaming, HTTP-based message scheduling (QStash), and vector database services. All products use per-request pricing with no minimum commitment, making them well-suited for serverless functions, edge runtimes, and applications with variable or unpredictable traffic. There is no server to provision or maintain — you connect via REST API or official SDKs.

**Q: Is Upstash free?**
A: Yes. Upstash Redis free tier provides 10,000 commands per day at no cost. QStash free tier includes 500 messages per day. Upstash Vector free tier includes 10,000 queries per day. These limits are sufficient for development, staging environments, and low-traffic production applications. Usage above free tier limits is billed on a per-command basis with no upfront commitment.

**Q: Upstash vs Redis Cloud — which should I choose?**
A: Upstash is the better choice for serverless deployments (Vercel, Netlify, AWS Lambda, Cloudflare Workers), edge runtimes, and applications with unpredictable or bursty traffic — because you pay only for commands executed. Redis Cloud is better for applications with consistently high, predictable throughput where per-request pricing becomes expensive compared to an hourly-billed always-on instance, or where you need sub-5ms latency from a co-located database.

**Q: How do I use Upstash for rate limiting?**
A: Install `upstash-ratelimit` (Python) or `@upstash/ratelimit` (TypeScript). Initialize it with your Upstash Redis credentials and a limiter strategy — FixedWindow, SlidingWindow, or TokenBucket. Call `ratelimit.limit(identifier)` with a unique key (user ID, IP address, or API key) and check the `allowed` boolean before proceeding with the protected operation. The library handles all Redis operations atomically, making it safe for concurrent serverless function invocations.

**Q: Does Upstash work with Vercel Edge Functions?**
A: Yes. Upstash Redis uses a REST API that works in all edge runtimes including Vercel Edge Functions, Cloudflare Workers, and Deno Deploy. Traditional Redis clients using TCP connections are blocked in edge environments, but Upstash's REST-based SDK has no such restriction. The official Vercel marketplace integration automatically configures environment variables, making setup a one-click operation.

## Resources

- Upstash documentation: [upstash.com/docs](https://upstash.com/docs)
- Build AI apps with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=upstash)
- **AI Agent Prompts Pack** (rate limiting patterns, serverless AI pipeline templates, Redis caching strategies): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=upstash)

## Related

- [Supabase](supabase.md)
- [Vercel](vercel.md)
- [Claude API](claude-api.md)
- [RAG Implementation](../guides/rag-implementation.md)
