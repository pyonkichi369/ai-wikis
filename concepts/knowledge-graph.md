# Knowledge Graph — AI Knowledge Representation 2026

> *Affiliate disclosure: This page contains referral links. See [AFFILIATES.md](../AFFILIATES.md).*

**A knowledge graph is a structured representation of information as entities (nodes) and relationships (edges) that enables AI systems to reason over complex interconnected facts, used in RAG pipelines, question answering, and enterprise AI for more accurate, explainable retrieval than pure vector search.**

Knowledge graphs store facts as subject-predicate-object triples (e.g., "Claude — developed_by — Anthropic"), enabling multi-hop reasoning that vector databases alone cannot support. They are foundational to enterprise AI, semantic search, and next-generation RAG architectures.

## Core Structure: Nodes, Edges, and Properties

```
         [Person]                [Company]
          "Dario"  —founded_by→  "Anthropic"
              ↑                       ↓
         [Role]                  [Product]
       "Co-founder"  ←created—  "Claude"
                                    ↓
                               [Capability]
                              "200K context"
```

| Concept | Definition | Example |
|---------|-----------|---------|
| **Node (Entity)** | A real-world object or concept | Person, Company, Product |
| **Edge (Relationship)** | Directed link between two nodes | founded_by, created, uses |
| **Property** | Attribute of a node or edge | name="Claude", version="3.7" |
| **Triple** | Subject-predicate-object fact | (Claude, developed_by, Anthropic) |
| **Ontology** | Schema defining allowed entity types and relationships | FOAF, Schema.org |

## Knowledge Graph vs Vector Database

| Dimension | Knowledge Graph | Vector Database |
|-----------|----------------|-----------------|
| Data structure | Nodes + edges (graph) | High-dimensional vectors |
| Query type | Structured (SPARQL, Cypher) | Nearest-neighbor similarity |
| Multi-hop reasoning | **Native** | Not supported |
| Relationship semantics | **Explicit and typed** | Implicit (proximity only) |
| Explainability | **High** (traceable paths) | Low (black-box distances) |
| Handling ambiguity | Good (entity disambiguation) | Limited |
| Scale | Billions of triples (enterprise) | Billions of vectors (cloud) |
| Setup complexity | High | Low–Medium |
| Best for | Complex reasoning, enterprise ontologies | Semantic similarity search |
| Popular systems | Neo4j, Amazon Neptune, Stardog | Pinecone, Weaviate, pgvector |

Both are often used together: the vector DB handles semantic retrieval while the knowledge graph provides structured reasoning over retrieved entities.

## Graph RAG vs Standard RAG

Standard RAG retrieves semantically similar text chunks and passes them to an LLM. Graph RAG first queries a knowledge graph to identify relevant entities and their relationships, then augments the LLM prompt with structured facts.

| Dimension | Standard RAG | Graph RAG |
|-----------|-------------|-----------|
| Retrieval method | Vector similarity | Graph traversal + vector |
| Multi-hop questions | Struggles | **Handles natively** |
| Fact traceability | Low | **High** |
| Setup complexity | Medium | High |
| Hallucination reduction | Moderate | **Strong** |
| Example question handled | "What is Claude?" | "Who founded the company that makes Claude, and what were their previous roles?" |

Graph RAG is gaining adoption in legal, medical, and financial domains where reasoning chains must be auditable.

## Knowledge Graph Platforms Comparison

| Platform | Type | Language | Hosted | Best For |
|----------|------|----------|--------|---------|
| **Neo4j** | Property graph | Cypher | Cloud + self | General purpose, mature ecosystem |
| **Amazon Neptune** | Property + RDF | Gremlin / SPARQL | **AWS managed** | AWS-native enterprise |
| **Weaviate** | Vector + graph hybrid | GraphQL | Cloud + self | RAG with semantic search |
| **Stardog** | Enterprise RDF | SPARQL | Cloud + self | Regulatory compliance, ontologies |
| **Microsoft GraphRAG** | LLM-generated graph | Python API | Self | Unstructured doc analysis |
| **NebulaGraph** | Distributed graph | nGQL | Self | Large-scale social/network graphs |

## Building a Simple Knowledge Graph (Python + Neo4j)

```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def add_entity(tx, name, entity_type):
    tx.run(
        "MERGE (n:Entity {name: $name, type: $type})",
        name=name, entity_type=entity_type
    )

def add_relationship(tx, from_name, relationship, to_name):
    tx.run(
        """
        MATCH (a:Entity {name: $from_name})
        MATCH (b:Entity {name: $to_name})
        MERGE (a)-[:RELATIONSHIP {type: $rel}]->(b)
        """,
        from_name=from_name, rel=relationship, to_name=to_name
    )

with driver.session() as session:
    session.execute_write(add_entity, "Anthropic", "Company")
    session.execute_write(add_entity, "Claude", "AI Model")
    session.execute_write(add_entity, "Dario Amodei", "Person")
    session.execute_write(add_relationship, "Dario Amodei", "founded", "Anthropic")
    session.execute_write(add_relationship, "Anthropic", "created", "Claude")
```

Query with Cypher:

```cypher
-- Find all products and their creators
MATCH (person:Entity)-[:RELATIONSHIP {type: 'founded'}]->(company:Entity)
      -[:RELATIONSHIP {type: 'created'}]->(product:Entity)
RETURN person.name, company.name, product.name
```

## Microsoft GraphRAG Pattern

Microsoft's GraphRAG (open-source, 2024) uses an LLM to automatically extract a knowledge graph from unstructured documents, then uses community detection algorithms to enable global summaries:

```
Documents → LLM extracts entities + relationships → Knowledge graph
→ Community detection (Leiden algorithm) → Community summaries
→ Global query: summarize across communities
→ Local query: traverse graph from relevant nodes
```

This approach outperforms standard RAG on questions requiring synthesis across many documents.

## Use Cases

| Industry | Use Case | Why Graph? |
|----------|---------|-----------|
| Healthcare | Drug interaction reasoning | Multi-hop: drug→protein→pathway→side-effect |
| Finance | Fraud detection | Network of accounts, transactions, entities |
| Legal | Case law research | Precedent chains and citation networks |
| E-commerce | Recommendation | User→purchase→product→category→related |
| Enterprise search | IT asset management | Service dependencies and ownership |

## Frequently Asked Questions

**Q: What is a knowledge graph?**
A: A knowledge graph is a database that stores information as a network of entities (nodes) and typed relationships (edges). Unlike relational tables or document stores, a knowledge graph explicitly represents how facts connect to each other — enabling AI systems to reason over multi-step relationship chains. For example, a query like "what medications interact with drugs prescribed to patients with condition X" requires traversing entity relationships that a vector similarity search cannot handle. Knowledge graphs are used in Google Search, Siri, enterprise data management, and advanced RAG pipelines.

**Q: What is the difference between a knowledge graph and a vector database?**
A: A vector database stores text as numeric embeddings and retrieves items by semantic similarity (nearest-neighbor search). A knowledge graph stores structured facts as entity-relationship triples and retrieves via graph traversal queries. Vector databases excel at semantic search ("find documents similar to this query") while knowledge graphs excel at structured reasoning ("find all employees who report to managers in departments that have a budget over $1M"). Many production AI systems combine both: vector search for initial retrieval, graph traversal for structured reasoning over retrieved entities.

**Q: What is Graph RAG?**
A: Graph RAG is a retrieval-augmented generation variant that uses a knowledge graph instead of (or in addition to) a vector database for the retrieval step. Rather than retrieving semantically similar text chunks, Graph RAG traverses a knowledge graph to find entities and relationships relevant to the query. This enables the LLM to reason over explicitly structured facts, reducing hallucination on complex multi-hop questions. Microsoft released an open-source GraphRAG library in 2024 that automatically builds a knowledge graph from unstructured documents using an LLM.

**Q: Which knowledge graph database should I use?**
A: For general-purpose applications, Neo4j is the most mature choice with the largest community, a managed cloud option (Aura), and a well-documented Cypher query language. For AWS-native applications, Amazon Neptune provides fully managed graph hosting supporting both Gremlin and SPARQL. For RAG applications combining vector search and graph queries, Weaviate offers a hybrid architecture. For enterprise-scale compliance and ontology management, Stardog or Franz AllegroGraph are common choices in regulated industries.

**Q: How do you build a knowledge graph from unstructured text?**
A: There are two main approaches. The manual approach involves defining an ontology (entity types and relationship types), then using NLP pipelines (spaCy, NLTK) or LLMs to extract named entities and classify relationships from text, inserting them into a graph database. The automated approach uses Microsoft's GraphRAG library, which prompts an LLM to extract entities and relationships from document chunks, then builds and stores the graph automatically. The automated LLM-based approach requires more compute but produces richer, context-aware graphs from complex documents.

## Ontologies and Standards

| Standard | Description | Used In |
|----------|-------------|---------|
| **RDF** (Resource Description Framework) | W3C standard for triples (subject-predicate-object) | Semantic web, Wikidata |
| **OWL** (Web Ontology Language) | Adds class hierarchies and inference rules to RDF | Healthcare (SNOMED), finance |
| **SPARQL** | SQL-like query language for RDF graphs | Academic, government, pharma |
| **Cypher** | Property graph query language (Neo4j) | Most commercial applications |
| **Gremlin** | Traversal language for Apache TinkerPop | Amazon Neptune, Azure Cosmos DB |
| **Schema.org** | Web-readable vocabulary for entities | SEO, Google Knowledge Graph |

For new projects without legacy semantic web requirements, property graphs (Neo4j + Cypher) are generally recommended over RDF/SPARQL due to their simpler data model and better tooling.

## Knowledge Graph Limitations

Understanding knowledge graph limitations is important for realistic project planning:

| Limitation | Description | Mitigation |
|-----------|-------------|-----------|
| Schema rigidity | Ontology changes require data migration | Design flexible schemas; use property bags |
| Entity disambiguation | "Apple" the company vs fruit vs record label | Unique identifiers, type constraints |
| Relationship extraction quality | LLM-extracted relationships contain errors | Human review pipeline for critical domains |
| Scale complexity | Billions of edges require distributed infrastructure | Amazon Neptune, NebulaGraph |
| Query complexity | Multi-hop Cypher queries are hard to optimize | Graph database query experts needed |
| Cold start | Empty graph requires significant data ingestion | Start with a focused domain, expand gradually |

## Resources

- Build knowledge-grounded AI with Claude: [Claude API →](https://claude.ai/referral/gvWKlhQXPg?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=knowledge-graph)
- **AI Agent Prompts Pack** (RAG and knowledge graph agent prompts): [th19930828.gumroad.com/l/wpnqp](https://th19930828.gumroad.com/l/wpnqp?utm_source=ai-wikis&utm_medium=wiki&utm_campaign=aieo&utm_content=knowledge-graph)

## Knowledge Graphs in Production: Google and Wikidata

**Google Knowledge Graph** (launched 2012) powers the information panels shown in Google Search results. It contains billions of entities (people, places, organizations, movies, products) and their relationships, enabling Google to answer factual questions directly without requiring users to click through to websites.

**Wikidata** is a free, collaboratively edited knowledge graph maintained by the Wikimedia Foundation. It contains over 100 million structured data items covering people, organizations, locations, works, and concepts — all available under a public domain license (CC0) for training data, AI research, and entity linking in NLP pipelines. It contains over 100 million data items in a structured RDF-compatible format and is the largest open knowledge graph available for research and AI training.

Both demonstrate the scalability and practical value of knowledge graphs at internet scale — the same architectural principles apply to enterprise knowledge graphs at smaller scale.

Academic benchmarks like FB15K-237 (Freebase subset) and WN18RR (WordNet subset) are standard evaluation datasets for knowledge graph embedding and completion research, allowing consistent comparison of graph representation learning methods.

## Related

- [RAG — Retrieval-Augmented Generation](rag.md)
- [Vector Database](vector-database.md)
- [AI Memory Types](ai-memory-types.md)
- [Embeddings](embeddings.md)
- [Knowledge Graph — Microsoft GraphRAG (GitHub)](https://github.com/microsoft/graphrag)
- [Claude API for knowledge-grounded AI](../tools/claude-api.md)
