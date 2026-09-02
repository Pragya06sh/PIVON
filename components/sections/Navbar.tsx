"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Results", href: "#results" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

type NavbarProps = {
  onOpenAuth?: (mode?: "signup" | "signin", plan?: string) => void;
};

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToSection(href: string) {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <nav
      ref={navRef}
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
    >
      <div className="navbar__inner">
        {/* Brand */}
        <a
          href="#"
          className="navbar__brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          PIVON
        </a>

        {/* Desktop links */}
        <div className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="navbar__link"
            >
              {link.label}
            </a>
          ))}
          {session?.user && (
            <Link href="/automation" className="navbar__link text-signal-bright font-mono">
              Try Automation
            </Link>
          )}
          {session?.user?.email &&
            ["pivon.agency@gmail.com", "admin@pivon.ai"].includes(session.user.email.toLowerCase()) && (
            <Link href="/admin" className="navbar__link text-brass-bright font-mono">
              Admin Portal
            </Link>
          )}
        </div>

        {/* Auth & CTA Actions */}
        <div className="navbar__actions flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-ink-muted hidden md:inline">
                Hi, {session.user.name?.split(" ")[0] || "User"}
              </span>
              <Link
                href="/automation"
                className="navbar__cta text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <span>⚡</span> Try Automation
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.("signin")}
                className="navbar__link px-3 py-1.5 cursor-pointer text-xs uppercase tracking-wider"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth?.("signup")}
                className="navbar__cta cursor-pointer"
              >
                Register / Try Now
              </button>
            </div>
          )}

          {/* Mobile burger */}
          <button
            className="navbar__burger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`navbar__burger-line ${mobileOpen ? "navbar__burger-line--open" : ""}`} />
            <span className={`navbar__burger-line ${mobileOpen ? "navbar__burger-line--open" : ""}`} />
            <span className={`navbar__burger-line ${mobileOpen ? "navbar__burger-line--open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="navbar__mobile"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="navbar__mobile-link"
              >
                {link.label}
              </a>
            ))}

            {session?.user ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-obsidian-line">
                <Link
                  href="/automation"
                  onClick={() => setMobileOpen(false)}
                  className="navbar__mobile-link text-signal-bright font-mono"
                >
                  ⚡ Try Automation
                </Link>
                {session?.user?.email?.toLowerCase() === "pivon.agency@gmail.com" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="navbar__mobile-link text-brass-bright font-mono"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="navbar__mobile-cta"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth?.("signin");
                  }}
                  className="navbar__mobile-link text-left"
                >
                  Sign In to Account
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth?.("signup");
                  }}
                  className="navbar__mobile-cta"
                >
                  Register / Try Now — ₹999
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
