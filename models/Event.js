const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true,
    index: true 
  },
  session_id: { 
    type: String, 
    required: true 
  },
  event_type: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    required: true 
  },
  device_info: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  game_score: Number,
  ip_address: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

// 创建复合索引
eventSchema.index({ user_id: 1, timestamp: -1 });

module.exports = mongoose.model('Event', eventSchema);