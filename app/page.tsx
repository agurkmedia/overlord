'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from './components/Calendar';
import ShoppingList from './components/ShoppingList';
import LogoutButton from './components/LogoutButton';
import Link from 'next/link';

export default function Home() {
  const [view, setView] = useState<'both' | 'calendar' | 'shopping'>('both');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for the session to be checked
    }

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.name) {
      document.title = `${session.user.name}'s OverLord`;
      setLoading(false);
    }
  }, [status, router, session]);

  // Add this effect to force a re-render after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust this delay as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to OverLord</h1>
        <div className="space-x-4">
          <Link href="/login" className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors">
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white">{session?.user?.name}'s OverLord</h1>
        <LogoutButton />
      </div>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setView('both')}
          className={`px-4 py-2 rounded-full ${view === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis begge
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-full ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis kalender
        </button>
        <button
          onClick={() => setView('shopping')}
          className={`px-4 py-2 rounded-full ${view === 'shopping' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis handleliste
        </button>
      </div>
      <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4">
        {(view === 'both' || view === 'calendar') && (
          <div className={`w-full ${view === 'both' ? 'xl:w-1/2' : ''}`}>
            <Calendar />
          </div>
        )}
        {(view === 'both' || view === 'shopping') && (
          <div className={`w-full ${view === 'both' ? 'xl:w-1/2' : ''}`}>
            <ShoppingList />
          </div>
        )}
      </div>
    </div>
  );
}
