import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ExamForge — AI Exam Question Generator",
  description:
    "Generate professional exam question papers instantly using AI. Upload your syllabus, textbooks, and past papers for curriculum-aligned questions.",
  keywords: ["exam generator", "question paper", "AI education", "LangGraph", "Gemini"],
  authors: [{ name: "ExamForge" }],
  openGraph: {
    title: "ExamForge — AI Exam Question Generator",
    description: "Generate professional exam papers with AI in minutes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d1b3e",
              color: "#f1f5f9",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#0d1b3e" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#0d1b3e" } },
          }}
        />
      </body>
    </html>
  );
}
