"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Sparkles, Clock } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/generate", label: "Generate" },
    { href: "/library", label: "Reference Library" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="navbar px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "10px",
              padding: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={18} color="white" />
          </div>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "18px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ExamForge
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: pathname === link.href ? "#6366f1" : "#94a3b8",
                background: pathname === link.href ? "rgba(99,102,241,0.1)" : "transparent",
                border: pathname === link.href ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link href="/generate">
          <button className="btn-primary" style={{ padding: "9px 20px", fontSize: "14px" }}>
            <span className="flex items-center gap-2">
              <Sparkles size={15} />
              Generate Paper
            </span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
