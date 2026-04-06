# Tokenization — How LLMs Process Text 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Tokenization is the process by which large language models split text into tokens — subword units that serve as the fundamental unit of LLM input and output — where 1 token approximates 0.75 words in English, directly determining both context window capacity and API billing costs.**

LLMs do not process raw characters or full words. Instead, text is first converted to a sequence of integer IDs — each mapping to a "token," which may be a full word, a word fragment, a punctuation mark, or whitespace. The tokenizer is trained independently from the language model and is specific to each model family: OpenAI models use a tokenizer called tiktoken, Anthropic uses a proprietary tokenizer, and open-source models like LLaMA use SentencePiece. Understanding tokenization is essential for estimating API costs, managing context window usage, and building systems that process text reliably.

## How Tokenization Works

### Byte Pair Encoding (BPE)

Most modern LLM tokenizers use Byte Pair Encoding, a compression algorithm adapted for subword tokenization. BPE starts with a vocabulary of individual characters (or bytes), then iteratively merges the most frequent adjacent pairs into single tokens until a target vocabulary size is reached (typically 50,000–100,000 tokens). The result is a vocabulary where common words appear as single tokens while rare words are split into subword pieces.

For example, the word "tokenization" might be split as `token` + `ization`, while "cat" remains a single token. The algorithm balances vocabulary efficiency against granularity: a larger vocabulary means fewer tokens per sentence but more memory; a smaller vocabulary means more tokens but finer-grained splitting.

### SentencePiece

SentencePiece is a language-independent tokenizer framework used by models such as LLaMA, Mistral, and Google's T5. It treats the input as a raw stream of Unicode characters (not pre-tokenized words), making it inherently language-agnostic. SentencePiece can use either BPE or unigram language model algorithms, and does not require pre-tokenization steps such as whitespace splitting.

### WordPiece

WordPiece is used by BERT and related models. It is similar to BPE but selects merges to maximize the likelihood of the training corpus under a language model, rather than simply merging the most frequent pairs. WordPiece is less common in decoder-only LLMs (the GPT/Claude family) but remains relevant for embedding models.

## Token Counting Examples

The following examples illustrate how English text maps to tokens in a BPE tokenizer similar to those used by GPT and Claude:

| Text | Approximate Token Count |
|------|------------------------|
| `Hello, world!` | 4 tokens |
| `ChatGPT` | 1 token |
| `Tokenization` | 1 token |
| `The quick brown fox jumps over the lazy dog` | 10 tokens |
| 100 typical English words | ~75 tokens |
| 1 page of English prose (~500 words) | ~375 tokens |

### Code vs. Natural Language

Programming languages tokenize differently from English. Identifiers, operators, and punctuation each consume tokens, and indentation whitespace can generate multiple tokens. A block of Python code typically uses more tokens per line than equivalent English description.

```python
# This Python snippet is approximately 40 tokens:
def add(a, b):
    return a + b

result = add(3, 7)
print(result)
```

### Japanese and Chinese

Japanese and Chinese characters are not in the high-frequency merges of tokenizers trained primarily on English text. As a result, CJK characters typically tokenize at a higher token-per-character ratio than English:

| Language | Approx. tokens per character |
|----------|------------------------------|
| English | ~0.25 (4 chars ≈ 1 token) |
| Spanish / French | ~0.30 |
| Japanese (hiragana/katakana) | ~1.0–1.5 |
| Chinese (simplified) | ~1.0–2.0 |
| Arabic | ~0.5–1.0 |

This means a Japanese document will consume 4–6× more tokens than an equivalent-length English document, directly increasing API costs for non-English applications. Multilingual tokenizers (e.g., in recent LLaMA variants) address this by including more CJK subword merges in the vocabulary.

## Context Window Limits by Model

| Model | Max Context (tokens) | Approx. English Words |
|-------|---------------------|----------------------|
| GPT-4o | 128,000 | ~96,000 |
| Claude Sonnet 4 / Opus 4 / Haiku 4 | 200,000 | ~150,000 |
| Gemini 1.5 Pro | 1,000,000 | ~750,000 |
| Gemini 1.5 Flash | 1,000,000 | ~750,000 |
| LLaMA 3.1 70B | 128,000 | ~96,000 |
| Mistral Large 2 | 128,000 | ~96,000 |

Both input (prompt + context) and output (generated response) count toward the context limit. When an input exceeds the model's context window, the API returns an error; the request must be truncated, chunked, or summarized before resubmission.

## Counting Tokens Before Sending

### Claude (Anthropic API)

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.count_tokens(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Hello, Claude"}]
)

print(response.input_tokens)  # 10
```

The `count_tokens` endpoint is free and does not generate a response — it is useful for pre-flight checks before sending large prompts.

### OpenAI / tiktoken

```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o")
tokens = enc.encode("Hello, world! How are you today?")
print(len(tokens))  # 9
```

tiktoken is an open-source library maintained by OpenAI. It supports all OpenAI model tokenizers and is available via `pip install tiktoken`.

## Special Tokens

LLMs reserve certain token IDs for structural purposes:

- **BOS (Beginning of Sequence)**: marks the start of an input, often `<|begin_of_text|>` or `<s>`
- **EOS (End of Sequence)**: signals the model to stop generating, often `<|end_of_text|>` or `</s>`
- **System tokens**: delimit the system prompt from user messages in chat models (e.g., `<|im_start|>system`)
- **Tool / function tokens**: used in function-calling and tool-use contexts to delineate tool definitions and results

Special tokens are part of the model's vocabulary and count toward the token total but are typically inserted automatically by the SDK or API rather than by the developer.

## Cost Calculation

API costs scale linearly with token count. Using Claude Sonnet 4 ($3 per million input tokens, $15 per million output tokens) as a reference:

| Content | Input Tokens | Input Cost |
|---------|-------------|-----------|
| 1 page of English prose | ~375 | $0.0011 |
| 10-page document | ~3,750 | $0.011 |
| 100-page document | ~37,500 | $0.11 |
| Full 200K context | 200,000 | $0.60 |

For output, a 500-token response costs approximately $0.0075 with Sonnet. A chatbot handling 10,000 conversations/day with average 1,000 input + 300 output tokens per turn spends roughly $43/day with Sonnet.

## FAQ

### What is a token in AI?

In the context of large language models, a token is the fundamental unit of text that the model reads and generates. A token is not always a full word — it may be a word fragment, a common phrase, punctuation, or whitespace, depending on the tokenizer's vocabulary. The tokenizer converts raw text into a sequence of integer IDs (each ID mapping to one token), and the model processes these IDs. On output, the model produces a probability distribution over the entire vocabulary at each step, selects the next token ID, and the tokenizer converts the ID sequence back to text. For English, one token corresponds to approximately three to four characters or 0.75 words on average.

### How many tokens is 1,000 words?

Approximately 1,333 tokens for typical English prose. The widely cited rule of thumb is that 1 token ≈ 0.75 words, which inverts to 1 word ≈ 1.33 tokens, so 1,000 words ≈ 1,333 tokens. This ratio varies by content: technical writing with long identifiers or specialized vocabulary typically tokenizes at a lower ratio, while code, JSON, or non-Latin scripts tokenize at a higher ratio (more tokens per word). For budgeting purposes, using 1,500 tokens per 1,000 words provides a conservative upper estimate for mixed content.

### Why does Japanese use more tokens than English?

Japanese (and Chinese) uses more tokens than English because BPE tokenizers are predominantly trained on English text, resulting in fewer merged subword units for CJK characters. In a typical English-optimized tokenizer, a Japanese character or kana syllable is often its own token, whereas in English four characters commonly merge into a single token. This means equivalent text in Japanese consumes 4–6× more tokens than English, which both increases API costs and reduces the effective context window for Japanese content. Newer tokenizers with larger multilingual vocabularies (such as those in recent LLaMA variants and Claude's latest tokenizer) reduce this disparity but do not eliminate it entirely.

### How do I count tokens before sending to Claude?

Use the `count_tokens` endpoint in the Anthropic Python SDK. Construct your messages array exactly as you would for a `messages.create` call, then call `client.messages.count_tokens(model=..., messages=...)` instead. The API returns an `input_tokens` count immediately without generating a response, and this endpoint is free to call. This is useful when building systems that must stay within a budget, dynamically truncate context, or log token usage before committing to a full API call. For system prompts, include the `system` parameter in the count_tokens call to get an accurate total.

### What happens when I exceed the context window?

When the combined token count of your system prompt, conversation history, and user message exceeds the model's maximum context window, the API returns an error (typically HTTP 400 with a message indicating the context limit was exceeded). The request is not processed and no tokens are charged. To handle this, you must reduce the input before retrying: common strategies include truncating the oldest messages in a conversation history, summarizing earlier turns with a separate API call, chunking large documents and processing them in segments, or implementing a sliding window that keeps only the most recent N tokens. RAG pipelines address this by retrieving only the most relevant document chunks rather than including entire documents in every request.

## Resources

- **Build with the Claude API**: [console.anthropic.com](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=tokenization)
- **AI Engineering Handbook (PDF)**: [th19930828.gumroad.com](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=tokenization)

---

*Last updated: April 2026*
