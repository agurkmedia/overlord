'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function TitleUpdater() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.name) {
      document.title = `${session.user.name}'s OverLord`;
    }
  }, [session]);

  return null;
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <TitleUpdater />
      <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen">
        <div className="container mx-auto p-4">
          <main className="backdrop-blur-lg bg-white/30 rounded-lg shadow-lg p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}