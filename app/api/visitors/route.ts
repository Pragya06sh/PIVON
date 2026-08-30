import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  event: z.enum(["session_start", "session_end"]),
  scrollDepth: z.number().min(0).max(100).optional(),
  durationMs: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const body = safeParseJSON(raw);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  try {
    await prisma.visitorEvent.create({
      data: {
        event: parsed.data.event,
        scrollDepth: parsed.data.scrollDepth ?? null,
        durationMs: parsed.data.durationMs ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
        ip,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Visitor event tracking error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

function safeParseJSON(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
