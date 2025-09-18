const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
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
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      default: 'Jharkhand'
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    pincode: String
  },
  category: {
    type: String,
    required: true,
    enum: [
      'historical',
      'religious',
      'natural',
      'adventure',
      'cultural',
      'wildlife',
      'archaeological',
      'eco-tourism'
    ]
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
  features: [{
    name: String,
    description: String,
    icon: String
  }],
  bestTimeToVisit: {
    months: [String],
    description: String
  },
  entryFee: {
    indian: {
      adult: Number,
      child: Number
    },
    foreign: {
      adult: Number,
      child: Number
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  timings: {
    opening: String,
    closing: String,
    days: [String]
  },
  facilities: [{
    name: String,
    available: Boolean,
    description: String
  }],
  nearbyAttractions: [{
    name: String,
    distance: String,
    type: String
  }],
  accessibility: {
    wheelchair: Boolean,
    parking: Boolean,
    publicTransport: Boolean,
    notes: String
  },
  culturalSignificance: {
    history: String,
    traditions: [String],
    festivals: [String],
    localCommunities: [String]
  },
  arVrContent: {
    enabled: {
      type: Boolean,
      default: false
    },
    modelUrl: String,
    previewImage: String,
    description: String
  },
  weather: {
    temperature: {
      min: Number,
      max: Number
    },
    season: String,
    rainfall: String
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
  isFeatured: {
    type: Boolean,
    default: false
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
destinationSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });
destinationSchema.index({ category: 1 });
destinationSchema.index({ 'location.city': 1 });
destinationSchema.index({ isActive: 1, isFeatured: 1 });
destinationSchema.index({ rating: -1 });

// Virtual for primary image
destinationSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : '');
});

// Method to update rating
destinationSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Destination', destinationSchema);
