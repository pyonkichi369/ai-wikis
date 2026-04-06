# AI Document Processing — Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AI document processing uses LLMs and vision models to automatically extract, classify, summarize, and transform information from PDFs, Word documents, spreadsheets, and scanned images — replacing manual data entry and rule-based parsers with context-aware understanding.**

Traditional document processing relied on template-based OCR and regular expressions. These systems break when document layouts change and cannot understand context. LLM-based processing reads documents the way a human analyst would: understanding field meaning, handling variation, and extracting structured data even from unstructured prose.

## Document Types and Extraction Challenges

| Document Type | Key Challenges | Best Extraction Approach |
|--------------|----------------|--------------------------|
| Native PDF (text layer) | Multi-column layout, headers/footers | pdfplumber + LLM |
| Scanned PDF / image | No text layer, skew, noise | OCR (Tesseract/Azure) + LLM |
| Word / DOCX | Tables, nested lists, tracked changes | python-docx + LLM |
| Spreadsheet / XLSX | Multi-sheet, merged cells, formulas | openpyxl + LLM |
| HTML / web page | Dynamic content, nested elements | BeautifulSoup + LLM |
| Invoices / receipts | Variable layout, numeric precision | Vision model or OCR + LLM |
| Contracts / legal | Long documents, defined terms | Chunked LLM with context |
| Forms (filled) | Handwriting, checkboxes | Vision model (Claude / GPT-4o) |

## Traditional OCR vs LLM Extraction

| Dimension | Traditional OCR + Rules | LLM-based Extraction |
|-----------|------------------------|----------------------|
| Layout sensitivity | High (breaks on format change) | Low (understands context) |
| Handwriting support | Limited | Good (vision models) |
| Structured output | Regex / templates | Pydantic / JSON schema |
| Multi-language | Requires language-specific models | Native multilingual |
| Table extraction accuracy | Moderate | High |
| Maintenance cost | High (rule updates) | Low (prompt updates) |
| Cost per page | Low ($0.001–0.005) | Moderate ($0.01–0.05) |
| Speed | Fast | Moderate (API latency) |

## PDF Processing Pipeline

### Step 1: Extract Text

```python
import pdfplumber

def extract_pdf_text(path: str) -> str:
    pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    return "\n\n".join(pages)
```

### Step 2: Structured Extraction with Claude + Pydantic

```python
import anthropic
import json
from pydantic import BaseModel

class Invoice(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str
    total_amount: float
    line_items: list[dict]

def extract_invoice(text: str) -> Invoice:
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Extract invoice data as JSON matching this schema:
{Invoice.model_json_schema()}

Document:
{text}

Return only valid JSON, no explanation."""
        }]
    )
    data = json.loads(response.content[0].text)
    return Invoice(**data)
```

## OCR + LLM for Scanned Documents

For scanned PDFs or images without a text layer, use OCR first:

```python
import pytesseract
from PIL import Image
import pdf2image

def ocr_pdf(path: str) -> str:
    images = pdf2image.convert_from_path(path, dpi=300)
    pages = [pytesseract.image_to_string(img, lang="eng") for img in images]
    return "\n\n".join(pages)
```

For higher accuracy, Azure AI Document Intelligence or Google Document AI provide cloud OCR with layout understanding, which produces better results on complex forms and tables than Tesseract.

Alternatively, Claude and GPT-4o support direct image input — pass the scanned page as a base64 image and the vision model extracts structured data without a separate OCR step:

```python
import base64

with open("invoice_scan.jpg", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_data}},
            {"type": "text", "text": "Extract vendor name, date, total, and line items as JSON."}
        ]
    }]
)
```

## Bulk Processing with the Batch API

For processing hundreds or thousands of documents, Claude's Message Batches API reduces cost by 50% and removes rate limit constraints:

```python
import anthropic

client = anthropic.Anthropic()

requests = [
    {
        "custom_id": f"doc_{i}",
        "params": {
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": 512,
            "messages": [{"role": "user", "content": f"Classify this document and extract key fields:\n\n{text}"}]
        }
    }
    for i, text in enumerate(document_texts)
]

batch = client.beta.messages.batches.create(requests=requests)
print(f"Batch ID: {batch.id}")
# Poll batch.processing_status until complete, then retrieve results
```

## Cost per Document at Scale

| Approach | Est. Cost per Page | 10,000 pages |
|----------|--------------------|--------------|
| Tesseract OCR (self-hosted) | ~$0.001 | ~$10 |
| Azure Document Intelligence | ~$0.01 | ~$100 |
| Claude Haiku (text extraction) | ~$0.005 | ~$50 |
| Claude Haiku Batch API | ~$0.0025 | ~$25 |
| Claude Sonnet (complex docs) | ~$0.02 | ~$200 |
| GPT-4o mini | ~$0.01 | ~$100 |

For high-volume pipelines, Haiku via Batch API is the most cost-effective LLM option. Complex documents requiring reasoning (legal contracts, financial statements) justify Sonnet or GPT-4o.

## Practical Tips

- **Chunk long documents**: Split documents > 50 pages into sections with 10% overlap to maintain context across chunks.
- **Use Pydantic for validation**: Schema enforcement catches LLM output errors before they propagate downstream.
- **Cache extracted text**: Store OCR/extraction results to avoid re-processing on schema changes.
- **Confidence scoring**: Ask the LLM to return a confidence field; flag low-confidence extractions for human review.
- **Document classification first**: Classify document type before extraction to select the right schema and prompt.

## Try Claude for Document Processing

Claude's vision and long context capabilities make it well-suited for document workflows:
[Try Claude](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-document-processing)

For a curated AI stack guide: [AI Tools Handbook (PDF)](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=ai-document-processing)

## FAQ

**Q: What is the most accurate approach for extracting data from invoices and receipts?**
For printed invoices, Claude or GPT-4o vision models with direct image input typically achieve the highest accuracy, particularly for variable layouts. For high-volume, cost-sensitive pipelines, a two-stage approach works well: Azure Document Intelligence or Google Document AI for OCR and layout analysis, followed by a smaller LLM (Claude Haiku) for schema mapping and normalization.

**Q: How do I handle multi-page documents that exceed the context window?**
Split the document into chunks of 3–5 pages with overlapping context. Process each chunk independently and merge results. For very long documents (100+ pages), use a hierarchical approach: extract summaries of each section, then do a final pass over the summaries to synthesize the full output. Claude 3.5 Sonnet supports 200K tokens, which covers most business documents without chunking.

**Q: How accurate is Tesseract OCR compared to cloud OCR services?**
Tesseract accuracy on clean, printed text is 95–99%. On low-quality scans, skewed images, or handwriting, accuracy drops to 70–85%. Azure AI Document Intelligence and Google Document AI typically achieve 98–99.5% on the same difficult inputs and include layout analysis (tables, forms) that Tesseract does not provide natively. Cloud OCR adds cost (~$0.01/page) but reduces the LLM's error correction burden.

**Q: Can LLMs extract data from handwritten documents?**
Vision models (Claude Sonnet, GPT-4o) can read printed handwriting with moderate accuracy. For messy handwriting, accuracy varies significantly. No current model reliably matches human performance on difficult cursive. For critical use cases (medical forms, legal signatures), LLM extraction should feed a human review queue rather than automated downstream processing.

**Q: What is the best way to validate extracted data?**
Use Pydantic models with type annotations and validators to enforce field types, date formats, and value ranges. Ask the LLM to return a `confidence` field (0–1) for each extracted field. Cross-validate numeric totals (sum of line items should equal invoice total). For financial documents, implement a separate reconciliation step that verifies extracted numbers against expected ranges or reference data.
