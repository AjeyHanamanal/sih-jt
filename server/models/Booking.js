const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  touristId: {
    type: String,
    required: false
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sellerId: {
    type: String,
    required: false
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: false
  },
  bookingType: {
    type: String,
    enum: ['product', 'service', 'accommodation', 'guide', 'transport', 'package'],
    required: true
  },
  details: {
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: false
    },
    duration: {
      type: Number, // in hours or days
      required: false
    },
    participants: {
      adults: {
        type: Number,
        default: 1,
        min: 0
      },
      children: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    specialRequests: String,
    pickupLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    dropoffLocation: {
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    discounts: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
      required: true
    },
    transactionId: String,
    paymentDate: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundDate: Date,
    refundReason: String
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show'
    ],
    default: 'pending'
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  cancellation: {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    requestedById: {
      type: String,
      required: false
    },
    reason: String,
    requestedAt: Date,
    approvedAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    source: {
      type: String,
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ tourist: 1 });
bookingSchema.index({ seller: 1 });
bookingSchema.index({ product: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingId = `JT${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Method to update status
bookingSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    note: note || '',
    updatedBy: updatedBy
  });
  return this.save();
};

// Method to add communication
bookingSchema.methods.addMessage = function(sender, message) {
  this.communication.push({
    sender: sender,
    message: message
  });
  return this.save();
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  const product = this.product;
  if (!product || !product.policies.cancellation.allowed) {
    return 0;
  }
  
  const hoursUntilStart = (this.details.startDate - new Date()) / (1000 * 60 * 60);
  const deadline = product.policies.cancellation.deadline || 24;
  
  if (hoursUntilStart < deadline) {
    return 0; // No refund if cancelled too late
  }
  
  const refundPercentage = product.policies.cancellation.refundPercentage || 100;
  return (this.pricing.totalAmount * refundPercentage) / 100;
};

module.exports = mongoose.model('Booking', bookingSchema);
