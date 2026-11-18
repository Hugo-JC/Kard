import { NextResponse } from "next/server"
import { isR2Configured } from "@/lib/server/r2Client"

export async function GET() {
  return NextResponse.json({
    configured: isR2Configured(),
  })
}
