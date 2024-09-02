'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from './components/Calendar';
import ShoppingList from './components/ShoppingList';
import LogoutButton from './components/LogoutButton';

export default function Home() {
  const [view, setView] = useState<'both' | 'calendar' | 'shopping'>('both');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.name) {
      document.title = `${session.user.name}'s OverLord`;
    }
  }, [status, router, session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-white">{session.user.name}'s OverLord</h1>
        <LogoutButton />
      </div>
=======
import { useState } from 'react';
import Calendar from './components/Calendar';
import ShoppingList from './components/ShoppingList';

export default function Page() {
  const [view, setView] = useState<string>('both'); // New state for managing the current view

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white mb-4">OverLord</h1>
>>>>>>> b3238c8eeff0561bcaeb0f06f18f9ef03691da46
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setView('both')}
          className={`px-4 py-2 rounded-full ${view === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
<<<<<<< HEAD
          Vis begge
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-full ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis kalender
=======
          Begge
        </button>
        <button
          onClick={() => setView('notes')}
          className={`px-4 py-2 rounded-full ${view === 'notes' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Notater
>>>>>>> b3238c8eeff0561bcaeb0f06f18f9ef03691da46
        </button>
        <button
          onClick={() => setView('shopping')}
          className={`px-4 py-2 rounded-full ${view === 'shopping' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
<<<<<<< HEAD
          Vis handleliste
        </button>
      </div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {(view === 'both' || view === 'calendar') && (
          <div className={`w-full ${view === 'both' ? 'md:w-1/2' : ''}`}>
            <Calendar />
          </div>
        )}
        {(view === 'both' || view === 'shopping') && (
          <div className={`w-full ${view === 'both' ? 'md:w-1/2' : ''}`}>
            <ShoppingList />
          </div>
        )}
      </div>
=======
          Handleliste
        </button>
      </div>
      {view === 'both' && (
        <>
          <Calendar />
          <ShoppingList />
        </>
      )}
      {view === 'notes' && <Calendar />}
      {view === 'shopping' && <ShoppingList />}
>>>>>>> b3238c8eeff0561bcaeb0f06f18f9ef03691da46
    </div>
  );
}
