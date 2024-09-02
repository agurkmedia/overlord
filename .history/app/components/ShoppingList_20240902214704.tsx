
'use client';

import { useState, useEffect } from 'react';

export default function ShoppingList() {
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [itemName, setItemName] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTop, setModalTop] = useState<number>(0);

  useEffect(() => {
    fetchShoppingList();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isModalOpen) {
        setModalTop(window.scrollY + 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isModalOpen]);

  async function fetchShoppingList() {
    const response = await fetch('/api/shoppingItems');
    if (response.ok) {
      const shoppingList = await response.json();
      setShoppingList(shoppingList);
    } else if (response.status === 401) {
      console.error('Unauthorized access');
      // Handle unauthorized access (e.g., redirect to login)
    } else {
      console.error('Failed to fetch shopping list');
    }
  }

  async function addOrUpdateItem(e: React.FormEvent) {
    e.preventDefault();
    const method = editItemId ? 'PATCH' : 'POST';
    const body = editItemId
      ? JSON.stringify({ id: editItemId, name: itemName, quantity: itemQuantity })
      : JSON.stringify({ name: itemName, quantity: itemQuantity });

    const response = await fetch('/api/shoppingItems', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (response.ok) {
      setItemName('');
      setItemQuantity(1);
      setEditItemId(null);
      fetchShoppingList();
      setIsModalOpen(false);
    } else {
      console.error('Failed to add/update item');
    }
  }

  async function toggleItemCompletion(id: string, completed: boolean) {
    const response = await fetch('/api/shoppingItems', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    });

    if (response.ok) {
      fetchShoppingList();
    } else {
      console.error('Failed to toggle item completion');
    }
  }

  async function deleteItem(id: string) {
    const response = await fetch(`/api/shoppingItems`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchShoppingList();
    } else {
      console.error('Failed to delete item');
    }
  }

  function editItem(item: any) {
    setEditItemId(item.id);
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setModalTop(window.scrollY + 50);
    setIsModalOpen(true);
  }

  function openAddItemModal() {
    setEditItemId(null);
    setItemName('');
    setItemQuantity(1);
    setModalTop(window.scrollY + 50);
    setIsModalOpen(true);
  }

  const allItemsCompleted = shoppingList.length > 0 && shoppingList.every(item => item.completed);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-4">Handleliste</h2>
      <div className="sm:hidden mb-4">
        <button
          onClick={openAddItemModal}
          className="w-full px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Legg til nytt element
        </button>
      </div>
      <form onSubmit={addOrUpdateItem} className="hidden sm:flex space-x-2 mb-4">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="flex-grow px-4 py-2 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Element navn"
        />
        <input
          type="number"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(Number(e.target.value))}
          className="px-4 py-2 rounded-full bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Mengde"
          min="1"
        />
        <button type="submit" className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
          {editItemId ? 'Oppdater element' : 'Legg til element'}
        </button>
      </form>
      <div className={`flex-grow overflow-y-auto rounded-lg transition-colors relative ${allItemsCompleted ? 'bg-green-400/50' : ''}`}>
        <ul className="space-y-2">
          {shoppingList.map((item: any) => (
            <li
              key={item.id}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                item.completed ? 'bg-green-400/50' : 'bg-white/50'
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItemCompletion(item.id, !item.completed)}
                className="form-checkbox h-5 w-5 text-purple-600"
              />
              <span className={item.completed ? 'line-through' : ''}>{item.name} - {item.quantity}</span>
              <button onClick={() => editItem(item)} className="text-blue-500 hover:underline">Rediger</button>
              <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:underline">Slett</button>
            </li>
          ))}
        </ul>
        {allItemsCompleted && shoppingList.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex space-x-4">
              <span className="text-6xl opacity-80 shadow-lg">💸</span>
              <span className="text-6xl opacity-80 shadow-lg">💸</span>
              <span className="text-6xl opacity-80 shadow-lg">💸</span>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" style={{ top: modalTop }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold mb-4">{editItemId ? 'Rediger element' : 'Legg til nytt element'}</h3>
            <form onSubmit={addOrUpdateItem} className="space-y-4">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Element navn"
              />
              <input
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Mengde"
                min="1"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                  {editItemId ? 'Oppdater' : 'Legg til'}
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