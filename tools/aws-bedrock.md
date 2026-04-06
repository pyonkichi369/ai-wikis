# AWS Bedrock — Enterprise AI Platform Complete Guide 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**AWS Bedrock is a fully managed service that provides API access to foundation models from Anthropic (Claude), Meta (Llama), Mistral, Cohere, and others through AWS infrastructure — enabling enterprise teams to build AI applications with AWS security, compliance, and private VPC deployment.**

## Available Models (2026)

| Provider | Model | Context | Strengths |
|----------|-------|---------|-----------|
| Anthropic | Claude Opus 4 | 200K | Complex reasoning, analysis |
| Anthropic | Claude Sonnet 4.6 | 200K | General-purpose, best value |
| Anthropic | Claude Haiku 4 | 200K | High-volume, low latency |
| Meta | Llama 3.3 70B | 128K | Open weights, cost-effective |
| Meta | Llama 3.2 Vision | 128K | Multimodal tasks |
| Mistral | Mistral Large 2 | 128K | EU workloads, multilingual |
| Mistral | Mistral Small | 128K | Budget-friendly |
| Cohere | Command R+ | 128K | RAG and enterprise search |
| Amazon | Nova Pro | 300K | Amazon native, multimodal |
| Amazon | Nova Lite | 300K | Low cost, high throughput |
| Amazon | Titan Text Premier | 32K | AWS-native workflows |
| AI21 Labs | Jamba 1.5 | 256K | Long-document processing |

## Claude on Bedrock vs Direct Anthropic API

| Dimension | AWS Bedrock | Direct Anthropic API |
|-----------|------------|---------------------|
| Billing | AWS invoice (consolidated) | Separate Anthropic invoice |
| Authentication | AWS IAM / assume role | Anthropic API key |
| VPC deployment | Yes (PrivateLink) | No |
| Data stays in AWS account | Yes | No |
| Compliance certifications | SOC 2, ISO 27001, HIPAA, FedRAMP | SOC 2, HIPAA (enterprise) |
| Model availability | Subset of Anthropic models | All Anthropic models (latest first) |
| New model rollout | Weeks behind Anthropic direct | Same day |
| Multi-model switching | One API, many providers | Anthropic only |
| Fine-tuning | Limited (some models) | Not available |
| Throughput quotas | Negotiable with AWS | Fixed per tier |

**Recommendation**: Use Bedrock when AWS is already your cloud provider or when VPC isolation is required. Use the direct Anthropic API for the latest model access and simpler billing.

## Python boto3 Quick Start

```python
import boto3
import json

# Initialize client (uses ~/.aws/credentials or IAM role)
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

# Claude on Bedrock
def invoke_claude(prompt: str, model_id: str = "anthropic.claude-sonnet-4-5") -> str:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    })

    response = bedrock.invoke_model(
        modelId=model_id,
        body=body,
        contentType="application/json",
        accept="application/json"
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]

# Streaming response
def invoke_claude_stream(prompt: str) -> None:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}]
    })

    response = bedrock.invoke_model_with_response_stream(
        modelId="anthropic.claude-sonnet-4-5",
        body=body
    )

    for event in response["body"]:
        chunk = json.loads(event["chunk"]["bytes"])
        if chunk.get("type") == "content_block_delta":
            print(chunk["delta"].get("text", ""), end="", flush=True)

result = invoke_claude("Summarize the key benefits of serverless architecture.")
print(result)
```

## Bedrock Knowledge Bases (Managed RAG)

Bedrock Knowledge Bases provides a fully managed RAG pipeline without infrastructure management.

```python
import boto3

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

def query_knowledge_base(query: str, kb_id: str) -> str:
    response = bedrock_agent.retrieve_and_generate(
        input={"text": query},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": kb_id,
                "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-sonnet-4-5",
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {"numberOfResults": 5}
                }
            }
        }
    )
    return response["output"]["text"]
```

Knowledge Bases automatically handles: document ingestion from S3, chunking, embedding via Titan or Cohere, storage in OpenSearch or Aurora pgvector, and retrieval-augmented generation.

## Bedrock Agents

Bedrock Agents adds multi-step agentic workflows with tool orchestration managed by AWS.

Key components:
- **Agent**: An LLM configuration with instructions and associated tools
- **Action groups**: Lambda functions exposed as tools the agent can call
- **Knowledge bases**: Document stores the agent can retrieve from
- **Memory**: Session-level and cross-session memory (managed)

```python
def invoke_agent(agent_id: str, alias_id: str, session_id: str, prompt: str) -> str:
    response = bedrock_agent.invoke_agent(
        agentId=agent_id,
        agentAliasId=alias_id,
        sessionId=session_id,
        inputText=prompt
    )

    output = ""
    for event in response["completion"]:
        if "chunk" in event:
            output += event["chunk"]["bytes"].decode("utf-8")
    return output
```

## VPC Deployment for Data Privacy

To ensure no data leaves your VPC:

1. Create a VPC endpoint for Bedrock: `com.amazonaws.us-east-1.bedrock-runtime`
2. Set endpoint policy to restrict access to your account
3. Disable internet access on the subnets running Bedrock clients
4. All API traffic routes through the private endpoint within AWS backbone

This architecture satisfies requirements from regulated industries (healthcare, finance, government) where data must not traverse the public internet.

## Pricing vs Direct API

| Model | Bedrock Input | Bedrock Output | Direct Input | Direct Output |
|-------|--------------|----------------|--------------|---------------|
| Claude Sonnet 4.6 | $3/1M | $15/1M | $3/1M | $15/1M |
| Claude Haiku 4 | $0.80/1M | $4/1M | $0.80/1M | $4/1M |
| Llama 3.3 70B | $0.72/1M | $0.72/1M | Free (self-host) | — |
| Amazon Nova Pro | $0.80/1M | $3.20/1M | — | — |

Bedrock pricing for Anthropic models matches Anthropic direct. AWS charges no additional markup for the managed service, though data transfer charges may apply.

## AWS Compliance Certifications

Bedrock inherits AWS's compliance portfolio:

| Certification | Scope |
|---------------|-------|
| SOC 1, SOC 2, SOC 3 | Security, availability, confidentiality |
| ISO 27001, 27017, 27018 | Information security management |
| HIPAA | US healthcare data |
| FedRAMP Moderate | US federal government |
| PCI DSS Level 1 | Payment card data |
| GDPR | EU personal data |
| IRAP | Australian government |

## Getting Started

Access Claude 3.5 Sonnet and other models via AWS console → Bedrock → Model Access → Request access.

For direct Claude API access outside AWS: [claude.ai/referral](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=aws-bedrock)

Enterprise AI stack guide: [AI Tools Solopreneur Guide](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=aws-bedrock)

## FAQ

**Q: Do I need a separate Anthropic account to use Claude on AWS Bedrock?**
A: No. When you access Claude through AWS Bedrock, Anthropic is a third-party model provider and you interact solely through AWS. You do not need an Anthropic account, API key, or billing relationship with Anthropic. Your contract, billing, and support all go through AWS. The tradeoff is that new Claude model versions appear on Bedrock weeks after they are available on Anthropic's direct API.

**Q: How does Bedrock's pricing compare to the direct Anthropic API?**
A: For Claude models, Bedrock charges the same per-token prices as the direct Anthropic API — there is no AWS premium for the managed service layer. The cost difference comes from AWS data transfer fees, which are minimal for typical API usage patterns. The financial advantage of Bedrock comes from consolidated AWS billing (a single invoice), volume discounts if you already spend significantly with AWS, and Savings Plans that can reduce costs by up to 44%.

**Q: What is Bedrock Knowledge Bases and how does it compare to building a RAG system manually?**
A: Bedrock Knowledge Bases is a fully managed RAG (Retrieval-Augmented Generation) service that handles the entire pipeline: ingesting documents from S3, chunking, embedding, storing in a vector database (OpenSearch Serverless or Aurora pgvector), and retrieving relevant context for LLM calls. Building this manually requires provisioning and managing the vector database, embedding pipeline, and retrieval logic yourself. Knowledge Bases reduces operational overhead significantly but offers less customization than a hand-built system using tools like LangChain or LlamaIndex.

**Q: Can I use Bedrock for HIPAA-compliant healthcare applications?**
A: Yes, with proper configuration. AWS Bedrock is HIPAA eligible, meaning AWS will sign a Business Associate Agreement (BAA) for Bedrock usage. However, HIPAA compliance requires the full application architecture to be compliant — not just the model API. You must enable VPC endpoints to prevent data from traversing the public internet, enable CloudTrail logging for audit trails, ensure PHI is not stored in plaintext in logs, and configure appropriate IAM policies. Consult your compliance team before processing real PHI.

**Q: What is the difference between Bedrock Agents and building agents with LangChain or similar frameworks?**
A: Bedrock Agents is AWS's managed agent orchestration layer that handles multi-step reasoning, tool calling, and session memory within the AWS ecosystem. It integrates natively with Lambda (for tool execution), Bedrock Knowledge Bases (for RAG), and AWS services. LangChain and LangGraph are open-source frameworks that offer more flexibility, support any LLM provider, and run wherever you deploy them, but require you to manage infrastructure and implement orchestration logic. Bedrock Agents reduces development effort for standard agentic patterns but is less flexible for custom orchestration logic.
