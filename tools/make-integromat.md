# Make (Integromat) — AI Automation Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Make (formerly Integromat) is a visual no-code automation platform that connects 1,000+ apps through drag-and-drop scenario builders, with native HTTP modules enabling Claude API and OpenAI API integration for AI-powered workflows without coding.**

Rebranded from Integromat to Make in 2022, the platform has grown to become one of the three dominant workflow automation tools alongside Zapier and n8n. Its distinguishing feature is a canvas-based scenario editor that exposes data transformation, routing logic, error handling, and API calls as interconnected visual modules — making complex multi-step automations accessible without writing code.

## Core Concepts

| Concept | Definition |
|---------|-----------|
| Scenario | A complete automated workflow, equivalent to a "Zap" in Zapier or a "Workflow" in n8n |
| Module | A single action within a scenario (e.g., "Watch new email", "HTTP request", "Create Slack message") |
| Connection | Authenticated link between Make and an external app or API |
| Router | Module that splits execution into multiple parallel branches based on conditions |
| Aggregator | Module that collects output from multiple iterations into a single bundle |
| Iterator | Module that processes an array item-by-item through subsequent modules |
| Data store | Make's built-in key-value database for persisting state between scenario runs |
| Scheduling | Trigger scenarios on demand, on a fixed interval, or via webhook |

## Make vs Zapier vs n8n

| Dimension | Make | Zapier | n8n |
|-----------|------|--------|-----|
| Visual builder | Advanced canvas | Simple linear | Advanced canvas |
| AI native | HTTP only | HTTP only | HTTP + LangChain nodes |
| Free tier | 1,000 ops/month | 100 tasks/month | Self-host free |
| Self-host | No | No | Yes |
| Pricing (entry) | $9/month | $19.99/month | $20/month cloud |
| Complex logic | Routers, aggregators | Limited branching | Full code execution |
| Error handling | Retry + fallback paths | Basic | Advanced |
| Integrations | 1,000+ | 6,000+ | 400+ |
| Best for | Visual power users, mid-complexity AI | Non-technical, breadth of integrations | Developers, privacy, code execution |

## Pricing (2026)

| Plan | Price | Operations/month | Active scenarios |
|------|-------|-----------------|-----------------|
| Free | $0 | 1,000 | 2 |
| Core | $9/month | 10,000 | 3 |
| Pro | $16/month | 10,000 | 10 |
| Teams | $29/month | 10,000 | 100 |
| Enterprise | Custom | Custom | Unlimited |

Operations are the core billing unit: each module execution in a scenario consumes one operation. A scenario with five modules running 100 times = 500 operations.

## Calling the Claude API from Make

Make does not have a dedicated Claude module, but its HTTP module provides full API access to any REST endpoint.

### Setup: HTTP Module for Claude

1. Add an **HTTP > Make a request** module to your scenario.
2. Configure the module:

| Field | Value |
|-------|-------|
| URL | `https://api.anthropic.com/v1/messages` |
| Method | `POST` |
| Headers | `x-api-key: {{your_api_key}}` |
| Headers | `anthropic-version: 2023-06-01` |
| Headers | `content-type: application/json` |
| Body type | Raw |
| Content type | JSON (application/json) |

3. Request body:

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "{{1.text}}"
    }
  ]
}
```

4. Parse the response: the Claude API returns `content[0].text`. Use Make's JSON parsing to map this to subsequent modules.

### Security Note

Store API keys in Make's **Connections** or environment variables — never hardcode them directly in module configurations. Use Make's built-in secret manager when available, or restrict scenario access via team permissions.

## 5 Practical AI Automation Scenarios

### 1. Form Submission → Claude Analysis → Slack Notification

```
Typeform (Watch responses)
  → HTTP (Claude API): analyze sentiment and extract key topics
  → Slack (Send message): post summary to #support channel
```

Use case: triage incoming customer feedback automatically. Claude scores urgency (1–10) and extracts action items. High-urgency submissions ping the on-call Slack channel immediately.

### 2. New Email → Claude Categorize → CRM Update

```
Gmail (Watch emails)
  → HTTP (Claude API): classify as sales/support/spam/partnership
  → Router: branch by category
    → HubSpot (Create contact) if sales
    → Zendesk (Create ticket) if support
    → Gmail (Apply label) if other
```

### 3. RSS Feed → Claude Summarize → Blog Post Draft

```
RSS (Watch items)
  → HTTP (Claude API): summarize in 3 bullets + generate tweet
  → Notion (Create page): save draft with summary
  → Buffer (Create post): schedule tweet
```

### 4. Customer Message → Claude Response → Helpdesk Ticket

```
Intercom (Watch conversations)
  → HTTP (Claude API): draft reply using help doc context
  → Intercom (Add note): attach AI draft for agent review
  → Zendesk (Create ticket): log for tracking
```

Claude does not send the reply directly — it drafts a response for human review, maintaining quality control while reducing response time.

### 5. GitHub PR → Claude Code Review → Comment

```
GitHub (Watch pull requests)
  → GitHub (Get file contents): fetch diff
  → HTTP (Claude API): review code for bugs, style, security
  → GitHub (Create comment): post review on the PR
```

## Frequently Asked Questions

**Q: What is Make (Integromat)?**
A: Make (formerly Integromat) is a visual no-code automation platform that lets users connect 1,000+ apps and APIs through a drag-and-drop scenario builder. Users design workflows called scenarios composed of modules — each module representing an action in a third-party app or API. Make handles scheduling, error recovery, and data transformation without writing code. It was built by Czech company Celonis after acquiring Integromat in 2020 and rebranding it to Make in 2022.

**Q: How do I use the Claude API in Make?**
A: Make does not have a native Claude module, but the built-in HTTP module provides full access to the Claude API. Add an "HTTP > Make a request" module, set the URL to `https://api.anthropic.com/v1/messages`, add headers for `x-api-key`, `anthropic-version`, and `content-type`, then pass a JSON body with your model, messages array, and max_tokens. Parse the response using Make's JSON tools to extract `content[0].text` and pass it to downstream modules. Store your API key securely in Make's connection settings rather than hardcoding it in the module.

**Q: Make vs Zapier — which is better for AI workflows?**
A: Make is generally better for AI workflows because its canvas editor and router/aggregator modules support the branching and iteration logic that AI pipelines require. Zapier uses a linear step-by-step model that becomes unwieldy for complex conditional flows. Make's HTTP module is more configurable than Zapier's, offering better control over headers, body formats, and error handling. However, Zapier has a larger library of pre-built integrations (6,000+ vs Make's 1,000+) and a simpler interface for non-technical users. For straightforward "trigger → AI call → action" flows, both work equally well.

**Q: Is Make free?**
A: Make offers a free plan with 1,000 operations per month and 2 active scenarios. This is sufficient for testing and low-volume personal automation. Paid plans start at $9/month (Core) for 10,000 operations. Operations are consumed per module execution, so a 5-module scenario running 100 times uses 500 operations. For AI workflows involving Claude API calls, each API call module consumes one operation regardless of the tokens processed by the LLM.

**Q: Can Make connect to the Claude API?**
A: Yes. Make's HTTP module can connect to any REST API, including the Claude API at `https://api.anthropic.com/v1/messages`. Make sends a POST request with authentication headers and a JSON body specifying the model, messages, and token limit. Claude's response is returned as a JSON object that Make can parse and route to any downstream module — Slack, Google Sheets, Notion, a database, or another API. There is no official Anthropic-built Make integration, but the HTTP module provides equivalent functionality.

## Error Handling and Retry Logic

Make provides built-in error handling that is important for production AI workflows. Claude API calls can fail due to rate limits, network timeouts, or transient server errors. Configure error handlers on HTTP modules to avoid losing data when failures occur.

**Setting up a retry handler:**
1. Right-click the HTTP module → Add error handler
2. Choose the **Retry** directive for transient errors (5xx status codes)
3. Set a delay of 10–30 seconds between retries
4. Set max retries to 3

**Setting up a fallback path:**
For non-retryable errors (4xx status codes), add a **Resume** or **Break** directive that routes the bundle to a fallback path — for example, logging the failure to a Google Sheet or sending a Slack alert.

## Common Errors and Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing or incorrect `x-api-key` header | Verify the API key value and that the header name is exactly `x-api-key` |
| 400 Bad Request | Malformed JSON body | Ensure the body is valid JSON; check that `messages` is an array, not an object |
| 529 Overloaded | Anthropic API at capacity | Add an error handler with a 10–30 second delay and retry |
| Empty response body | Incorrect body parsing | Set "Parse response" to Yes and specify JSON as the content type |
| Scenario timeout | Claude response exceeds Make's HTTP timeout | Increase the HTTP module timeout; default is 40 seconds |
| Operation limit reached | Free plan exhausted 1,000 monthly ops | Upgrade plan or reduce scenario frequency |

### Parsing Claude's Response in Make

The Claude API returns a response structure like:

```json
{
  "content": [
    {
      "type": "text",
      "text": "The answer is..."
    }
  ]
}
```

In Make's HTTP module response mapping, use the path `content[].text` or map `1.data.content[].text` to extract the generated text. Set the HTTP module's "Parse response" option to **Yes** so Make automatically converts the JSON response into a mappable data structure.

## Resources

- Build AI workflows with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=make-integromat)
- **AI Agent Prompts Pack** (Make scenario templates, Claude HTTP module configs, AI automation patterns): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=make-integromat)
- Make documentation: [make.com/en/help](https://www.make.com/en/help)

## Related

- [n8n](n8n.md)
- [AI Workflow Automation](../concepts/ai-workflow-automation.md)
- [Claude API](claude-api.md)
- [AI Agent Architecture](../guides/ai-agent-architecture.md)
