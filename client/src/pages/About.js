import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-soft p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Jharkhand Tourism Platform</h1>
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Welcome to the official tourism platform of Jharkhand, where we showcase the rich cultural heritage, 
              breathtaking natural beauty, and authentic tribal experiences that make our state truly unique.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              To promote sustainable tourism in Jharkhand while preserving our cultural heritage and supporting 
              local communities. We aim to provide authentic experiences that connect visitors with the heart 
              and soul of our beautiful state.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Curated destination guides and itineraries</li>
              <li>Authentic tribal cultural experiences</li>
              <li>Eco-tourism and adventure activities</li>
              <li>Local handicrafts and products</li>
              <li>Expert local guides and homestays</li>
              <li>AI-powered personalized recommendations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              For more information about Jharkhand tourism, please contact us at info@jharkhandtourism.com 
              or call +91 123 456 7890.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
