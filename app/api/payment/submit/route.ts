import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLAN_AMOUNTS: Record<string, number> = {
  Trial: 999,
  Starter: 18000,
  Growth: 35000,
};

const submitSchema = z.object({
  plan: z.enum(["Trial", "Starter", "Growth"]),
  upiTransactionId: z
    .string()
    .min(4, "Transaction ID must be at least 4 characters")
    .max(100),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a payment" },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    if (!userId) {
      return NextResponse.json(
        { error: "Session error — please log out and log in again" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment data", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { plan, upiTransactionId } = parsed.data;
    const amount = PLAN_AMOUNTS[plan];

    // Check if user already has a verified payment
    const existingVerified = await prisma.payment.findFirst({
      where: { userId, status: "VERIFIED" },
    });

    if (existingVerified) {
      return NextResponse.json(
        { error: "You already have an active verified payment" },
        { status: 409 }
      );
    }

    // Check if there's already a pending payment with the same transaction ID
    const existingPending = await prisma.payment.findFirst({
      where: { userId, status: "PENDING" },
    });

    if (existingPending) {
      // Update the existing pending payment
      const updated = await prisma.payment.update({
        where: { id: existingPending.id },
        data: { plan, amount, upiTransactionId },
      });

      return NextResponse.json(
        {
          ok: true,
          message: "Payment details updated. Awaiting admin verification.",
          payment: {
            id: updated.id,
            plan: updated.plan,
            amount: updated.amount,
            status: updated.status,
          },
        },
        { status: 200 }
      );
    }

    // Create new payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        plan,
        amount,
        upiTransactionId,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Payment submitted successfully! Our team will verify it within a few hours.",
        payment: {
          id: payment.id,
          plan: payment.plan,
          amount: payment.amount,
          status: payment.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
