"use client";

import Link from "next/link";
import { LogoIcon } from "./Logo";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Ekstraher" },
  { href: "/maler", label: "Maler" },
  { href: "/historikk", label: "Historikk" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface-raised/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <LogoIcon className="h-8 w-8 transition-transform group-hover:scale-110" />
              <div className="absolute -inset-1 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tracking-tight text-primary">
                ARGON
              </span>
              <span className="text-lg font-light text-text-light tracking-wide">
                Docs
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-text-light rounded-lg transition-all hover:text-text hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-text-light">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            AI Klar
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-light hover:text-text"
            aria-label="Meny"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border-subtle">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-text-light hover:text-text hover:bg-surface rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
