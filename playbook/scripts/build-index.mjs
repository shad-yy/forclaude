#!/usr/bin/env node
// Regenerates playbook/INDEX.md from the frontmatter of every playbook/skills/*.md.
// Per never-count-with-grep: an index is a derived list, never typed by hand.
// Run: node playbook/scripts/build-index.mjs
// Verify: `git diff --exit-code playbook/INDEX.md` — must be clean after a run.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(here, "..", "skills");
const indexPath = resolve(here, "..", "INDEX.md");

function parseFrontmatter(src) {
  if (!src.startsWith("---\n")) throw new Error("no frontmatter");
  const end = src.indexOf("\n---", 4);
  if (end === -1) throw new Error("unterminated frontmatter");
  const body = src.slice(4, end);
  const out = {};
  let key = null;
  for (const line of body.split("\n")) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (m) {
      key = m[1];
      out[key] = m[2];
    } else if (key && line.startsWith(" ")) {
      out[key] += " " + line.trim();
    }
  }
  return out;
}

const files = readdirSync(skillsDir).filter(f => f.endsWith(".md")).sort();
const rows = [];
for (const f of files) {
  const fm = parseFrontmatter(readFileSync(join(skillsDir, f), "utf8"));
  if (!fm.name || !fm.description) throw new Error(`${f}: missing name/description`);
  if (`${fm.name}.md` !== f) {
    throw new Error(`${f}: filename does not match frontmatter name (${fm.name})`);
  }
  rows.push({ name: fm.name, description: fm.description });
}

const md = [
  "# Playbook skills — index",
  "",
  `Derived from \`playbook/skills/*.md\` frontmatter. **Do not hand-edit.** Regenerate with:`,
  "",
  "```bash",
  "node playbook/scripts/build-index.mjs",
  "```",
  "",
  `${rows.length} skills.`,
  "",
  "| Skill | Description |",
  "| :-- | :-- |",
  ...rows.map(r => `| [\`${r.name}\`](skills/${r.name}.md) | ${r.description.replace(/\|/g, "\\|")} |`),
  "",
].join("\n");

writeFileSync(indexPath, md);
process.stdout.write(`Wrote ${indexPath} (${rows.length} skills).\n`);
