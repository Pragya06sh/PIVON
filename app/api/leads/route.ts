import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().optional(),
  company: z.string().min(1).max(160),
  phone: z.string().min(6).max(20),
  location: z.string().max(200).optional(),
  business: z.string().max(200).optional(),
  motive: z.string().max(1000).optional(),
  intent: z.string().max(500).optional(),
  engagement: z
    .object({
      page: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
});

// Simple in-memory rate limiter (per IP, 10 submissions per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lead payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, company, phone, location, business, motive, intent, engagement } =
    parsed.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email ?? null,
        company,
        phone,
        location: location ?? null,
        business: business ?? null,
        motive: motive ?? null,
        intent: intent ?? null,
        source: engagement?.source ?? "landing",
      },
    });

    // Fire-and-forget notification email — never block the response on this.
    notifyTeam(lead).catch((err) =>
      console.error("Resend notification failed:", err)
    );

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { error: "Failed to save lead. Please try again." },
      { status: 500 }
    );
  }
}

async function notifyTeam(lead: {
  name: string;
  email: string | null;
  company: string;
  phone: string;
  location: string | null;
  business: string | null;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.PIVON_TEAM_EMAIL) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "PIVON <leads@pivon.ai>",
    to: process.env.PIVON_TEAM_EMAIL,
    subject: `New qualified lead: ${lead.name} (${lead.company})`,
    text: [
      `${lead.name} from ${lead.company} just submitted the demo form.`,
      `Phone: ${lead.phone}`,
      lead.email ? `Email: ${lead.email}` : null,
      lead.location ? `Location: ${lead.location}` : null,
      lead.business ? `Business: ${lead.business}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
