import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  CameraIcon, 
  HeartIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import baidhnath from './baidhnath.jpg';
import betla from './betla.jpg';
import hundru from './hundru.jpg';
import jagannath from './jagannath.jpg';
import mainHero from './main.jpg';

const Home = () => {
  const featuredDestinations = [
    {
      id: 1,
      name: 'Baidyanath Temple',
      location: 'Deoghar',
      image: baidhnath,
      rating: 4.8,
      reviews: 1240,
      category: 'Religious'
    },
    {
      id: 2,
      name: 'Betla National Park',
      location: 'Palamu',
      image: betla,
      rating: 4.6,
      reviews: 890,
      category: 'Wildlife'
    },
    {
      id: 3,
      name: 'Hundru Falls',
      location: 'Ranchi',
      image: hundru,
      rating: 4.7,
      reviews: 1560,
      category: 'Natural'
    },
    {
      id: 4,
      name: 'Jagannath Temple',
      location: 'Ranchi',
      image: jagannath,
      rating: 4.5,
      reviews: 980,
      category: 'Religious'
    }
  ];

  const features = [
    {
      icon: MapPinIcon,
      title: 'Discover Destinations',
      description: 'Explore the rich cultural heritage and natural beauty of Jharkhand'
    },
    {
      icon: CameraIcon,
      title: 'AR/VR Experiences',
      description: 'Immerse yourself in virtual tours of historical sites and monuments'
    },
    {
      icon: HeartIcon,
      title: 'Authentic Experiences',
      description: 'Connect with local communities and experience tribal culture'
    }
  ];

  const stats = [
    { number: '500+', label: 'Destinations' },
    { number: '50K+', label: 'Happy Tourists' },
    { number: '100+', label: 'Local Guides' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Discover the
                  <span className="block text-secondary-300">Heart of India</span>
                </h1>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Experience the rich cultural heritage, breathtaking landscapes, and authentic tribal traditions of Jharkhand. Your journey to unforgettable memories starts here.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/destinations"
                  className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
                >
                  Explore Destinations
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="https://youtu.be/xHXM7m9Xd8M?si=zyU5DlGBF__A2JCb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-lg px-8 py-3 inline-flex items-center justify-center bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Watch Video
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"
                  alt="Jharkhand Tourism"
                  className="rounded-2xl shadow-strong"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-medium">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">4.8 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the most popular and breathtaking destinations in Jharkhand, 
              each offering unique experiences and unforgettable memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDestinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/destinations/${destination.id}`}
                className="group"
              >
                <div className="card-hover">
                  <div className="relative overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="badge-primary">
                        {destination.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200">
                        <HeartIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {destination.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{destination.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(destination.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {destination.rating} ({destination.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              View All Destinations
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Jharkhand Tourism?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide unique experiences that connect you with the authentic culture 
              and natural beauty of Jharkhand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-200 transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Explore Jharkhand?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of travelers who have discovered the magic of Jharkhand. 
            Start planning your adventure today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Get Started
            </Link>
            <Link
              to="/destinations"
              className="btn border-white text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Browse Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
