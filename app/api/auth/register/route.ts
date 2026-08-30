import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  phone: z.string().min(6).max(20).optional(),
  location: z.string().max(200).optional(),
  business: z.string().max(200).optional(),
  motive: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, phone, location, business, motive } =
      parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ?? null,
        location: location ?? null,
        business: business ?? null,
        motive: motive ?? null,
      },
    });

    // Fire-and-forget notification email
    notifyTeam(user.name, user.email, user.phone, user.business).catch(
      (err) => console.error("Registration notification failed:", err)
    );

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function notifyTeam(
  name: string,
  email: string,
  phone: string | null,
  business: string | null
) {
  if (!process.env.RESEND_API_KEY || !process.env.PIVON_TEAM_EMAIL) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "PIVON <leads@pivon.ai>",
    to: process.env.PIVON_TEAM_EMAIL,
    subject: `New user registered: ${name}`,
    text: [
      `${name} just registered on PIVON.`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      business ? `Business: ${business}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
