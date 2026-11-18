import { NextRequest, NextResponse } from "next/server"

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")
  if (!token || !token.startsWith("Bearer ")) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  const search = (req.nextUrl.searchParams.get("q") || "").trim()
  const escaped = search.replace(/'/g, "\\'")
  const queryFilter = escaped
    ? `trashed = false and name contains '${escaped}'`
    : "trashed = false"

  const url = new URL(DRIVE_FILES_URL)
  url.searchParams.set("pageSize", "20")
  url.searchParams.set("orderBy", "modifiedTime desc")
  url.searchParams.set("q", queryFilter)
  url.searchParams.set(
    "fields",
    "files(id,name,mimeType,webViewLink,iconLink,size,modifiedTime)"
  )

  const res = await fetch(url.toString(), {
    headers: { Authorization: token },
    cache: "no-store",
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json(data)
}
