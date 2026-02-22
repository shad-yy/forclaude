// Admin news CRUD endpoints
import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getJwtSecret, hasJwtSecret } from "@/lib/env"
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

interface NewsPost {
  id: string
  title: string
  description: string
  content: string
  image?: string
  author: string
  publishedAt: string
  category: string
  tags: string[]
  featured: boolean
}

const NEWS_FILE = join(process.cwd(), "data", "admin-news.json")

async function verifyDevSession(request: NextRequest): Promise<boolean> {
  try {
    if (!hasJwtSecret()) return false
    const token = request.cookies.get("dev-session")?.value
    if (!token) return false
    const jwtSecret = getJwtSecret()
    await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    return true
  } catch {
    return false
  }
}

function getNewsPosts(): NewsPost[] {
  if (!existsSync(NEWS_FILE)) {
    return []
  }
  try {
    const data = readFileSync(NEWS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

function saveNewsPosts(posts: NewsPost[]) {
  const dir = join(process.cwd(), "data")
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(NEWS_FILE, JSON.stringify(posts, null, 2))
}

export async function GET(request: NextRequest) {
  if (!(await verifyDevSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const posts = getNewsPosts()
  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  if (!(await verifyDevSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, content, image, author, category, tags, featured } = body

    if (!title || !description || !content) {
      return NextResponse.json({ error: "Title, description, and content are required" }, { status: 400 })
    }

    const posts = getNewsPosts()
    const newPost: NewsPost = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      content,
      image,
      author: author || "Admin",
      publishedAt: new Date().toISOString(),
      category: category || "Sports",
      tags: tags || [],
      featured: featured || false,
    }

    posts.unshift(newPost)
    saveNewsPosts(posts)

    return NextResponse.json({ success: true, post: newPost })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create news post" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await verifyDevSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const posts = getNewsPosts()
    const index = posts.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    posts[index] = { ...posts[index], ...updates }
    saveNewsPosts(posts)

    return NextResponse.json({ success: true, post: posts[index] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update news post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyDevSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const posts = getNewsPosts()
    const filtered = posts.filter((p) => p.id !== id)
    saveNewsPosts(filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete news post" }, { status: 500 })
  }
}

