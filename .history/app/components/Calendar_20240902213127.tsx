
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';

export default function Calendar() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTime, setNoteTime] = useState<string>('');
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [isAscending, setIsAscending] = useState<boolean>(true); // New state for sort order
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // New state for modal visibility
  const [modalTop, setModalTop] = useState<number>(0); // New state for modal top position
  const [displayAll, setDisplayAll] = useState<boolean>(true); // New state for display mode
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'daily'>('all');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteModalTop, setDeleteModalTop] = useState<number>(0);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isModalOpen) {
        setModalTop(window.scrollY + 50); // Adjust the modal top position
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isModalOpen]);

  async function fetchNotes() {
    const response = await fetch('/api/calendarNotes');
    if (response.ok) {
      const notes = await response.json();
      setNotes(notes);
    } else if (response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access');
    } else {
      console.error('Failed to fetch notes');
    }
  }

  async function fetchTodayNotes() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Henter notater for i dag: ${today}`);
    const response = await fetch(`/api/calendarNotes?startDate=${today}&endDate=${today}`);
    const notes = await response.json();
    console.log('Notater for i dag:', notes);
    setNotes(notes);
  }

  async function addOrUpdateNote(e: React.FormEvent) {
    e.preventDefault();
    const method = editNoteId ? 'PUT' : 'POST';
    const body = editNoteId
      ? JSON.stringify({ id: editNoteId, date: selectedDate, time: noteTime, content: noteContent })
      : JSON.stringify({ date: selectedDate, time: noteTime, content: noteContent });

    const response = await fetch('/api/calendarNotes', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (response.ok) {
      setNoteContent('');
      setNoteTime('');
      setSelectedDate(new Date());
      setEditNoteId(null);
      fetchNotes();
      setIsModalOpen(false);
    } else {
      console.error('Failed to add/update note');
    }
  }

  async function toggleNoteCompletion(id: string, completed: boolean) {
    await fetch('/api/calendarNotes', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, completed }),
    });
    fetchNotes();
  }

  function editNote(note: any) {
    setEditNoteId(note.id);
    setSelectedDate(new Date(note.date));
    setNoteTime(note.time);
    setNoteContent(note.content);
    setModalTop(window.scrollY + 50); // Adjust the modal top position
    setIsModalOpen(true); // Open the modal for editing
  }

  function openAddNoteModal() {
    setEditNoteId(null);
    setNoteContent('');
    setNoteTime('');
    setSelectedDate(new Date()); // Reset the selected date to today
    setModalTop(window.scrollY + 50); // Adjust the modal top position
    setIsModalOpen(true); // Open the modal for adding a new note
  }

  function groupNotesByDate(notes: any[]) {
    return notes.reduce((groups: { [key: string]: any[] }, note: any) => {
      const date = note.date.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {});
  }

  function getDayName(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { weekday: 'long' });
  }

  const groupedNotes = groupNotesByDate(notes);

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  function handleDisplayToday() {
    setViewMode('today');
    setDisplayAll(false);
    fetchTodayNotes();
  }

  function handleDisplayAll() {
    setViewMode('all');
    setDisplayAll(true);
    fetchNotes();
  }

  function handleDisplayDaily() {
    setViewMode('daily');
    setCurrentDate(new Date());
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => changeDate(1),
    onSwipedRight: () => changeDate(-1),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 50, // Minimum swipe distance (in pixels) to trigger the event
    swipeDuration: 500, // Maximum time (in ms) to swipe
    touchEventOptions: { passive: false }, // Prevent default touch behavior
  });

  function changeDate(days: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async function deleteNote(id: string) {
    const response = await fetch('/api/calendarNotes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchNotes();
      setIsDeleteModalOpen(false);
      setDeleteNoteId(null);
    } else {
      console.error('Failed to delete note');
    }
  }

  function openDeleteConfirmation(id: string) {
    setDeleteNoteId(id);
    setDeleteModalTop(window.scrollY + 50); // Set the modal top position
    setIsDeleteModalOpen(true);
  }

  function renderNoteItem(note: any) {
    return (
      <li
        key={note.id}
        className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
          note.completed ? 'bg-green-400/50' : 'bg-white/50'
        }`}
      >
        <input
          type="checkbox"
          checked={note.completed}
          onChange={() => toggleNoteCompletion(note.id, !note.completed)}
          className="form-checkbox h-5 w-5 text-purple-600"
        />
        <span className={note.completed ? 'line-through' : ''}>{note.time} - {note.content}</span>
        <button onClick={() => editNote(note)} className="text-blue-500 hover:underline">Rediger</button>
        <button onClick={() => openDeleteConfirmation(note.id)} className="text-red-500 hover:underline">Slett</button>
      </li>
    );
  }

  function renderDailyView() {
    const dateString = formatDate(currentDate);
    const dayNotes = groupedNotes[dateString] || [];

    return (
      <div
        {...handlers}
        className="h-full flex flex-col"
      >
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => changeDate(-1)} className="text-2xl">←</button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('no-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <button onClick={() => changeDate(1)} className="text-2xl">→</button>
        </div>
        <ul className="space-y-2 overflow-y-auto">
          {dayNotes.sort((a: any, b: any) => a.time.localeCompare(b.time)).map(renderNoteItem)}
        </ul>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Kalender Notater</h2>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleDisplayToday}
          className={`px-4 py-2 rounded-full ${viewMode === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis i dag
        </button>
        <button
          onClick={handleDisplayAll}
          className={`px-4 py-2 rounded-full ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis alle
        </button>
        <button
          onClick={handleDisplayDaily}
          className={`px-4 py-2 rounded-full ${viewMode === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Dag for dag
        </button>
      </div>
      <div className="sm:hidden mb-4">
        <button
          onClick={openAddNoteModal}
          className="w-full px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Legg til nytt notat
        </button>
      </div>
      <form onSubmit={addOrUpdateNote} className="hidden sm:flex space-x-2 mb-4">
        <input
          type="time"
          value={noteTime}
          onChange={(e) => setNoteTime(e.target.value)}
          className="px-4 py-2 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="text"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="flex-grow px-4 py-2 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Legg til nytt notat..."
        />
        <button type="submit" className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
          {editNoteId ? 'Oppdater notat' : 'Legg til notat'}
        </button>
      </form>
      <button onClick={toggleSortOrder} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-4">
        {isAscending ? 'Sorter synkende' : 'Sorter stigende'}
      </button>
      {viewMode === 'daily' ? (
        renderDailyView()
      ) : (
        <div className="overflow-y-auto flex-grow sm:max-h-[48rem] sm:overflow-y-auto">
          {Object.keys(groupedNotes)
            .sort((a, b) => (isAscending ? a.localeCompare(b) : b.localeCompare(a)))
            .map((date) => (
              <div key={date} className="border border-gray-300 rounded-lg p-4 bg-white/50 mb-4">
                <h3 className="text-lg font-semibold mb-2">{date} {getDayName(date)}</h3>
                <ul className="space-y-2">
                  {groupedNotes[date]
                    .sort((a: any, b: any) => a.time.localeCompare(b.time))
                    .map(renderNoteItem)}
                </ul>
              </div>
            ))}
        </div>
      )}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" style={{ top: modalTop }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold mb-4">{editNoteId ? 'Rediger notat' : 'Legg til nytt notat'}</h3>
            <form onSubmit={addOrUpdateNote} className="space-y-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="time"
                value={noteTime}
                onChange={(e) => setNoteTime(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Notat innhold"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  {editNoteId ? 'Oppdater' : 'Legg til'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors">
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" style={{ top: deleteModalTop }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Er du sikker på at du vil slette dette notatet?</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => deleteNote(deleteNoteId!)}
                className="flex-1 px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Ja, slett
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

'use client';

import { useState, useEffect } from 'react';

export default function Calendar() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTime, setNoteTime] = useState<string>('');
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [isAscending, setIsAscending] = useState<boolean>(true); // New state for sort order
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // New state for modal visibility
  const [modalTop, setModalTop] = useState<number>(0); // New state for modal top position
  const [displayAll, setDisplayAll] = useState<boolean>(true); // New state for display mode

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isModalOpen) {
        setModalTop(window.scrollY + 50); // Adjust the modal top position
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isModalOpen]);

  async function fetchNotes() {
    const response = await fetch('/api/calendarNotes');
    const notes = await response.json();
    setNotes(notes);
  }

  async function fetchTodayNotes() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Henter notater for i dag: ${today}`);
    const response = await fetch(`/api/calendarNotes?startDate=${today}&endDate=${today}`);
    const notes = await response.json();
    console.log('Notater for i dag:', notes);
    setNotes(notes);
  }

  async function addOrUpdateNote(e: React.FormEvent) {
    e.preventDefault();
    if (editNoteId) {
      await fetch('/api/calendarNotes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editNoteId, date: selectedDate, time: noteTime, content: noteContent }),
      });
      setEditNoteId(null);
    } else {
      await fetch('/api/calendarNotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate, time: noteTime, content: noteContent }),
      });
    }
    setNoteContent('');
    setNoteTime('');
    setSelectedDate(new Date()); // Reset the selected date to today
    fetchNotes();
    setIsModalOpen(false); // Close the modal after adding/updating a note
  }

  async function toggleNoteCompletion(id: string, completed: boolean) {
    await fetch('/api/calendarNotes', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, completed }),
    });
    fetchNotes();
  }

  function editNote(note: any) {
    setEditNoteId(note.id);
    setSelectedDate(new Date(note.date));
    setNoteTime(note.time);
    setNoteContent(note.content);
    setModalTop(window.scrollY + 50); // Adjust the modal top position
    setIsModalOpen(true); // Open the modal for editing
  }

  function openAddNoteModal() {
    setEditNoteId(null);
    setNoteContent('');
    setNoteTime('');
    setSelectedDate(new Date()); // Reset the selected date to today
    setModalTop(window.scrollY + 50); // Adjust the modal top position
    setIsModalOpen(true); // Open the modal for adding a new note
  }

  function groupNotesByDate(notes: any[]) {
    return notes.reduce((groups: { [key: string]: any[] }, note: any) => {
      const date = note.date.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {});
  }

  function getDayName(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { weekday: 'long' });
  }

  const groupedNotes = groupNotesByDate(notes);

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  function handleDisplayToday() {
    setDisplayAll(false);
    fetchTodayNotes();
  }

  function handleDisplayAll() {
    setDisplayAll(true);
    fetchNotes();
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Kalender Notater</h2>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleDisplayToday}
          className={`px-4 py-2 rounded-full ${!displayAll ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis i dag
        </button>
        <button
          onClick={handleDisplayAll}
          className={`px-4 py-2 rounded-full ${displayAll ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-700 transition-colors`}
        >
          Vis alle
        </button>
      </div>
      <div className="sm:hidden mb-4">
        <button
          onClick={openAddNoteModal}
          className="w-full px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Legg til nytt notat
        </button>
      </div>
      <form onSubmit={addOrUpdateNote} className="hidden sm:flex space-x-2 mb-4">
        <input
          type="time"
          value={noteTime}
          onChange={(e) => setNoteTime(e.target.value)}
          className="px-4 py-2 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="text"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="flex-grow px-4 py-2 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Legg til nytt notat..."
        />
        <button type="submit" className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
          {editNoteId ? 'Oppdater notat' : 'Legg til notat'}
        </button>
      </form>
      <button onClick={toggleSortOrder} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-4">
        {isAscending ? 'Sorter synkende' : 'Sorter stigende'}
      </button>
      <div className="overflow-y-auto flex-grow sm:max-h-[48rem] sm:overflow-y-auto"> {/* Adjusted height */}
        {Object.keys(groupedNotes)
          .sort((a, b) => (isAscending ? a.localeCompare(b) : b.localeCompare(a)))
          .map((date) => (
            <div key={date} className="border border-gray-300 rounded-lg p-4 bg-white/50 mb-4">
              <h3 className="text-lg font-semibold mb-2">{date} {getDayName(date)}</h3>
              <ul className="space-y-2">
                {groupedNotes[date]
                  .sort((a: any, b: any) => a.time.localeCompare(b.time))
                  .map((note: any) => (
                    <li
                      key={note.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                        note.completed ? 'bg-green-400/50' : 'bg-white/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={note.completed}
                        onChange={() => toggleNoteCompletion(note.id, !note.completed)}
                        className="form-checkbox h-5 w-5 text-purple-600"
                      />
                      <span className={note.completed ? 'line-through' : ''}>{note.time} - {note.content}</span>
                      <button onClick={() => editNote(note)} className="text-blue-500 hover:underline">Rediger</button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
      </div>
      {isModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" style={{ top: modalTop }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold mb-4">{editNoteId ? 'Rediger notat' : 'Legg til nytt notat'}</h3>
            <form onSubmit={addOrUpdateNote} className="space-y-4">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="time"
                value={noteTime}
                onChange={(e) => setNoteTime(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Notat innhold"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  {editNoteId ? 'Oppdater' : 'Legg til'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors">
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

}