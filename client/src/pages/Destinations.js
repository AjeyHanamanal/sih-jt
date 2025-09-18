import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPinIcon, 
  StarIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import baidhnath from './baidhnath.jpg';
import jagannath from './jagannath.jpg';
import betla from './betla.jpg';
import hundru from './hundru.jpg';


const Destinations = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    sort: 'createdAt'
  });
  const [page, setPage] = useState(1);
  const { api } = useAuth();
  // MOCK DATA (restored)
  const mockDestinations = [
    {
      _id: '1',
      name: 'Baidyanath Temple',
      shortDescription: 'Famous Hindu temple in Deoghar, known for its spiritual significance and architectural beauty.',
      primaryImage: baidhnath,
      location: { city: 'Deoghar', state: 'Jharkhand' },
      category: 'religious',
      rating: { average: 4.8, count: 1240 },
      entryFee: { indian: { adult: 50 } }
    },
    {
      _id: '2',
      name: 'Betla National Park',
      shortDescription: 'Wildlife sanctuary home to tigers, elephants, and diverse flora and fauna.',
      primaryImage: betla,
      location: { city: 'Palamu', state: 'Jharkhand' },
      category: 'wildlife',
      rating: { average: 4.6, count: 890 },
      entryFee: { indian: { adult: 100 } }
    },
    {
      _id: '3',
      name: 'Hundru Falls',
      shortDescription: 'Breathtaking waterfall surrounded by lush greenery and scenic landscapes.',
      primaryImage: hundru,
      location: { city: 'Ranchi', state: 'Jharkhand' },
      category: 'natural',
      rating: { average: 4.7, count: 1560 },
      entryFee: { indian: { adult: 30 } }
    },
    {
      _id: '4',
      name: 'Jagannath Temple',
      shortDescription: 'Ancient temple dedicated to Lord Jagannath with rich cultural heritage.',
      primaryImage: jagannath,
      location: { city: 'Ranchi', state: 'Jharkhand' },
      category: 'religious',
      rating: { average: 4.5, count: 980 },
      entryFee: { indian: { adult: 20 } }
    },
    {
      _id: '5',
      name: 'Netarhat',
      shortDescription: 'Hill station known as the "Queen of Chotanagpur" with cool climate and scenic views.',
      primaryImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=60',
      location: { city: 'Latehar', state: 'Jharkhand' },
      category: 'natural',
      rating: { average: 4.4, count: 750 },
      entryFee: { indian: { adult: 0 } }
    },
    {
      _id: '6',
      name: 'Patratu Valley',
      shortDescription: 'Picturesque valley with winding roads and beautiful landscapes.',
      primaryImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=60',
      location: { city: 'Ramgarh', state: 'Jharkhand' },
      category: 'natural',
      rating: { average: 4.3, count: 650 },
      entryFee: { indian: { adult: 0 } }
    }
  ];

  const filteredDestinations = mockDestinations.filter(dest => {
    const matchesSearch = !filters.search ||
      dest.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      dest.shortDescription.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || dest.category === filters.category;
    const matchesCity = !filters.city || dest.location.city.toLowerCase().includes(filters.city.toLowerCase());
    return matchesSearch && matchesCategory && matchesCity;
  });

  // Try live API first; fallback to mock
  const liveQuery = useQuery(
    ['destinations', filters, page],
    async () => {
      try {
        const res = await api.get('/destinations', { params: { ...filters, page, limit: 12 } });
        return res.data?.data;
      } catch {
        return null;
      }
    },
    { keepPreviousData: true }
  );

  const liveDestinations = liveQuery.data?.destinations || [];
  const useLive = liveDestinations.length > 0;
  const destinations = useLive ? liveDestinations : filteredDestinations;
  const pagination = useLive ? (liveQuery.data?.pagination || {
    currentPage: page,
    totalPages: 1,
    totalItems: liveDestinations.length,
    itemsPerPage: 12
  }) : {
    currentPage: 1,
    totalPages: 1,
    totalItems: filteredDestinations.length,
    itemsPerPage: 12
  };

  const categories = [
    'All',
    'Historical',
    'Religious',
    'Natural',
    'Adventure',
    'Cultural',
    'Wildlife',
    'Archaeological',
    'Eco-tourism'
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const LikeButton = () => {
    const [liked, setLiked] = useState(false);
    return (
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={() => setLiked(v => !v)}
          aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200 shadow-sm"
        >
          {liked ? (
            <HeartSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Discover Jharkhand
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the rich cultural heritage, breathtaking landscapes, and authentic tribal traditions of Jharkhand.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                className="input pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>

            {/* City Filter */}
            <input
              type="text"
              placeholder="City"
              className="input"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />

            {/* Sort */}
            <select
              className="input"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="createdAt">Latest</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">{`${useLive ? '' : '(Demo) '}Showing ${destinations.length} of ${pagination.totalItems} destinations`}</p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div key={destination._id} className="group">
              <div className="card-hover">
                <div className="relative overflow-hidden">
                  <img
                    src={destination.primaryImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500'}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="badge-primary capitalize">
                      {destination.category}
                    </span>
                  </div>
                  <LikeButton />
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    <Link to={`/destinations/${destination._id}`}>{destination.name}</Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {destination.shortDescription}
                  </p>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{destination.location.city}, {destination.location.state}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(destination.rating?.average || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {(destination.rating?.average || 0).toFixed(1)} ({destination.rating?.count || 0})
                      </span>
                    </div>
                    
                    {destination.entryFee && (
                      <div className="text-sm font-medium text-primary-600">
                        From ₹{destination.entryFee?.indian?.adult ?? 'N/A'}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-3">
                    <Link to={`/destinations/${destination._id}`} className="btn-outline text-sm px-4 py-2">View Details</Link>
                    <button
                      type="button"
                      onClick={() => navigate(`/checkout?destinationId=${destination._id}&name=${encodeURIComponent(destination.name)}&amount=${destination.entryFee?.indian?.adult ?? 50}&qty=1`)}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {destinations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No destinations found</div>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
