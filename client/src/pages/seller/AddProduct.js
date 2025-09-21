import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PhotoIcon, 
  XMarkIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
  DocumentTextIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AddProduct = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    price: {
      amount: '',
      unit: 'per_item'
    },
    location: {
      city: '',
      state: 'Jharkhand',
      address: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    availability: {
      isAvailable: true,
      maxGuests: '',
      duration: '',
      startTime: '',
      endTime: ''
    },
    features: [],
    tags: [],
    contactInfo: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    policies: {
      cancellation: '',
      refund: '',
      terms: ''
    }
  });

  const categories = [
    { value: 'handicrafts', label: 'Handicrafts & Art' },
    { value: 'homestay', label: 'Homestay & Accommodation' },
    { value: 'guide_service', label: 'Guide Services' },
    { value: 'transport', label: 'Transportation' },
    { value: 'restaurant', label: 'Restaurant & Food' },
    { value: 'tour_package', label: 'Tour Packages' },
    { value: 'cultural_experience', label: 'Cultural Experiences' },
    { value: 'adventure_activity', label: 'Adventure Activities' },
    { value: 'other', label: 'Other Services' }
  ];

  const priceUnits = [
    { value: 'per_item', label: 'Per Item' },
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_night', label: 'Per Night' },
    { value: 'per_hour', label: 'Per Hour' },
    { value: 'per_day', label: 'Per Day' },
    { value: 'per_package', label: 'Per Package' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description) {
        alert('Please fill in all required fields (Name and Description)');
        setLoading(false);
        return;
      }

      // Ensure we have a category
      if (!formData.category) {
        formData.category = 'other';
      }

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('name', formData.name);
      submitData.append('shortDescription', formData.shortDescription || formData.description.substring(0, 300));
      submitData.append('description', formData.description);
      submitData.append('category', formData.category || 'other');
      submitData.append('price', JSON.stringify(formData.price));
      submitData.append('location', JSON.stringify(formData.location));
      submitData.append('availability', JSON.stringify(formData.availability));
      submitData.append('features', JSON.stringify(formData.features.filter(f => f.trim())));
      submitData.append('tags', JSON.stringify(formData.tags.filter(t => t.trim())));
      submitData.append('contactInfo', JSON.stringify(formData.contactInfo));
      submitData.append('policies', JSON.stringify(formData.policies));

      // Add images
      images.forEach((image, index) => {
        submitData.append('images', image.file);
      });

      console.log('Submitting product data:', {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        price: formData.price,
        location: formData.location,
        availability: formData.availability,
        features: formData.features,
        tags: formData.tags,
        contactInfo: formData.contactInfo,
        policies: formData.policies,
        images: images.length
      });

      const response = await api.post('/products', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Product creation response:', response.data);

      if (response.data.status === 'success') {
        console.log('Product created successfully:', response.data);
        alert('Product created successfully!');
        navigate('/seller/products');
      } else {
        console.error('Unexpected response:', response.data);
        alert('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-gray-600">Create a new product or service listing for your business</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Product/Service Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input"
                  placeholder="e.g., Traditional Jharkhand Handicrafts"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="input"
                  placeholder="Describe your product or service"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CameraIcon className="h-5 w-5 mr-2" />
              Product Images
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Price Amount</label>
                <div className="relative">
                  <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price.amount"
                    min="0"
                    step="0.01"
                    className="input pl-10"
                    placeholder="0.00"
                    value={formData.price.amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="label">Price Unit</label>
                <select
                  name="price.unit"
                  className="input"
                  value={formData.price.unit}
                  onChange={handleInputChange}
                >
                  {priceUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="location.city"
                  className="input"
                  placeholder="e.g., Ranchi"
                  value={formData.location.city}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  name="location.state"
                  className="input"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea
                  name="location.address"
                  rows={3}
                  className="input"
                  placeholder="Full address (optional)"
                  value={formData.location.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Availability & Capacity
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="availability.isAvailable"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.availability.isAvailable}
                  onChange={handleInputChange}
                />
                <label className="ml-2 text-sm text-gray-700">Currently Available</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Maximum Guests/Capacity</label>
                  <input
                    type="number"
                    name="availability.maxGuests"
                    min="1"
                    className="input"
                    placeholder="e.g., 10"
                    value={formData.availability.maxGuests}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="label">Duration (if applicable)</label>
                  <input
                    type="text"
                    name="availability.duration"
                    className="input"
                    placeholder="e.g., 2 hours, 1 day"
                    value={formData.availability.duration}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Features & Amenities
            </h2>
            
            <div className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter a feature or amenity"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Feature
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Tags
            </h2>
            
            <div className="space-y-4">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter a tag"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  className="input"
                  placeholder="+91 9876543210"
                  value={formData.contactInfo.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="contactInfo.email"
                  className="input"
                  placeholder="contact@example.com"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">WhatsApp Number</label>
                <input
                  type="tel"
                  name="contactInfo.whatsapp"
                  className="input"
                  placeholder="+91 9876543210"
                  value={formData.contactInfo.whatsapp}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Policies & Terms</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">Cancellation Policy</label>
                <textarea
                  name="policies.cancellation"
                  rows={3}
                  className="input"
                  placeholder="Describe your cancellation policy"
                  value={formData.policies.cancellation}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">Refund Policy</label>
                <textarea
                  name="policies.refund"
                  rows={3}
                  className="input"
                  placeholder="Describe your refund policy"
                  value={formData.policies.refund}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">Terms & Conditions</label>
                <textarea
                  name="policies.terms"
                  rows={4}
                  className="input"
                  placeholder="Additional terms and conditions"
                  value={formData.policies.terms}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating Product...</span>
                </>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;