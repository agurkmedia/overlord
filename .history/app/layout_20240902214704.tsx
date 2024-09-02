import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Welcome", // We'll set a default title here
  description: "A Next.js app for managing shopping lists and calendar notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
