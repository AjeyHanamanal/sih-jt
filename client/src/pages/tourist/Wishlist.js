import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'wishlist_items';

const Wishlist = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const removeItem = (id) => {
    const next = items.filter(i => i._id !== id);
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center text-gray-600">No items in wishlist.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((i) => (
              <div key={i._id} className="card-hover">
                <img src={i.image} alt={i.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{i.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{i.description}</p>
                  <div className="flex items-center gap-3">
                    <Link to={i.url} className="btn-outline text-sm px-4 py-2">Open</Link>
                    <button onClick={() => removeItem(i._id)} className="btn-primary text-sm px-4 py-2">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
