import { NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { getProject } from "@/lib/studio"

export async function POST(request: Request) {
  const body = await request.json()
  const { project: projectSlug, path: filePath, rating } = body as {
    project: string
    path: string
    rating: 1 | -1 | null
  }

  if (!projectSlug || !filePath) {
    return NextResponse.json({ error: "Missing project or path" }, { status: 400 })
  }

  if (rating !== 1 && rating !== -1 && rating !== null) {
    return NextResponse.json({ error: "Rating must be 1, -1, or null" }, { status: 400 })
  }

  const project = getProject(projectSlug)
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const absPath = path.join(project.root, ".sherpa", "research", filePath)

  // Prevent path traversal
  if (!absPath.startsWith(path.join(project.root, ".sherpa", "research"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const raw = fs.readFileSync(absPath, "utf-8")
  const { data, content } = matter(raw)

  if (rating === null) {
    delete data.rating
  } else {
    data.rating = rating
  }

  const updated = matter.stringify(content, data)
  fs.writeFileSync(absPath, updated, "utf-8")

  return NextResponse.json({ ok: true, rating })
}
