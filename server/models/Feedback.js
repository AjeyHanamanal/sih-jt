const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: {
      type: String,
      enum: ['destination', 'product', 'seller', 'booking', 'platform'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    categories: {
      service: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      location: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  review: {
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    pros: [String],
    cons: [String],
    tips: [String]
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    caption: String
  }],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    confidence: Number
  },
  helpfulness: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    usersWhoFoundHelpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: Date
  },
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending'
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    reason: String,
    flags: [{
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'irrelevant']
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  metadata: {
    source: {
      type: String,
      default: 'web'
    },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ 'target.type': 1, 'target.id': 1 });
feedbackSchema.index({ booking: 1 });
feedbackSchema.index({ 'rating.overall': -1 });
feedbackSchema.index({ 'moderation.status': 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ 'sentiment.label': 1 });

// Text search index
feedbackSchema.index({ 
  'review.title': 'text', 
  'review.content': 'text',
  'review.pros': 'text',
  'review.cons': 'text'
});

// Method to calculate average rating for categories
feedbackSchema.methods.getAverageCategoryRating = function() {
  const categories = this.rating.categories;
  const values = Object.values(categories).filter(val => val !== undefined);
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
};

// Method to mark as helpful
feedbackSchema.methods.markHelpful = function(userId) {
  if (!this.helpfulness.usersWhoFoundHelpful.includes(userId)) {
    this.helpfulness.usersWhoFoundHelpful.push(userId);
    this.helpfulness.helpful += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as not helpful
feedbackSchema.methods.markNotHelpful = function(userId) {
  const index = this.helpfulness.usersWhoFoundHelpful.indexOf(userId);
  if (index > -1) {
    this.helpfulness.usersWhoFoundHelpful.splice(index, 1);
    this.helpfulness.helpful -= 1;
  }
  this.helpfulness.notHelpful += 1;
  return this.save();
};

// Static method to get average rating for a target
feedbackSchema.statics.getAverageRating = function(targetType, targetId) {
  return this.aggregate([
    {
      $match: {
        'target.type': targetType,
        'target.id': mongoose.Types.ObjectId(targetId),
        'moderation.status': 'approved',
        isPublic: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        categoryAverages: {
          $avg: {
            $avg: [
              '$rating.categories.service',
              '$rating.categories.value',
              '$rating.categories.cleanliness',
              '$rating.categories.location',
              '$rating.categories.communication'
            ]
          }
        }
      }
    }
  ]);
};

// Static method to get sentiment analysis
feedbackSchema.statics.getSentimentAnalysis = function(targetType, targetId) {
  return this.aggregate([
    {
      $match: {
        'target.type': targetType,
        'target.id': mongoose.Types.ObjectId(targetId),
        'moderation.status': 'approved',
        isPublic: true
      }
    },
    {
      $group: {
        _id: '$sentiment.label',
        count: { $sum: 1 },
        averageScore: { $avg: '$sentiment.score' }
      }
    }
  ]);
};

module.exports = mongoose.model('Feedback', feedbackSchema);
