import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats — Dashboard statistics.
 * Protected: Only accessible by admin (ADMIN_EMAIL in .env).
 */
export async function GET() {
  // Auth check
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user?.email || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalLeads,
    totalVisitorEvents,
    usersLast24h,
    usersLast7d,
    usersLast30d,
    leadsLast24h,
    leadsLast7d,
    leadsLast30d,
    recentUsers,
    recentLeads,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.visitorEvent.count(),
    prisma.user.count({ where: { createdAt: { gte: last24h } } }),
    prisma.user.count({ where: { createdAt: { gte: last7d } } }),
    prisma.user.count({ where: { createdAt: { gte: last30d } } }),
    prisma.lead.count({ where: { createdAt: { gte: last24h } } }),
    prisma.lead.count({ where: { createdAt: { gte: last7d } } }),
    prisma.lead.count({ where: { createdAt: { gte: last30d } } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.lead.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totals: {
      users: totalUsers,
      leads: totalLeads,
      visitorEvents: totalVisitorEvents,
    },
    trends: {
      users: { last24h: usersLast24h, last7d: usersLast7d, last30d: usersLast30d },
      leads: { last24h: leadsLast24h, last7d: leadsLast7d, last30d: leadsLast30d },
    },
    recent: {
      users: recentUsers,
      leads: recentLeads,
    },
  });
}
