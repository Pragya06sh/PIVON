import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "pivon.agency@gmail.com";

// GET — List all payments (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            business: true,
          },
        },
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Admin payments fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — Verify or reject a payment (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const { paymentId, action } = body || {};

    if (!paymentId || !["verify", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Provide paymentId and action (verify/reject)." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: action === "verify" ? "VERIFIED" : "REJECTED",
        verifiedAt: new Date(),
        verifiedBy: session.user.email,
      },
    });

    return NextResponse.json({
      ok: true,
      payment: {
        id: updated.id,
        status: updated.status,
        verifiedAt: updated.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Admin payment action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
