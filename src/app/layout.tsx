import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Breach",
    default: "Breach — Ask anything, anywhere",
  },
  description:
    "Breach is a location-based Q&A community. Ask questions about any place and get answers from people who've been there.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-breach-dark text-breach-text min-h-screen">
        <Providers>
          <Navbar />
          <main className="pt-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
