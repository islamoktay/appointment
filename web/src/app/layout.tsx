import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueBook — Appointment & Queue Booking System",
  description:
    "Real-time appointment scheduling, provider availability configuration, and concurrency-safe queue management.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-brand font-sans">
        <Navbar user={user} />
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-slate-200 bg-white py-5">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-completed sm:flex-row sm:px-6">
            <p>QueueBook — Appointment &amp; Queue Booking Portal</p>
            <p>Timezone-aware scheduling with concurrency-safe slot locking</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
