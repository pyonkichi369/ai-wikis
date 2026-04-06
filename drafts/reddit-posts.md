# Reddit 投稿テキスト集

コピペしてそのまま投稿できる形式。投稿後にURLをperplexity-log.mdに記録する。

---

## r/ClaudeAI — MCP仕様書

**Title:**
```
I published an open MFKP spec for structuring AI-citable documentation (with Claude Code examples)
```

**Body:**
```
I've been building ai-wikis — an open knowledge base optimized for citation by Perplexity, ChatGPT Browse, and Google AI Overview.

After writing 29 articles in MFKP format, I formalized the spec itself as an article: what makes content extractable by AI engines, the scoring model, quality checklist, and how to implement it.

Key things the spec covers:
- Why the "bold definition sentence" structure gets cited by Perplexity
- The M×N integration problem MFKP solves for RAG systems
- Scoring model: domain authority (30%) + semantic relevance (25%) + freshness (15%) + chunk extractability (15%)
- Full template with checklist

The repo also includes articles on Claude Code, MCP, LangChain, Supabase, Ollama, and more — all in MFKP format.

GitHub: https://github.com/pyonkichi369/ai-wikis

Happy to answer questions about the AIEO approach or the Claude Code pipeline I use to generate content.
```

**Post to:** https://www.reddit.com/r/ClaudeAI/submit

---

## r/LocalLLaMA — Ollama記事

**Title:**
```
Wrote a comprehensive Ollama vs Claude API comparison guide (with pgvector RAG example)
```

**Body:**
```
I've been maintaining ai-wikis, an open knowledge base for AI developers.

Just published a detailed Ollama guide covering:
- All major models (Llama 3.3, Qwen2.5, DeepSeek-R1, Mistral) with VRAM requirements
- OpenAI-compatible REST API usage
- Full RAG pipeline example with Ollama + ChromaDB + nomic-embed-text
- Modelfile customization
- Hardware requirements for Apple Silicon vs NVIDIA
- When to stay on Ollama vs when to switch to Claude API for production

Article: https://github.com/pyonkichi369/ai-wikis/blob/main/tools/ollama.md

The repo has 28 other AI developer articles in the same structured format. PRs welcome if anything's outdated.
```

**Post to:** https://www.reddit.com/r/LocalLLaMA/submit

---

## r/MachineLearning — Fine-tuning vs RAG

**Title:**
```
Fine-tuning vs RAG decision guide — when to use each (with LoRA code examples)
```

**Body:**
```
One of the most common questions in ML production: should I fine-tune or use RAG?

I wrote a comprehensive breakdown covering:
- The actual decision framework (not just "it depends")
- LoRA fine-tuning: why 0.006% of parameters is often enough
- Dataset size requirements by use case (50 examples vs 10,000)
- The "fine-tuning + RAG" hybrid pattern for production
- Code examples for both SFT and LoRA using HuggingFace PEFT

Article: https://github.com/pyonkichi369/ai-wikis/blob/main/concepts/fine-tuning.md

Part of ai-wikis — an open knowledge base structured for AI engine citation (Perplexity, ChatGPT Browse, etc.). All articles are MFKP format: definition → comparison tables → FAQ.
```

**Post to:** https://www.reddit.com/r/MachineLearning/submit

---

## r/webdev — Supabase記事

**Title:**
```
Supabase complete guide 2026: pgvector, RLS patterns, Edge Functions with Claude API
```

**Body:**
```
I updated my Supabase reference guide with 2026 pricing and patterns. Covers:

- pgvector semantic search (full SQL + Python example with embeddings)
- Row Level Security patterns for multi-tenant SaaS
- Real-time subscriptions for live dashboards
- Edge Functions calling Claude API (TypeScript/Deno)
- Supabase vs Firebase comparison (updated for 2026)

Article: https://github.com/pyonkichi369/ai-wikis/blob/main/tools/supabase.md

Part of ai-wikis — MIT-licensed reference docs structured for RAG citation.
```

**Post to:** https://www.reddit.com/r/webdev/submit

---

## Hacker News — Show HN

**Title:**
```
Show HN: ai-wikis – Open knowledge base structured for AI engine citation (MFKP format)
```

**Body:**
```
I've been experimenting with AIEO (AI Engine Optimization) – structuring content so AI search engines (Perplexity, ChatGPT Browse, Google AI Overview) cite it when answering developer questions.

The result is ai-wikis: https://github.com/pyonkichi369/ai-wikis

29 articles on AI tools and concepts (Claude API, MCP, LangChain, Supabase, Ollama, fine-tuning, context windows, etc.) all in MFKP (Machine-Friendly Knowledge Package) format.

MFKP requirements:
- Opens with a bold, standalone citable definition
- Comparison tables (structured data for RAG extraction)
- FAQ section matching exact user search queries
- Encyclopedic tone (no promotional language in body)

I also published the MFKP spec itself as an article: https://github.com/pyonkichi369/ai-wikis/blob/main/concepts/mfkp.md

The repo is MIT licensed. PRs welcome — there's a Contributing section with a wanted articles list.

Curious whether others have experimented with structuring content for AI citation vs traditional SEO.
```

**Post to:** https://news.ycombinator.com/submitlink?u=https://github.com/pyonkichi369/ai-wikis&t=Show+HN:+ai-wikis+%E2%80%93+Open+knowledge+base+structured+for+AI+engine+citation

---

## Zenn — 投稿手順

1. https://zenn.dev/new にアクセス
2. 「スクラップ」ではなく「記事」を選択
3. `drafts/zenn-mcp-guide.md` の内容をコピペ
4. タグ: `claude` `mcp` `ai` `langchain` `claude-code`
5. 公開設定: 全体公開
6. 投稿後、URLをperplexity-log.mdに記録

---

## 投稿チェックリスト

- [ ] r/ClaudeAI — MFKP仕様書
- [ ] r/LocalLLaMA — Ollama記事
- [ ] r/MachineLearning — Fine-tuning vs RAG
- [ ] r/webdev — Supabase記事
- [ ] Hacker News Show HN
- [ ] Zenn — MCP記事
- [ ] 投稿URLをperplexity-log.mdに記録
