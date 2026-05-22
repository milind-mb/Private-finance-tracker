import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen pb-16 md:pb-0 md:pl-56">
          <Navigation />
          <main className="max-w-2xl mx-auto px-4 pt-4 pb-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
