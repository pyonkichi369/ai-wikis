# AI Code Review — Automate with Claude and GitHub Actions 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI code review uses LLMs to automatically analyze pull requests for bugs, security vulnerabilities, code quality issues, and style violations — integrating into CI/CD pipelines to provide instant feedback before human review.**

As LLM context windows have grown to 128K–200K tokens, it is now practical to send entire pull request diffs to a model for analysis. AI code review does not replace human review but provides a fast first pass that catches common issues, educates junior developers, and reduces reviewer cognitive load.

## Architecture: PR Webhook → LLM Analysis → GitHub Comment

```
Developer opens Pull Request
         ↓
GitHub sends webhook event (pull_request: opened/synchronize)
         ↓
GitHub Actions workflow triggered
         ↓
Fetch PR diff via GitHub API (git diff base...head)
         ↓
Build analysis prompt:
  - System: "You are a senior code reviewer..."
  - User: [diff content] + [review instructions]
         ↓
Call Claude API (claude-sonnet-4-6, 200K context)
         ↓
Parse structured response (JSON: issues array)
         ↓
Post review comment to PR via GitHub API
  - Summary comment on PR
  - Inline comments on specific diff lines
         ↓
Optionally: request changes / approve based on severity
```

## GitHub Actions Workflow (Complete YAML)

```yaml
# .github/workflows/ai-code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]
    branches: [main, develop]

permissions:
  contents: read
  pull-requests: write

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > pr_diff.txt
          echo "diff_lines=$(wc -l < pr_diff.txt)" >> $GITHUB_OUTPUT

      - name: AI Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REPO: ${{ github.repository }}
        run: |
          python3 - <<'PYTHON'
          import os
          import json
          import anthropic
          import subprocess

          # Read diff
          with open("pr_diff.txt") as f:
              diff = f.read()

          # Truncate if too large (keep first 150K chars ≈ 37K tokens)
          if len(diff) > 150000:
              diff = diff[:150000] + "\n\n[Diff truncated — showing first 150K characters]"

          client = anthropic.Anthropic()

          system_prompt = """You are a senior software engineer conducting a code review.
          Analyze the provided git diff and return a JSON object with this structure:
          {
            "summary": "2-3 sentence overall assessment",
            "severity": "approve|comment|request_changes",
            "issues": [
              {
                "type": "bug|security|performance|style|maintainability",
                "severity": "critical|major|minor",
                "file": "path/to/file.py",
                "line_hint": "approximate line number or null",
                "description": "What the issue is",
                "suggestion": "How to fix it"
              }
            ]
          }
          Focus on: bugs, security vulnerabilities, logic errors, performance issues.
          Skip: minor style preferences unless they indicate confusion or bugs.
          Return ONLY valid JSON, no markdown fences."""

          response = client.messages.create(
              model="claude-sonnet-4-6",
              max_tokens=4096,
              system=system_prompt,
              messages=[{
                  "role": "user",
                  "content": f"Review this pull request diff:\n\n{diff}"
              }]
          )

          try:
              review = json.loads(response.content[0].text)
          except json.JSONDecodeError:
              review = {
                  "summary": response.content[0].text,
                  "severity": "comment",
                  "issues": []
              }

          # Format GitHub comment
          severity_emoji = {"approve": "✅", "comment": "💬", "request_changes": "⚠️"}
          body = f"## AI Code Review {severity_emoji.get(review['severity'], '💬')}\n\n"
          body += f"{review['summary']}\n\n"

          if review.get("issues"):
              critical = [i for i in review["issues"] if i["severity"] == "critical"]
              major = [i for i in review["issues"] if i["severity"] == "major"]
              minor = [i for i in review["issues"] if i["severity"] == "minor"]

              for label, issues in [("Critical", critical), ("Major", major), ("Minor", minor)]:
                  if issues:
                      body += f"### {label} Issues\n"
                      for issue in issues:
                          body += f"- **[{issue['type'].upper()}]** `{issue.get('file', 'N/A')}`"
                          if issue.get("line_hint"):
                              body += f" (line ~{issue['line_hint']})"
                          body += f"\n  {issue['description']}\n"
                          if issue.get("suggestion"):
                              body += f"  > Fix: {issue['suggestion']}\n"
                      body += "\n"
          else:
              body += "No significant issues found.\n"

          body += "\n*Generated by Claude AI — always verify before merging.*"

          # Post comment via GitHub CLI
          import subprocess
          result = subprocess.run(
              ["gh", "pr", "comment", os.environ["PR_NUMBER"],
               "--repo", os.environ["REPO"], "--body", body],
              capture_output=True, text=True,
              env={**os.environ}
          )
          print(result.stdout, result.stderr)
          PYTHON
```

## What LLMs Catch Well vs Miss

| Category | LLM Catches Well | LLM Often Misses |
|----------|-----------------|-----------------|
| **Bugs** | Logic errors, off-by-one, null pointer risks | Race conditions, memory leaks, complex async bugs |
| **Security** | Hardcoded secrets, obvious SQL injection, eval() use | Business logic flaws, auth bypass in context-dependent flows |
| **Performance** | N+1 queries (visible in code), O(n²) loops | Runtime profiling issues, cache invalidation bugs |
| **Style** | Naming inconsistencies, dead code, long functions | Team-specific conventions not in system prompt |
| **Documentation** | Missing docstrings, unclear variable names | Whether comments accurately reflect complex intent |
| **Testing** | Missing test cases (if tests are in diff) | Test quality and coverage gaps not visible in diff |
| **Architecture** | Obvious pattern violations | Long-term design implications, team context |

## AI Code Review vs Human Review vs Static Analysis

| Dimension | AI Code Review | Human Code Review | Static Analysis (ESLint, Semgrep) |
|-----------|---------------|-------------------|----------------------------------|
| Speed | Fast (30–90s) | Slow (hours to days) | **Very fast** (<10s) |
| Context understanding | **High** | **High** | Low (pattern-only) |
| Novel bug detection | Medium | **High** | Low |
| Security rules | Medium | Medium | **High** (curated rules) |
| False positive rate | Medium | Low | **Configurable** |
| Cost per PR | $0.10–$2.00 | High (eng hours) | Near zero |
| Available 24/7 | **Yes** | No | **Yes** |
| Explains reasoning | **Yes** | Yes | Limited |
| Learns team patterns | Via system prompt | **Yes** (organically) | Via custom rules |

Recommended approach: static analysis (free, fast, zero false negatives for rule violations) + AI review (context-aware, catches logic errors) + human review (architecture, business logic, mentorship).

## Prompt Engineering for Code Review

The system prompt quality significantly affects AI review quality:

```python
SYSTEM_PROMPT_TEMPLATE = """You are a senior {language} engineer at {company}.
Review pull requests with these priorities:
1. CRITICAL: Bugs that will cause incorrect behavior or data loss
2. CRITICAL: Security vulnerabilities (injection, auth bypass, secret exposure)
3. MAJOR: Performance issues affecting user experience
4. MAJOR: Missing error handling for expected failure cases
5. MINOR: Code clarity and maintainability

Our stack: {stack_description}
Our coding standards: {standards_url}

DO NOT flag:
- Style preferences not in our standards
- Working code that could theoretically be cleaner
- Opinionated architectural choices if multiple valid approaches exist

For each issue, be specific about file and approximate line number.
Suggest a concrete fix, not just "consider refactoring"."""
```

Key variables to customize:
- Language and framework (Python/Django, TypeScript/Next.js)
- Company-specific patterns and anti-patterns
- Security concerns specific to your domain
- What NOT to flag (reduces noise)

## Cost per PR Analysis

| PR Size | Tokens (Input) | Claude Sonnet Cost | Claude Haiku Cost |
|---------|---------------|-------------------|------------------|
| Small (<50 lines) | ~2K | ~$0.006 | ~$0.001 |
| Medium (50–300 lines) | ~5K | ~$0.015 | ~$0.003 |
| Large (300–1000 lines) | ~15K | ~$0.045 | ~$0.009 |
| Very large (1000+ lines) | ~40K | ~$0.12 | ~$0.024 |

For most teams processing 20–100 PRs/month, AI code review costs $2–20/month using Sonnet or under $2/month using Haiku. Using Haiku for initial review and Sonnet for flagged-critical PRs is a cost-effective tiered approach.

## Tools Comparison

| Tool | Approach | Price | Best For |
|------|---------|-------|---------|
| **CodeRabbit** | SaaS, multi-model | $12/user/month (Pro) | Teams wanting zero-setup |
| **Sourcery** | Python-focused static + AI | $12/user/month | Python codebases |
| **GitHub Copilot PR Review** | GitHub-native | Included in Copilot Enterprise | GitHub-native teams |
| **Custom (Claude + Actions)** | DIY, fully configurable | ~$5–20/month API | Teams needing customization |
| **Ellipsis** | SaaS, PR + issue | $0.10/PR | Cost-conscious teams |
| **Greptile** | Codebase-aware LLM | Custom | Large codebases needing full context |

The custom Claude + GitHub Actions approach offers the most control over review criteria, company-specific rules, and cost — at the expense of initial setup time (~2–4 hours for the workflow above).

## Frequently Asked Questions

**Q: What is AI code review?**
A: AI code review is the use of large language models to automatically analyze source code changes (typically pull request diffs) for bugs, security vulnerabilities, performance issues, and code quality problems. The LLM reads the diff — the lines added and removed in a pull request — and generates natural-language feedback explaining issues and suggesting fixes. AI code review runs automatically in CI/CD pipelines (GitHub Actions, GitLab CI) within seconds of a PR being opened, providing a fast first pass before human reviewers engage. It does not replace human review but catches common issues early and reduces reviewer cognitive load.

**Q: How accurate is AI code review compared to human review?**
A: AI code review is strong at pattern recognition — catching obvious bugs, security anti-patterns (hardcoded secrets, eval() misuse, SQL concatenation), missing null checks, and O(n²) loop patterns visible in code. It consistently misses issues requiring deep contextual knowledge: race conditions, business logic flaws dependent on domain knowledge, complex authentication bypass scenarios, and architectural decisions requiring understanding of the full system. Empirically, AI review catches 60–80% of bugs that human reviewers would flag, with a higher false-positive rate. The combination of static analysis + AI review + human review catches more issues than any single approach.

**Q: How do I set up AI code review with Claude and GitHub Actions?**
A: The setup requires three components: (1) A GitHub Actions workflow file (`.github/workflows/ai-code-review.yml`) that triggers on pull_request events, (2) a Python script that fetches the PR diff, calls the Claude API, and posts the result as a PR comment via the GitHub API, and (3) an `ANTHROPIC_API_KEY` stored as a GitHub Actions secret. The workflow in this article is production-ready. Key considerations: set a diff size limit to avoid exceeding context windows or incurring high costs, use structured JSON output from Claude for consistent comment formatting, and tune the system prompt with your team's specific standards and anti-patterns.

**Q: What is the cost of AI code review per pull request?**
A: Using Claude Sonnet (the recommended model for code review quality), a typical medium-sized PR (50–300 lines changed) costs approximately $0.01–0.05 per review. Large PRs with 1,000+ lines changed cost $0.10–0.20. For a team merging 50 PRs per month, total cost is typically $1–10/month. Using Claude Haiku instead of Sonnet reduces cost by approximately 10× at some quality reduction. SaaS tools like CodeRabbit charge $12/user/month regardless of volume, which is more expensive for small teams but includes a polished interface and zero infrastructure management.

**Q: Should AI code review approve or block pull requests?**
A: The recommended approach is to use AI review in "comment-only" mode for the first 3–6 months — posting review comments but never blocking merges. This builds team trust in the system, allows calibration of the system prompt (reducing false positives), and avoids disrupting developer workflow. After the team is comfortable, consider enabling automatic "request changes" for critical-severity issues only (hardcoded secrets, obvious security vulnerabilities). Never rely solely on AI approval to merge — human review remains essential for architectural decisions, domain logic correctness, and team knowledge sharing.

## Resources

- Build AI-powered developer tools with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-code-review)
- **AI Agent Prompts Pack** (code review system prompt templates for 10+ languages): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-code-review)

## Related

- [Claude API](../tools/claude-api.md)
- [Prompt Engineering](../concepts/prompt-engineering.md)
- [LLM Security Best Practices](llm-security-best-practices.md)
- [Production LLM App](production-llm-app.md)
