import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Server Monitor & CI/CD",
  description: "Nền tảng giám sát máy chủ phần cứng (CPU, GPU, RAM, Pin) và quy trình CI/CD.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="h-full w-full overflow-hidden">
      <body className="h-full w-full overflow-hidden bg-zinc-50 text-zinc-900">
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar />
          <main className="min-w-0 flex-1 h-full overflow-hidden flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
