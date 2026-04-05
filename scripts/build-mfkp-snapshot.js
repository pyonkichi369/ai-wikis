#!/usr/bin/env node
// build-mfkp-snapshot.js
// Reads all .md files from ai-wikis/concepts/, tools/, and guides/
// Outputs ai-threads/data/mfkp-snapshot.json

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const OUTPUT_PATH = path.join(__dirname, "..", "..", "ai-threads", "data", "mfkp-snapshot.json");
const GITHUB_BASE = "https://github.com/pyonkichi369/ai-wikis/blob/main";
const EXCERPT_LENGTH = 600;

// Map concept IDs to genres based on topic affinity
const CONCEPT_GENRE_MAP = {
  // concepts/
  "ai-agent":           ["education", "office", "jobs"],
  "aieo":               ["debate", "education"],
  "prompt-engineering": ["office", "education"],
  "rag":                ["money", "education"],
  "defi":               ["money", "crypto", "web3", "jobs"],
  "agent-economy":      ["jobs", "money", "crypto", "web3"],
  // tools/
  "claude-api":         ["office", "education", "debate"],
  "claude-code":        ["office", "education", "debate"],
  "cursor":             ["office", "education", "debate"],
  "perplexity":         ["office", "education", "money"],
  "vercel":             ["office", "education"],
  // guides/
  "solopreneur-ai-stack": ["money", "office", "education"],
};

const SOURCE_DIRS = [
  { dir: path.join(ROOT_DIR, "concepts"), prefix: "concepts" },
  { dir: path.join(ROOT_DIR, "tools"),    prefix: "tools" },
  { dir: path.join(ROOT_DIR, "guides"),   prefix: "guides" },
];

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractExcerpt(content, length) {
  const withoutHeading = content.replace(/^#\s+.+\n+/, "");
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
  const concepts = [];

  for (const { dir, prefix } of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const id = path.basename(file, ".md");
      const content = fs.readFileSync(path.join(dir, file), "utf8");
      const title = extractTitle(content) || id;
      const excerpt = extractExcerpt(content, EXCERPT_LENGTH);
      const source_url = `${GITHUB_BASE}/${prefix}/${file}`;
      const genres = CONCEPT_GENRE_MAP[id] || [];
      concepts.push({ id, title, excerpt, source_url, genres, section: prefix });
    }
  }

  const snapshot = {
    version: "2.0",
    generated_at: new Date().toISOString(),
    concepts,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
  console.log(`[mfkp] v2.0 — Wrote ${concepts.length} concepts → ${OUTPUT_PATH}`);
  concepts.forEach((c) =>
    console.log(`  [${c.section}] ${c.id}: ${c.title} (genres: ${c.genres.join(", ") || "none"})`)
  );
}

buildSnapshot();
