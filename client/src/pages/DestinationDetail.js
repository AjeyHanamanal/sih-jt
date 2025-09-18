import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import baidhnath from './baidhnath.jpg';
import betla from './betla.jpg';

// Prewritten sample reviews per destination id
const PREWRITTEN = {
  '1': [
    {
      _id: 'pr-1-1',
      user: { name: 'Rohit Sharma' },
      rating: { overall: 5 },
      review: { content: 'A divine experience. The morning aarti was mesmerizing and the local prasad was lovely.' },
      sentiment: { label: 'positive', score: 0.82 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
    },
    {
      _id: 'pr-1-2',
      user: { name: 'Priya Verma' },
      rating: { overall: 4 },
      review: { content: 'Beautiful temple architecture. It gets crowded—visit early to avoid queues.' },
      sentiment: { label: 'positive', score: 0.64 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    }
  ],
  '2': [
    {
      _id: 'pr-2-1',
      user: { name: 'Ankit Malhotra' },
      rating: { overall: 5 },
      review: { content: 'Spotted deer and peacocks! The safari guide was knowledgeable and helpful.' },
      sentiment: { label: 'positive', score: 0.78 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
    },
    {
      _id: 'pr-2-2',
      user: { name: 'Nisha Patil' },
      rating: { overall: 4 },
      review: { content: 'Green, serene, and clean. Great for a weekend escape.' },
      sentiment: { label: 'positive', score: 0.6 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString()
    }
  ]
};

const FALLBACKS = [
  {
    _id: '1',
    name: 'Baidyanath Temple',
    shortDescription: 'Famous Hindu temple in Deoghar, known for its spiritual significance and architectural beauty.',
    description: 'One of the twelve Jyotirlingas, a major pilgrimage site. Explore rituals, architecture, and local markets.',
    images: [baidhnath],
    location: { city: 'Deoghar', state: 'Jharkhand', coordinates: { lat: 24.486, lng: 86.695 } },
    category: 'religious',
    rating: { average: 4.8, count: 1240 }
  },
  {
    _id: '2',
    name: 'Betla National Park',
    shortDescription: 'Wildlife sanctuary home to tigers, elephants, and diverse flora and fauna.',
    description: 'Enjoy jungle safaris, birdwatching, and serene landscapes with expert guides.',
    images: [betla],
    location: { city: 'Palamu', state: 'Jharkhand', coordinates: { lat: 23.866, lng: 84.199 } },
    category: 'wildlife',
    rating: { average: 4.6, count: 890 }
  }
];

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  // Local state hooks must be declared before any conditional returns
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [localReviews, setLocalReviews] = useState([]);

  // Helper to detect mongo id
  const isMongoId = (val) => /^[a-f\d]{24}$/i.test(val || '');

  // Fetch destination (always call hook unconditionally)
  const destinationQuery = useQuery(
    ['destination', id || 'unknown'],
    async () => {
      try {
        if (!id) return null;
        const res = await api.get(`/destinations/${id}`);
        return res.data?.data?.destination;
      } catch (e) {
        return FALLBACKS.find(d => d._id === id) || null;
      }
    },
    { refetchOnWindowFocus: false }
  );

  // Fetch reviews (still called unconditionally)
  const feedbackQuery = useQuery(
    ['feedback', id || 'unknown'],
    async () => {
      if (!id) return [];
      const res = await api.get('/feedback', {
        params: { targetType: 'destination', targetId: id, limit: 10 }
      });
      return res.data?.data?.feedback || [];
    },
    { refetchOnWindowFocus: false }
  );

  const destination = destinationQuery.data;

  // If we are on a mock destination id (not mongo), try to resolve a real destination id by name search
  const searchQuery = useQuery(
    ['destination-search-id', destination?.name],
    async () => {
      if (!destination?.name || isMongoId(id)) return null;
      const res = await api.get('/destinations', { params: { search: destination.name, limit: 1 } });
      const match = res.data?.data?.destinations?.[0];
      return match?._id || null;
    },
    { enabled: !!destination?.name && !isMongoId(id) }
  );

  const serverDestinationId = isMongoId(id) ? id : (searchQuery.data || null);

  // If we opened a mock destination but found a real one on the server, redirect to the real page
  useEffect(() => {
    if (!isMongoId(id) && serverDestinationId) {
      navigate(`/destinations/${serverDestinationId}`, { replace: true });
    }
  }, [id, serverDestinationId, navigate]);

  if (destinationQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-soft p-8 text-center text-gray-600">Destination not found.</div>
        </div>
      </div>
    );
  }

  const submitReview = async (e) => {
    e.preventDefault();
    // If we are on a demo item without a resolved server id, store locally so users still see their review
    if (!serverDestinationId && !isMongoId(id)) {
      setLocalReviews(prev => [{
        _id: `local-${Date.now()}`,
        user: { name: user?.name || user?.fullName || user?.email?.split('@')[0] || 'You' },
        rating: { overall: Number(rating) },
        review: { content: review },
        sentiment: null,
        createdAt: new Date().toISOString()
      }, ...prev]);
      setReview('');
      setRating(5);
      return;
    }
    try {
      // Get sentiment from AI (optional)
      let sentiment = null;
      try {
        const s = await api.post('/ai/sentiment', { text: review });
        sentiment = s.data?.data;
      } catch {}

      await api.post('/feedback', {
        target: { type: 'destination', id: serverDestinationId || id },
        rating: { overall: Number(rating) },
        review: { content: review },
        sentiment
      });
      // Optimistic add for immediate UI update with logged-in user name
      setLocalReviews(prev => [{
        _id: `local-${Date.now()}`,
        user: { name: user?.name || user?.fullName || user?.email?.split('@')[0] || 'You' },
        rating: { overall: Number(rating) },
        review: { content: review },
        sentiment,
        createdAt: new Date().toISOString()
      }, ...prev]);
      setReview('');
      setRating(5);
      // Refetch reviews
      feedbackQuery.refetch();
    } catch (err) {
      if (err?.response?.status === 401) {
        alert('Please sign in to submit a review.');
        window.location.href = '/login';
        return;
      }
      alert(err?.response?.data?.message || 'Failed to submit review');
    }
  };

  const fbData = feedbackQuery.data || [];
  const combinedReviews = [...(PREWRITTEN[id] || []), ...fbData, ...localReviews];
  const fbLoading = feedbackQuery.isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{destination.name}</h1>
          <p className="text-gray-600">{destination.location?.city}, {destination.location?.state || 'Jharkhand'}</p>
        </div>

        {/* Media + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <img src={destination.primaryImage || destination.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000'} alt={destination.name} className="w-full h-72 object-cover" />
          </div>
          <div className="card p-6">
            <p className="text-gray-700 mb-4">{destination.shortDescription}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{destination.description}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/checkout?destinationId=${destination._id}&name=${encodeURIComponent(destination.name)}&amount=${destination.entryFee?.indian?.adult ?? 50}&qty=1`)}
                className="btn-primary px-5 py-2"
              >
                Book Now
              </button>
              <button onClick={() => navigate('/destinations')} className="btn-outline px-5 py-2">Back to Destinations</button>
            </div>
          </div>
        </div>

        {/* Placeholder: reviews / map / AR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Visitor Reviews</h2>
              <div className="flex items-center text-sm text-gray-600 gap-2">
                <span className="font-semibold text-primary-600">{combinedReviews.length}</span>
                <span>reviews</span>
              </div>
            </div>

            {/* Create review */}
            <form onSubmit={submitReview} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-1">
                <label className="label">Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="input">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="label">Your Review</label>
                <textarea rows={3} className="input" placeholder="Share your experience..." value={review} onChange={(e) => setReview(e.target.value)} required />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button type="submit" className="btn-primary w-full">Submit</button>
              </div>
            </form>

            {/* Reviews list */}
            {fbLoading ? (
              <div className="text-gray-500">Loading reviews...</div>
            ) : (
              <ul className="space-y-4">
                {combinedReviews.map((f) => (
                  <li key={f._id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{f.user?.name || 'Visitor'}</span>
                        <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`h-4 w-4 inline-block rounded-full ${i < Math.floor(f.rating?.overall || 0) ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-primary-600">{f.rating?.overall || 0}/5</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{f.review?.content}</p>
                    {f.sentiment?.label && (
                      <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${f.sentiment.label === 'positive' ? 'bg-green-100 text-green-700' : f.sentiment.label === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        Sentiment: {f.sentiment.label} {typeof f.sentiment.score === 'number' ? `(${f.sentiment.score.toFixed(2)})` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-3">Map</h2>
            {(() => {
              const lat = destination.location?.coordinates?.lat;
              const lng = destination.location?.coordinates?.lng;
              const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
              const query = encodeURIComponent(`${destination.name}, ${destination.location?.city || ''} ${destination.location?.state || ''}`);
              const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

              if (key && (lat || lng)) {
                const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${query}${lat && lng ? `&center=${lat},${lng}&zoom=12` : ''}`;
                return (
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <iframe
                      title="map"
                      width="100%"
                      height="260"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={src}
                    />
                    <div className="p-2 text-right">
                      <a className="text-sm text-primary-600 hover:underline" href={fallbackUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
                    </div>
                  </div>
                );
              }

              // Fallback without API key: only show an external link
              return (
                <a className="btn-outline" href={fallbackUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
