import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-soft p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-lg text-gray-600 mb-8">
            Get in touch with us for any questions about Jharkhand tourism, bookings, or support.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">info@jharkhandtourism.com</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <p className="text-gray-600">+91 123 456 7890</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-gray-600">Ranchi, Jharkhand, India</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input type="text" className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea rows={4} className="input"></textarea>
                </div>
                <button type="submit" className="btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
