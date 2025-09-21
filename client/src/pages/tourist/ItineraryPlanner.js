import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ItineraryPlanner = () => {
  const { api } = useAuth();
  const [destination, setDestination] = useState('Ranchi');
  const [duration, setDuration] = useState(3);
  const [interests, setInterests] = useState('culture, food, nature');
  const [travelStyle, setTravelStyle] = useState('cultural');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/itinerary', {
        destination,
        duration: Number(duration),
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
        travelStyle
      });
      setPlan(res.data?.data?.itinerary || null);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Itinerary Planner</h1>

        <form onSubmit={submit} className="card p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input" value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder="Destination" />
          <input className="input" type="number" min="1" max="30" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="Days" />
          <input className="input md:col-span-2" value={interests} onChange={(e)=>setInterests(e.target.value)} placeholder="Interests (comma separated)" />
          <select className="input" value={travelStyle} onChange={(e)=>setTravelStyle(e.target.value)}>
            {['budget','luxury','adventure','cultural','eco-friendly'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn-primary">{loading ? 'Generating...' : 'Generate Plan'}</button>
        </form>

        {plan && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Suggested Itinerary for {plan.destination || destination}</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {plan.content || JSON.stringify(plan, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPlanner;
