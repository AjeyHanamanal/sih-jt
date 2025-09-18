import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-soft p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Detail</h1>
          <p className="text-gray-600">Product ID: {id}</p>
          <p className="text-gray-600 mt-4">This page will show detailed information about the product, including images, description, pricing, availability, and booking options.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
