const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  metrics: {
    users: {
      total: {
        type: Number,
        default: 0
      },
      new: {
        type: Number,
        default: 0
      },
      active: {
        type: Number,
        default: 0
      },
      byRole: {
        tourist: {
          type: Number,
          default: 0
        },
        seller: {
          type: Number,
          default: 0
        },
        admin: {
          type: Number,
          default: 0
        }
      }
    },
    bookings: {
      total: {
        type: Number,
        default: 0
      },
      confirmed: {
        type: Number,
        default: 0
      },
      cancelled: {
        type: Number,
        default: 0
      },
      completed: {
        type: Number,
        default: 0
      },
      revenue: {
        type: Number,
        default: 0
      },
      averageValue: {
        type: Number,
        default: 0
      }
    },
    products: {
      total: {
        type: Number,
        default: 0
      },
      new: {
        type: Number,
        default: 0
      },
      approved: {
        type: Number,
        default: 0
      },
      pending: {
        type: Number,
        default: 0
      },
      byCategory: {
        handicrafts: {
          type: Number,
          default: 0
        },
        homestay: {
          type: Number,
          default: 0
        },
        guide_service: {
          type: Number,
          default: 0
        },
        transport: {
          type: Number,
          default: 0
        },
        restaurant: {
          type: Number,
          default: 0
        },
        tour_package: {
          type: Number,
          default: 0
        }
      }
    },
    destinations: {
      total: {
        type: Number,
        default: 0
      },
      views: {
        type: Number,
        default: 0
      },
      popular: [{
        destinationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Destination'
        },
        name: String,
        views: Number
      }]
    },
    feedback: {
      total: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0
      },
      sentiment: {
        positive: {
          type: Number,
          default: 0
        },
        negative: {
          type: Number,
          default: 0
        },
        neutral: {
          type: Number,
          default: 0
        }
      }
    },
    platform: {
      pageViews: {
        type: Number,
        default: 0
      },
      uniqueVisitors: {
        type: Number,
        default: 0
      },
      bounceRate: {
        type: Number,
        default: 0
      },
      averageSessionDuration: {
        type: Number,
        default: 0
      },
      topPages: [{
        page: String,
        views: Number
      }],
      trafficSources: {
        direct: {
          type: Number,
          default: 0
        },
        search: {
          type: Number,
          default: 0
        },
        social: {
          type: Number,
          default: 0
        },
        referral: {
          type: Number,
          default: 0
        }
      }
    }
  },
  trends: {
    userGrowth: {
      type: Number,
      default: 0
    },
    bookingGrowth: {
      type: Number,
      default: 0
    },
    revenueGrowth: {
      type: Number,
      default: 0
    },
    destinationPopularity: [{
      destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination'
      },
      name: String,
      growth: Number
    }]
  },
  insights: [{
    type: {
      type: String,
      enum: ['trend', 'anomaly', 'recommendation', 'alert']
    },
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    data: mongoose.Schema.Types.Mixed
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
analyticsSchema.index({ date: -1, type: 1 });
analyticsSchema.index({ type: 1, date: -1 });

// Static method to get analytics for a date range
analyticsSchema.statics.getAnalytics = function(startDate, endDate, type = 'daily') {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    },
    type: type
  }).sort({ date: -1 });
};

// Static method to get latest analytics
analyticsSchema.statics.getLatest = function(type = 'daily') {
  return this.findOne({ type: type }).sort({ date: -1 });
};

// Static method to calculate growth rates
analyticsSchema.statics.calculateGrowth = function(currentPeriod, previousPeriod) {
  const growth = {};
  
  // User growth
  if (previousPeriod.metrics.users.total > 0) {
    growth.userGrowth = ((currentPeriod.metrics.users.total - previousPeriod.metrics.users.total) / previousPeriod.metrics.users.total) * 100;
  }
  
  // Booking growth
  if (previousPeriod.metrics.bookings.total > 0) {
    growth.bookingGrowth = ((currentPeriod.metrics.bookings.total - previousPeriod.metrics.bookings.total) / previousPeriod.metrics.bookings.total) * 100;
  }
  
  // Revenue growth
  if (previousPeriod.metrics.bookings.revenue > 0) {
    growth.revenueGrowth = ((currentPeriod.metrics.bookings.revenue - previousPeriod.metrics.bookings.revenue) / previousPeriod.metrics.bookings.revenue) * 100;
  }
  
  return growth;
};

// Method to generate insights
analyticsSchema.methods.generateInsights = function() {
  const insights = [];
  
  // User growth insight
  if (this.trends.userGrowth > 20) {
    insights.push({
      type: 'trend',
      title: 'High User Growth',
      description: `User growth increased by ${this.trends.userGrowth.toFixed(1)}%`,
      severity: 'medium',
      data: { growth: this.trends.userGrowth }
    });
  }
  
  // Revenue insight
  if (this.metrics.bookings.revenue > 0 && this.metrics.bookings.total > 0) {
    const avgRevenue = this.metrics.bookings.revenue / this.metrics.bookings.total;
    if (avgRevenue > 5000) {
      insights.push({
        type: 'trend',
        title: 'High Average Booking Value',
        description: `Average booking value is ₹${avgRevenue.toFixed(0)}`,
        severity: 'low',
        data: { averageRevenue: avgRevenue }
      });
    }
  }
  
  // Feedback sentiment insight
  const totalFeedback = this.metrics.feedback.sentiment.positive + this.metrics.feedback.sentiment.negative + this.metrics.feedback.sentiment.neutral;
  if (totalFeedback > 0) {
    const positiveRatio = this.metrics.feedback.sentiment.positive / totalFeedback;
    if (positiveRatio < 0.6) {
      insights.push({
        type: 'alert',
        title: 'Low Positive Sentiment',
        description: `Only ${(positiveRatio * 100).toFixed(1)}% of feedback is positive`,
        severity: 'high',
        data: { positiveRatio }
      });
    }
  }
  
  this.insights = insights;
  return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema);
