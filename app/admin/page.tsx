"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

const ADMIN_EMAIL = "pivon.agency@gmail.com";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  business: string | null;
  motive: string | null;
  createdAt: string;
};

type LeadRecord = {
  id: string;
  name: string;
  email: string | null;
  company: string;
  phone: string;
  location: string | null;
  business: string | null;
  motive: string | null;
  intent: string | null;
  source: string;
  createdAt: string;
};

type PaymentRecord = {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  upiTransactionId: string;
  status: string;
  createdAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  user: {
    name: string;
    email: string;
    phone: string | null;
    business: string | null;
  };
};

type AdminStats = {
  totals: {
    users: number;
    leads: number;
    visitorEvents: number;
  };
  trends: {
    users: { last24h: number; last7d: number; last30d: number };
    leads: { last24h: number; last7d: number; last30d: number };
  };
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"users" | "leads" | "payments">("payments");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      fetchAdminData();
    }
  }, [status, session]);

  async function fetchAdminData() {
    setLoading(true);
    try {
      const [statsRes, usersRes, leadsRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/leads"),
        fetch("/api/admin/payments"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }
      if (leadsRes.ok) {
        const lData = await leadsRes.json();
        setLeads(lData.leads || []);
      }
      if (paymentsRes.ok) {
        const pData = await paymentsRes.json();
        setPayments(pData.payments || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentAction(paymentId: string, action: "verify" | "reject") {
    setActionLoading(paymentId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action }),
      });

      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error("Payment action failed:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-obsidian text-ink flex items-center justify-center">
        <p className="font-mono text-brass-bright animate-pulse">Loading Admin Portal...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-obsidian text-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 border border-brass/40">
          <h1 className="font-display text-2xl text-ink mb-2">Admin Portal Login</h1>
          <p className="text-sm text-ink-muted mb-6">
            Please sign in with your administrative account (<span className="text-brass-bright font-mono">{ADMIN_EMAIL}</span>) to access client details & stats.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/admin"
            className="btn-primary w-full justify-center text-center block"
          >
            Sign In as Admin →
          </Link>
          <Link href="/" className="inline-block mt-4 text-xs font-mono text-ink-faint hover:text-brass">
            ← Return to Website
          </Link>
        </div>
      </div>
    );
  }

  const isUserAdmin = session.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-obsidian text-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 border border-red-500/40">
          <div className="text-red-400 text-3xl mb-2">🔒 Access Denied</div>
          <h1 className="font-display text-xl text-ink mb-2">Admin Portal Restricted</h1>
          <p className="text-sm text-ink-muted mb-4">
            You are currently signed in as <strong className="text-ink font-mono">{session.user?.email}</strong> (Customer Account).
          </p>
          <p className="text-xs text-ink-faint mb-6">
            Only the administrative account (<strong className="text-brass-bright font-mono">{ADMIN_EMAIL}</strong>) is authorized to access client records and dashboard analytics.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-primary w-full justify-center text-xs py-3"
            >
              Sign Out & Switch Account
            </button>
            <Link href="/" className="text-xs font-mono text-ink-faint hover:text-brass">
              ← Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.location && u.location.toLowerCase().includes(search.toLowerCase())) ||
      (u.business && u.business.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-obsidian text-ink p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-obsidian-line mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="eyebrow eyebrow--green">Admin Control Panel</span>
              <span className="text-xs font-mono text-ink-faint">Logged in as {session.user?.email}</span>
            </div>
            <h1 className="font-display text-3xl text-ink mt-1">PIVON Client & Lead Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAdminData} className="btn-secondary text-xs py-2 px-4">
              🔄 Refresh Data
            </button>
            <Link href="/" className="btn-secondary text-xs py-2 px-4">
              ← Main Site
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5 border-brass/30">
              <p className="eyebrow text-brass-bright mb-1">Total Registered Users</p>
              <p className="font-display text-4xl text-brass-bright">{stats.totals.users}</p>
              <p className="text-xs font-mono text-ink-muted mt-2">
                +{stats.trends.users.last24h} new in last 24h | +{stats.trends.users.last7d} in 7 days
              </p>
            </div>

            <div className="glass-card p-5 border-signal/30">
              <p className="eyebrow text-signal-bright mb-1">Total Leads Captured</p>
              <p className="font-display text-4xl text-signal-bright">{stats.totals.leads}</p>
              <p className="text-xs font-mono text-ink-muted mt-2">
                +{stats.trends.leads.last24h} new in last 24h | +{stats.trends.leads.last7d} in 7 days
              </p>
            </div>

            <div className="glass-card p-5">
              <p className="eyebrow text-ink-muted mb-1">Visitor Sessions</p>
              <p className="font-display text-4xl text-ink">{stats.totals.visitorEvents}</p>
              <p className="text-xs font-mono text-ink-muted mt-2">Tracked engagement events</p>
            </div>
          </div>
        )}

        {/* Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-obsidian-raised p-1 rounded-lg border border-obsidian-line w-fit">
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-5 py-2 rounded-md font-mono text-xs tracking-wider transition-all relative ${
                activeTab === "payments"
                  ? "bg-brass text-obsidian font-bold shadow"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              UPI Payments ({payments.length})
              {payments.filter((p) => p.status === "PENDING").length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-signal-bright text-obsidian text-[10px] font-bold">
                  {payments.filter((p) => p.status === "PENDING").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-5 py-2 rounded-md font-mono text-xs tracking-wider transition-all ${
                activeTab === "users"
                  ? "bg-brass text-obsidian font-bold shadow"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Registered Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-5 py-2 rounded-md font-mono text-xs tracking-wider transition-all ${
                activeTab === "leads"
                  ? "bg-brass text-obsidian font-bold shadow"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Leads Captured ({leads.length})
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name, email, phone, UPI ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-field__input max-w-sm text-xs"
          />
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-ink-muted font-mono text-xs animate-pulse">
            Fetching latest records...
          </div>
        ) : activeTab === "payments" ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client / Builder</th>
                  <th>Contact Info</th>
                  <th>Plan &amp; Amount</th>
                  <th>UPI Transaction ID</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-ink-muted font-mono">
                      No UPI payments received yet.
                    </td>
                  </tr>
                ) : (
                  payments
                    .filter(
                      (p) =>
                        p.user.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.user.email.toLowerCase().includes(search.toLowerCase()) ||
                        p.upiTransactionId.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((p) => {
                      const cleanPhone = p.user.phone?.replace(/[^0-9]/g, "") || "";
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="font-semibold text-ink">{p.user.name}</div>
                            <div className="text-xs text-ink-muted font-mono">{p.user.email}</div>
                            {p.user.business && (
                              <div className="text-[11px] text-ink-faint">{p.user.business}</div>
                            )}
                          </td>
                          <td className="font-mono text-xs">{p.user.phone || "N/A"}</td>
                          <td>
                            <span className="font-semibold text-ink">{p.plan} Plan</span>
                            <div className="text-xs font-mono font-bold text-brass-bright">
                              ₹{p.amount.toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td>
                            <code className="bg-obsidian-raised px-2 py-1 rounded text-xs font-mono text-brass-bright select-all border border-obsidian-line">
                              {p.upiTransactionId}
                            </code>
                          </td>
                          <td>
                            <span
                              className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                                p.status === "VERIFIED"
                                  ? "bg-signal/20 text-signal-bright border border-signal/40"
                                  : p.status === "REJECTED"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="font-mono text-xs text-ink-faint">
                            {new Date(p.createdAt).toLocaleDateString()}{" "}
                            {new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {p.status !== "VERIFIED" && (
                                <button
                                  onClick={() => handlePaymentAction(p.id, "verify")}
                                  disabled={actionLoading === p.id}
                                  className="px-2.5 py-1 rounded bg-signal text-ink font-bold text-xs hover:bg-signal-bright transition-colors"
                                >
                                  {actionLoading === p.id ? "..." : "✓ Approve"}
                                </button>
                              )}
                              {p.status !== "REJECTED" && (
                                <button
                                  onClick={() => handlePaymentAction(p.id, "reject")}
                                  disabled={actionLoading === p.id}
                                  className="px-2.5 py-1 rounded bg-red-900/40 text-red-300 hover:bg-red-900/80 text-xs transition-colors"
                                >
                                  ✕ Reject
                                </button>
                              )}
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(
                                    p.user.name
                                  )},%20regarding%20your%20PIVON%20${p.plan}%20payment.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="wa-btn"
                                >
                                  💬 WA
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "users" ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact info</th>
                  <th>Location</th>
                  <th>Business / Builder</th>
                  <th>Primary Motive / Requirement</th>
                  <th>Registered Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-ink-muted font-mono">
                      No registered users found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const cleanPhone = u.phone?.replace(/[^0-9]/g, "") || "";
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="font-semibold text-ink">{u.name}</div>
                          <div className="text-xs text-ink-muted font-mono">{u.email}</div>
                        </td>
                        <td className="font-mono text-xs">{u.phone || "N/A"}</td>
                        <td>{u.location || "N/A"}</td>
                        <td className="font-semibold">{u.business || "N/A"}</td>
                        <td className="max-w-xs text-xs text-ink-muted leading-relaxed">
                          {u.motive || "N/A"}
                        </td>
                        <td className="font-mono text-xs text-ink-faint">
                          {new Date(u.createdAt).toLocaleDateString()} {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(u.name)},%20thank%20you%20for%20registering%20on%20PIVON!`}
                              target="_blank"
                              rel="noreferrer"
                              className="wa-btn"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Company / Builder</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Project Interest</th>
                  <th>Source</th>
                  <th>Submitted Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-ink-muted font-mono">
                      No leads found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => {
                    const cleanPhone = l.phone?.replace(/[^0-9]/g, "") || "";
                    return (
                      <tr key={l.id}>
                        <td className="font-semibold">{l.name}</td>
                        <td>{l.company}</td>
                        <td className="font-mono text-xs">{l.phone}</td>
                        <td className="font-mono text-xs text-ink-muted">{l.email || "N/A"}</td>
                        <td className="text-xs text-brass-bright">{l.intent || "Landing Demo"}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded bg-obsidian-line font-mono text-[10px] uppercase">
                            {l.source}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-ink-faint">
                          {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(l.name)},%20following%20up%20from%20PIVON.`}
                              target="_blank"
                              rel="noreferrer"
                              className="wa-btn"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
