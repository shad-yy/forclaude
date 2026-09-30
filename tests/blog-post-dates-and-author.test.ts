// O-29 follow-up (owner decisions 2026-09-30):
// - Blog bylines come from each post's own frontmatter author (default
//   "Smart Live TV"), matching the Article schema, never a hard-coded name.
// - Every post carries a real frontmatter date. scripts/generate-posts.js
//   used to stamp a missing date with the build date, so each deploy
//   re-dated 4 matchweek posts; it now refuses to build instead.

import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { BLOG_POSTS } from "@/lib/blog/posts"

const MDX = readdirSync("content/blog").filter((f) => f.endsWith(".mdx"))

describe("blog post dates", () => {
  it("every content/blog post has a quoted YYYY-MM-DD frontmatter date", () => {
    const missing = MDX.filter((f) => {
      const front = readFileSync(`content/blog/${f}`, "utf8").replace(/^﻿/, "").split("\n---")[0]
      return !/^date: "\d{4}-\d{2}-\d{2}"$/m.test(front)
    })
    expect(missing, "add the real publish date to these posts").toEqual([])
  })

  it("the generated posts match the content folder, each with a real date", () => {
    expect(BLOG_POSTS.length).toBe(MDX.length)
    for (const p of BLOG_POSTS) expect(p.publishedAt, p.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("blog byline", () => {
  it("every generated post has an author", () => {
    for (const p of BLOG_POSTS) expect(p.author, p.slug).toBeTruthy()
  })

  it("the post page reads the author from the post, not a hard-coded name", () => {
    const page = readFileSync("app/blog/[slug]/page.tsx", "utf8")
    expect(page).toContain("author={post.author}")
    expect(page).not.toMatch(/\bauthor="/)
  })
})
