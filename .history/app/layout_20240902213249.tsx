import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientLayout from "./ClientLayout";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {

  title: "Welcome", // We'll set a default title here

  title: "OverLord",

  description: "A Next.js app for managing shopping lists and calendar notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      <body className={`${inter.className} bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen`}>
        <div className="container mx-auto p-4">
          <nav className="mb-8">
            {/* Add navigation links here */}
          </nav>
          <main className="backdrop-blur-lg bg-white/30 rounded-lg shadow-lg p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
