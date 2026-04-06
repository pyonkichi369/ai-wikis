# AI Data Extraction — Structured Data from Unstructured Text 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI data extraction uses LLMs to parse unstructured text (emails, PDFs, web pages, documents) into structured formats (JSON, CSV, database records) — replacing fragile regex and manual parsing with models that understand context and handle format variations automatically.**

## Extraction Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| Single entity | Extract one object from text | Parse invoice → `{vendor, amount, date}` |
| List extraction | Extract multiple items of same type | Pull all product names from a catalog page |
| Nested extraction | Extract hierarchical objects | Order with line items, each with SKU and quantity |
| Table extraction | Extract tabular data from prose or PDFs | Convert HTML table or PDF table to CSV |
| Relationship extraction | Identify connections between entities | Extract who-did-what-to-whom from news articles |
| Classification + extraction | Assign category then extract fields | Route email and extract sender, urgency, topic |

## Claude + Pydantic Extraction Pipeline

Pydantic models define the output schema, ensuring type safety and validation.

```python
from anthropic import Anthropic
from pydantic import BaseModel, Field
from typing import Optional, List
import json

client = Anthropic()

class LineItem(BaseModel):
    description: str
    quantity: int
    unit_price: float
    total: float

class Invoice(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str  # ISO 8601
    due_date: Optional[str]
    line_items: List[LineItem]
    subtotal: float
    tax_rate: Optional[float]
    total_amount: float
    currency: str = "USD"

def extract_invoice(raw_text: str) -> Invoice:
    schema = Invoice.model_json_schema()

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are a data extraction assistant. Extract structured data from the provided text. "
            "Return ONLY valid JSON matching the schema. Do not include any explanation or markdown."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Extract invoice data from the following text.\n\n"
                    f"Schema:\n{json.dumps(schema, indent=2)}\n\n"
                    f"Text:\n{raw_text}"
                )
            }
        ]
    )

    raw_json = response.content[0].text.strip()
    return Invoice.model_validate_json(raw_json)

# Usage
invoice_text = """
ACME Corp — Invoice #INV-2026-0441
Date: March 15, 2026 | Due: April 15, 2026
Web development services: 40 hrs × $150 = $6,000
Hosting setup: 1 × $500 = $500
Subtotal: $6,500 | Tax (10%): $650 | Total: $7,150
"""

result = extract_invoice(invoice_text)
print(result.model_dump_json(indent=2))
```

## PDF Extraction with PyPDF2 + Claude

```python
import PyPDF2
import anthropic
from pathlib import Path

client = anthropic.Anthropic()

def extract_from_pdf(pdf_path: str, schema: dict) -> dict:
    # Extract raw text from PDF
    text_chunks = []
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text_chunks.append(page.extract_text())

    full_text = "\n\n".join(text_chunks)

    # For scanned PDFs, use Claude's vision API with base64-encoded pages
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Extract structured data from this document text.\n\n"
                    f"Target schema (JSON Schema):\n{json.dumps(schema, indent=2)}\n\n"
                    f"Document text:\n{full_text[:8000]}"  # Truncate if needed
                )
            }
        ]
    )

    return json.loads(response.content[0].text)
```

For scanned PDFs (images), send base64-encoded page images to Claude's vision endpoint rather than extracted text.

## Web Scraping + Extraction

```python
import httpx
from bs4 import BeautifulSoup

def scrape_and_extract(url: str, extraction_goal: str) -> dict:
    # Fetch page
    resp = httpx.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove scripts and styles
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()

    clean_text = soup.get_text(separator="\n", strip=True)

    response = client.messages.create(
        model="claude-haiku-4-5",  # Use Haiku for cost efficiency on simple extraction
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": (
                    f"From the webpage text below, {extraction_goal}. "
                    f"Return JSON only.\n\n{clean_text[:6000]}"
                )
            }
        ]
    )

    return json.loads(response.content[0].text)

# Example
result = scrape_and_extract(
    "https://example.com/product",
    "extract product name, price, availability, and specifications"
)
```

## Accuracy Tips

| Technique | Impact | Implementation |
|-----------|--------|----------------|
| Few-shot examples | High | Include 2–3 input/output pairs in the prompt |
| Explicit schema | High | Always provide JSON Schema or Pydantic model |
| Field descriptions | Medium | Add descriptions to each schema field explaining expected format |
| Negative examples | Medium | Show what NOT to extract when boundary cases exist |
| Confidence score | Medium | Ask model to add `"confidence": 0.0–1.0` per field |
| Chunking large docs | High | Split documents >10K tokens; merge extracted results |
| Temperature = 0 | High | Set `temperature=0` for deterministic extraction |

## LLM Extraction vs Regex vs Traditional NLP Comparison

| Dimension | LLM Extraction | Regex / Rules | Traditional NLP (spaCy/NLTK) |
|-----------|---------------|---------------|------------------------------|
| Setup time | Minutes | Hours–days | Days–weeks |
| Format variation handling | Excellent | Poor | Moderate |
| Context understanding | Excellent | None | Limited |
| Maintenance on format changes | None (prompt update) | High | Medium |
| Latency per document | 200ms–2s | <1ms | 10–100ms |
| Cost per 1000 documents | $0.50–$5 | Free | Infrastructure cost |
| Accuracy on clean data | 95%+ | 98%+ (if pattern matched) | 85–95% |
| Accuracy on messy/varied data | 90–95% | 30–60% | 70–85% |
| Offline / no API | No (unless self-hosted) | Yes | Yes |

## Cost Per Document Estimates

| Document Type | Avg Tokens | Model | Cost per Doc | Cost per 1000 |
|---------------|-----------|-------|-------------|---------------|
| Short email | ~500 | Haiku | $0.0002 | $0.20 |
| Invoice / form | ~1,000 | Haiku | $0.0004 | $0.40 |
| Multi-page report | ~5,000 | Sonnet | $0.008 | $8.00 |
| Long contract | ~20,000 | Sonnet | $0.035 | $35.00 |

Use Claude Haiku for high-volume simple extraction; reserve Sonnet for complex nested schemas or ambiguous documents.

## Getting Started

Claude API for structured extraction: [claude.ai/referral](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-data-extraction)

AI pipeline implementation guide: [AI Tools Solopreneur Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-data-extraction)

## FAQ

**Q: How do I prevent the LLM from hallucinating fields that don't exist in the source document?**
A: Include an explicit instruction such as "If a field cannot be found in the document, return null for that field. Do not infer or guess values." Additionally, add a Pydantic validator or JSON Schema `"additionalProperties": false` to reject unexpected fields. Running extraction at temperature=0 also reduces fabrication. For critical applications, implement a two-pass approach: extract, then run a verification pass asking the model to cite the source text for each extracted value.

**Q: What is the best approach for extracting data from scanned PDFs with poor text quality?**
A: For scanned documents, OCR-extracted text is often incomplete or garbled. The preferred approach is to convert PDF pages to images (using `pdf2image` or `pymupdf`) and send them directly to Claude's vision API as base64-encoded images. Claude can read text from images more accurately than OCR tools on degraded documents. For very large PDFs, process pages in batches of 5–10 and merge the results.

**Q: How should I handle documents where the same field appears in multiple formats (e.g., "USD 1,500" vs "$1500.00" vs "1500 dollars")?**
A: LLMs handle format variation naturally — this is one of the primary advantages over regex. In your schema, specify the expected output format clearly: `"amount": {"type": "number", "description": "Amount in decimal number format, e.g. 1500.00"}`. Add a few-shot example showing different input formats all mapping to the same normalized output. The LLM will normalize variations automatically.

**Q: Can I extract data from tables in PDFs or HTML pages?**
A: Yes. For HTML tables, extract the raw HTML table element (not just the text) and include it in the prompt — preserving row/column structure helps the model understand relationships. For PDF tables, using Claude's vision API on the page image is more reliable than text extraction, which typically loses table structure. Specify in your prompt that you want each row as an array element and each column as a named field.

**Q: How do I batch-process thousands of documents cost-effectively?**
A: Use the Anthropic Batch API for asynchronous processing at a 50% cost discount versus synchronous calls. Structure batches of up to 10,000 requests in a single batch job. For preprocessing, run a fast/cheap model (Haiku) to filter documents that actually contain the target data before running the more expensive extraction. Implement caching on document hash so already-processed documents are not re-extracted on reruns.
