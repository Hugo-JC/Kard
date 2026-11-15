import { NextRequest, NextResponse } from "next/server"

const CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")
  if (!token || !token.startsWith("Bearer ")) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  const timeMin =
    req.nextUrl.searchParams.get("timeMin") ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const url = new URL(CALENDAR_BASE_URL)
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy", "startTime")
  url.searchParams.set("maxResults", "30")
  url.searchParams.set("timeMin", timeMin)

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

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")
  if (!token || !token.startsWith("Bearer ")) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  const body = (await req.json()) as {
    summary?: string
    description?: string
    startDateTime?: string
    endDateTime?: string
    allDayDate?: string
    timeZone?: string
  }

  if (!body?.summary?.trim()) {
    return NextResponse.json({ error: "MISSING_SUMMARY" }, { status: 400 })
  }

  const eventPayload = body.allDayDate
    ? {
        summary: body.summary.trim(),
        description: body.description?.trim() || "Criado pelo Kard",
        start: { date: body.allDayDate },
        end: { date: body.allDayDate },
      }
    : {
        summary: body.summary.trim(),
        description: body.description?.trim() || "Criado pelo Kard",
        start: {
          dateTime: body.startDateTime,
          timeZone: body.timeZone || "America/Sao_Paulo",
        },
        end: {
          dateTime: body.endDateTime,
          timeZone: body.timeZone || "America/Sao_Paulo",
        },
      }

  const res = await fetch(CALENDAR_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventPayload),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  return NextResponse.json(data, { status: 201 })
}
