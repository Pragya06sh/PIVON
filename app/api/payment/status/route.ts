import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    if (!userId) {
      return NextResponse.json(
        { error: "Session error" },
        { status: 401 }
      );
    }

    // Get the latest payment for this user
    const payment = await prisma.payment.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      return NextResponse.json({
        hasPaid: false,
        payment: null,
      });
    }

    return NextResponse.json({
      hasPaid: payment.status === "VERIFIED",
      payment: {
        id: payment.id,
        plan: payment.plan,
        amount: payment.amount,
        status: payment.status,
        upiTransactionId: payment.upiTransactionId,
        createdAt: payment.createdAt,
        verifiedAt: payment.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
