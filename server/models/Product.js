const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: false
  },
  category: {
    type: String,
    required: true,
    enum: [
      'handicrafts',
      'homestay',
      'guide_service',
      'transport',
      'restaurant',
      'tour_package',
      'cultural_experience',
      'adventure_activity',
      'other'
    ]
  },
  subcategory: String,
  price: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    unit: {
      type: String,
      enum: ['per_item', 'per_person', 'per_night', 'per_hour', 'per_day', 'per_package'],
      default: 'per_item'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    material: String,
    dimensions: String,
    weight: String,
    color: String,
    origin: String,
    craftsmanship: String,
    age: String,
    condition: {
      type: String,
      enum: ['new', 'excellent', 'good', 'fair', 'vintage']
    }
  },
  availability: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    maxQuantity: Number,
    availableDates: [Date],
    blackoutDates: [Date]
  },
  location: {
    address: String,
    city: String,
    state: {
      type: String,
      default: 'Jharkhand'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  features: [{
    name: String,
    description: String,
    included: Boolean
  }],
  policies: {
    cancellation: {
      allowed: Boolean,
      deadline: Number, // hours before service
      refundPercentage: Number
    },
    modification: {
      allowed: Boolean,
      deadline: Number
    },
    terms: [String]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  blockchain: {
    certificateUrl: String,
    authenticityHash: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
productSchema.index({ seller: 1 });
productSchema.index({ destination: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isApproved: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ 'price.amount': 1 });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : '');
});

// Method to update rating
productSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Method to check availability
productSchema.methods.isAvailable = function(date, quantity = 1) {
  if (!this.availability.inStock) return false;
  if (this.availability.quantity < quantity) return false;
  
  if (date) {
    // Check blackout dates
    const blackoutDate = this.availability.blackoutDates.find(d => 
      d.toDateString() === new Date(date).toDateString()
    );
    if (blackoutDate) return false;
    
    // Check available dates if specified
    if (this.availability.availableDates.length > 0) {
      const availableDate = this.availability.availableDates.find(d => 
        d.toDateString() === new Date(date).toDateString()
      );
      if (!availableDate) return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('Product', productSchema);
