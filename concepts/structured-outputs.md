# Structured Outputs (JSON Mode) — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**Structured outputs (also called JSON mode) is a feature that constrains LLM responses to valid JSON or a specific schema, enabling reliable programmatic parsing of AI-generated data.**

Free-form LLM text generation is unsuitable for downstream systems that expect structured data. When an LLM is asked to "return JSON", it may include markdown code fences, trailing commas, unescaped characters, or prose explanations — all of which break `json.loads()`. Structured outputs solve this by constraining the token generation process itself, guaranteeing that the response is parseable before it even reaches your application layer.

## Why Unreliable JSON Output Breaks Production Systems

A typical failure pattern in production:

1. LLM returns `Here is the JSON:\n```json\n{...}\n````
2. `json.loads()` raises `JSONDecodeError`
3. Application crashes or returns a 500 error to the user
4. Engineers add fragile regex-based cleanup logic
5. Edge cases accumulate; maintenance cost grows

Structured outputs eliminate this entire failure class by enforcing schema compliance at generation time rather than post-processing time.

## Approaches Comparison

| Approach | Reliability | Flexibility | Provider Support |
|----------|------------|-------------|-----------------|
| Prompt-based JSON ("return valid JSON") | Low | High | All models |
| JSON mode (unconstrained) | High | Medium | GPT-4o, Gemini |
| Strict schema (OpenAI `response_format`) | Very high | Low | GPT-4o, GPT-4o mini |
| Tool use / function calling | Very high | High | Claude, GPT-4, Gemini |
| Instructor library | High | High | All models via Python |
| Outlines / LM Format Enforcer | Very high | High | Local models only |

**Prompt-based JSON** is the least reliable but works everywhere. Adding "Return your answer as valid JSON only, no prose" to the system prompt raises success rates but does not guarantee them.

**JSON mode** disables markdown and ensures the response parses as JSON, but does not validate against a specific schema. A field may be missing or have the wrong type.

**Strict schema** enforces that every field in a defined JSON Schema is present and correctly typed. Most restrictive but most reliable.

**Tool use / function calling** defines a schema as a function signature. The model is instructed to call the function with the required arguments — effectively forcing structured output through the function-calling mechanism. This is Claude's primary mechanism for structured outputs.

## Claude's Approach: Tool Use as Structured Output

Claude does not have a native "JSON mode" toggle. Instead, Claude uses tool use (function calling) to produce structured outputs. Define a tool with an `input_schema`, set `tool_choice` to force the model to call it, and the response will always match the schema.

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=[{
        "name": "extract_data",
        "description": "Extract structured data from the provided text",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Full name of the person"
                },
                "age": {
                    "type": "integer",
                    "description": "Age in years"
                }
            },
            "required": ["name", "age"]
        }
    }],
    tool_choice={"type": "tool", "name": "extract_data"},
    messages=[{"role": "user", "content": "Extract: John Smith, 34 years old"}]
)

# Access structured data
tool_use_block = next(b for b in response.content if b.type == "tool_use")
data = tool_use_block.input  # {"name": "John Smith", "age": 34}
```

The `tool_choice` parameter forces Claude to always call `extract_data`, guaranteeing the output matches the schema.

## The Instructor Library

Instructor is the most widely used Python library for structured outputs from LLMs. It wraps any LLM client and uses Pydantic models as the schema definition, returning validated Python objects instead of raw JSON.

```bash
pip install instructor
```

With Claude:

```python
import anthropic
import instructor
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    email: str | None = None

client = instructor.from_anthropic(anthropic.Anthropic())

person = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "Extract: Jane Doe, 28, jane@example.com"
    }],
    response_model=Person
)

print(person.name)   # "Jane Doe"
print(person.age)    # 28
print(person.email)  # "jane@example.com"
```

Instructor handles the tool schema generation, response parsing, and Pydantic validation automatically. If validation fails, it optionally retries with the error message injected back into the conversation.

## OpenAI Structured Outputs

OpenAI introduced strict structured outputs in GPT-4o (August 2024) via `response_format`:

```python
from openai import OpenAI
from pydantic import BaseModel

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]

client = OpenAI()
response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[{"role": "user", "content": "Alice and Bob are meeting on Friday."}],
    response_format=CalendarEvent,
)
event = response.choices[0].message.parsed
```

GPT-4o's strict mode uses a constrained decoding approach that guarantees schema adherence at the token level, even for complex nested schemas.

## Pydantic for Schema Validation

Pydantic is the standard Python library for data validation and is the foundation of most structured output workflows. Define schemas as Python classes with type annotations:

```python
from pydantic import BaseModel, Field, validator
from typing import Literal

class ProductReview(BaseModel):
    sentiment: Literal["positive", "negative", "neutral"]
    score: float = Field(ge=0, le=10, description="Score from 0 to 10")
    summary: str = Field(max_length=200)
    topics: list[str]

    @validator("topics")
    def topics_not_empty(cls, v):
        if not v:
            raise ValueError("At least one topic required")
        return v
```

Pydantic validates that the LLM output matches all constraints, including field types, ranges, lengths, and custom validators.

## Common Use Cases

**Data extraction**: Parse structured entities (names, dates, amounts, addresses) from unstructured text such as emails, contracts, or customer messages.

**Classification**: Assign one of a fixed set of labels to text. Using a `Literal` type in Pydantic ensures only valid labels are returned.

**Content generation with schema**: Generate product descriptions, social media posts, or emails as structured objects with fields for headline, body, and call-to-action.

**Form filling**: Convert natural language input into structured form data, with optional fields handled gracefully via `Optional` types.

**API response formatting**: Ensure LLM-generated API responses always conform to a documented interface, eliminating version drift.

## Claude vs OpenAI: Structured Output Mechanisms

| Dimension | Claude (Anthropic) | GPT-4o (OpenAI) |
|-----------|-------------------|-----------------|
| Primary mechanism | Tool use (function calling) | `response_format` + strict mode |
| Schema definition format | JSON Schema in `input_schema` | JSON Schema or Pydantic (`.parse()`) |
| Reliability | Very high (tool_choice forced) | Very high (constrained decoding) |
| Instructor support | Yes | Yes |
| Nested objects | Yes | Yes |
| Array outputs | Yes | Yes |
| Streaming structured output | Partial (stream tool use) | Yes (beta) |

## Frequently Asked Questions

**Q: How do I get JSON output from Claude?**
A: The most reliable approach is tool use. Define a tool with an `input_schema` that describes your desired JSON structure, set `tool_choice={"type": "tool", "name": "your_tool"}` to force Claude to call it, and access the structured data via `response.content[0].input`. For a simpler developer experience, use the Instructor library with `instructor.from_anthropic(anthropic.Anthropic())`, which handles tool schema generation and Pydantic validation automatically.

**Q: What is JSON mode?**
A: JSON mode is a parameter available on some LLM APIs (primarily OpenAI and Gemini) that constrains the model to output valid JSON. It ensures `json.loads()` will succeed on the response, but does not validate the structure against a specific schema — fields may still be missing or have unexpected types. Strict schema mode (OpenAI) or tool use (Claude) provide stronger guarantees by enforcing that specific fields are present with specific types.

**Q: Claude structured outputs vs OpenAI structured outputs — which is more reliable?**
A: Both are highly reliable when used correctly. OpenAI's strict mode uses constrained decoding at the token level, guaranteeing schema adherence mathematically. Claude's tool use approach achieves the same result via the function-calling mechanism, which Claude was specifically trained to follow reliably. In practice, both approach near-100% schema adherence on well-defined schemas. OpenAI's `response_format` API is somewhat simpler for basic use cases; Claude's tool use API is more transparent about what the model is doing. Both work with the Instructor library, which normalizes the experience across providers.

**Q: What is the Instructor library?**
A: Instructor is an open-source Python library (github.com/instructor-ai/instructor) that adds structured output support to any LLM client. It wraps OpenAI, Anthropic, Google, Mistral, and other clients, takes a Pydantic model as the `response_model` parameter, and returns a validated Python object. It handles tool schema generation, JSON parsing, Pydantic validation, and automatic retry on validation failure. Instructor is the most popular library for structured LLM outputs and is production-proven at scale.

**Q: How reliable is LLM JSON output?**
A: Reliability varies significantly by method. Prompt-only JSON instructions achieve roughly 85-95% success on simple schemas, dropping to 60-80% on complex nested schemas with many constraints. JSON mode (no schema) achieves ~99% JSON validity but does not guarantee field presence or types. Tool use / strict schema mode achieves >99.9% schema compliance on well-defined schemas and is considered production-reliable. For any application where a JSON parse failure would cause a user-facing error, use tool use or Instructor with retry logic.

## Resources

- Use Claude's tool use API for reliable structured outputs: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=structured-outputs)
- **LLM Engineering Prompts Pack** (data extraction templates, classification prompts, Pydantic schema recipes): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=structured-outputs)

## Related

- [Function Calling](function-calling.md)
- [Prompt Engineering](prompt-engineering.md)
- [Claude API](../tools/claude-api.md)
- [RAG](rag.md)
- [LangChain](../tools/langchain.md)
