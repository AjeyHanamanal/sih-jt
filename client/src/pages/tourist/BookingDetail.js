import React from 'react';
import { useParams } from 'react-router-dom';

const BookingDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-soft p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {id}</p>
          <p className="text-gray-600 mt-4">This page will show detailed information about the booking, including status, payment details, and communication with the seller.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;