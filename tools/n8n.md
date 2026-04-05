# n8n — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**n8n** (pronounced "n-eight-n") is an open-source workflow automation platform that enables developers and non-developers to build automated workflows connecting 400+ services — including LLMs, APIs, databases, and SaaS tools — through a visual node editor or code.

Unlike Zapier and Make (formerly Integromat), n8n is fully open-source, self-hostable, and developer-friendly with JavaScript/Python code execution inside workflows.

## Key Features

| Feature | Description |
|---------|-------------|
| 400+ integrations | Slack, GitHub, Notion, Airtable, Supabase, OpenAI, Claude, and more |
| Visual node editor | Drag-and-drop workflow builder |
| Code nodes | Execute JavaScript or Python inside workflows |
| AI Agent nodes | Built-in Claude/OpenAI agent support |
| Self-hostable | Full control, no data leaves your infrastructure |
| Webhook triggers | Instant workflow triggers via HTTP |
| Cron scheduling | Time-based workflow execution |
| Error handling | Retry logic, fallback paths |

## n8n vs Zapier vs Make

| Dimension | n8n | Zapier | Make |
|-----------|-----|--------|------|
| Open source | **Yes** | No | No |
| Self-hostable | **Yes** | No | No |
| Code execution | **JavaScript + Python** | No | Limited |
| AI/LLM nodes | **Native** | Limited | Limited |
| Pricing (cloud) | $20/month | $20-70/month | $9-29/month |
| Self-host | **Free** | N/A | N/A |
| Integrations | 400+ | 6,000+ | 1,500+ |
| Developer-friendly | **High** | Low | Medium |
| Best for | Developers, privacy, AI pipelines | Non-technical, many integrations | Visual automation, mid-complexity |

## Pricing (2026)

| Plan | Price | Workflows | Best For |
|------|-------|----------|---------|
| Self-hosted | **Free** | Unlimited | Developers with servers |
| Starter (cloud) | $20/month | 5 active | Small teams |
| Pro (cloud) | $50/month | 15 active | Growing teams |
| Enterprise | Custom | Unlimited | Large orgs |

**Self-hosting**: n8n can run on a $5/month VPS (DigitalOcean, Hetzner) with Docker — total cost under $10/month for unlimited workflows.

## Quick Start (Docker)

```bash
# Self-host n8n with Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=securepassword
      - WEBHOOK_URL=https://your-domain.com
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

## AI Agent Workflow with Claude

n8n has native AI Agent nodes that connect to Claude:

```
Workflow: Customer Support AI Agent
┌─────────────────┐
│  Webhook Trigger│  ← incoming customer message
└────────┬────────┘
         ↓
┌─────────────────┐
│  Claude AI Agent│  ← uses tools to answer
│  Tools:         │
│  - Search FAQ   │
│  - Check Orders │
│  - Update CRM   │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Send Response  │  ← email/Slack/webhook
└─────────────────┘
```

```javascript
// Code node: Claude API call inside n8n workflow
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: $input.first().json.message }]
});

return [{ json: { response: message.content[0].text } }];
```

## Common Automation Patterns

### Content Pipeline (ai-threads style)

```
GitHub Push → Fetch new article → Claude: generate summary →
→ Post to X/Twitter → Post to LinkedIn → Update Notion DB
```

### Lead Qualification Bot

```
Form Submit → Claude: score lead quality (1-10) →
→ If score >= 8: Notify sales Slack → Create HubSpot deal
→ If score < 8: Add to nurture sequence → Send welcome email
```

### AI-Powered Data Extraction

```
Email Arrives → Claude: extract invoice data (amount, vendor, date) →
→ Insert to Google Sheets → Notify accountant if amount > $1000
```

### RAG Knowledge Base Q&A

```
Slack message → Supabase: vector search → Claude: answer with context →
→ Reply in Slack thread
```

## n8n + Supabase Integration

```javascript
// n8n Code node: Semantic search in Supabase pgvector
const { createClient } = require("@supabase/supabase-js");
const Anthropic = require("@anthropic-ai/sdk");

const supabase = createClient($env.SUPABASE_URL, $env.SUPABASE_ANON_KEY);
const anthropic = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const query = $input.first().json.question;

// Generate embedding
const embedResponse = await anthropic.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 10,
  messages: [{ role: "user", content: query }]  
  // Use voyage-3 for actual embeddings in production
});

// Search vector store
const { data: results } = await supabase.rpc("match_documents", {
  query_embedding: embedding,
  match_count: 3
});

return [{ json: { context: results, query } }];
```

## Frequently Asked Questions

**Q: What is n8n?**
A: n8n is an open-source workflow automation platform for connecting 400+ services with a visual editor and code support. It can be self-hosted for free or used as a cloud service. Start at [n8n.io](https://n8n.io?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=n8n).

**Q: Is n8n free?**
A: Yes. n8n is open-source and free to self-host. The cloud version starts at $20/month. Self-hosting on a $5-10/month VPS gives unlimited workflows at near-zero cost.

**Q: n8n vs Zapier — which is better?**
A: n8n is better for: developers, privacy (self-hosted), AI/LLM integrations, code execution. Zapier is better for: non-technical users and teams needing 6,000+ pre-built integrations without any server management.

**Q: Does n8n support Claude/AI?**
A: Yes. n8n has native AI Agent nodes supporting Claude, OpenAI, and other LLMs. You can also use code nodes to call the Claude API directly for custom logic.

**Q: How do I self-host n8n?**
A: Run `docker run -p 5678:5678 n8nio/n8n` for local testing. For production, use docker-compose with a PostgreSQL database and nginx reverse proxy. Full documentation at [docs.n8n.io](https://docs.n8n.io?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=n8n).

## Resources

- n8n documentation: [docs.n8n.io](https://docs.n8n.io?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=n8n)
- Build AI workflows with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=n8n)
- **AI Agent Prompts Pack** (n8n workflow templates, AI agent node recipes, Claude integration patterns): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=n8n)

## Related

- [Multi-Agent System](../concepts/multi-agent-system.md)
- [Claude API](claude-api.md)
- [Supabase](supabase.md)
- [Solopreneur AI Stack](../guides/solopreneur-ai-stack.md)
