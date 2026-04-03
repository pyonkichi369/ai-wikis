#!/usr/bin/env node
// build-mfkp-snapshot.js
// Reads all .md files from ai-wiki/concepts/ and outputs ai-threads/data/mfkp-snapshot.json

const fs = require("fs");
const path = require("path");

const CONCEPTS_DIR = path.join(__dirname, "..", "concepts");
const OUTPUT_PATH = path.join(__dirname, "..", "..", "ai-threads", "data", "mfkp-snapshot.json");
const GITHUB_BASE_URL = "https://github.com/pyonkichi369/ai-wikis/blob/main/concepts";
const EXCERPT_LENGTH = 300;

// Map concept IDs to genres based on topic affinity
const CONCEPT_GENRE_MAP = {
  "ai-agent": ["education", "office"],
  "aieo": ["debate", "education"],
  "prompt-engineering": ["office", "education"],
  "rag": ["money", "education"],
};

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractExcerpt(content, length) {
  // Strip the first heading
  const withoutHeading = content.replace(/^#\s+.+\n+/, "");
  // Strip markdown formatting for cleaner excerpt
  const plain = withoutHeading
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\|.+\|/g, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
  return plain.slice(0, length);
}

function buildSnapshot() {
  const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith(".md"));

  const concepts = files.map((file) => {
    const id = path.basename(file, ".md");
    const content = fs.readFileSync(path.join(CONCEPTS_DIR, file), "utf8");
    const title = extractTitle(content) || id;
    const excerpt = extractExcerpt(content, EXCERPT_LENGTH);
    const source_url = `${GITHUB_BASE_URL}/${file}`;
    const genres = CONCEPT_GENRE_MAP[id] || [];

    return { id, title, excerpt, source_url, genres };
  });

  const snapshot = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    concepts,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
  console.log(`[mfkp] Wrote ${concepts.length} concepts → ${OUTPUT_PATH}`);
  concepts.forEach((c) => console.log(`  - ${c.id}: ${c.title} (genres: ${c.genres.join(", ") || "none"})`));
}

buildSnapshot();
