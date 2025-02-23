const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  device_info: {
    type: Object,
    default: {}
  },
  last_session_id: String,
  last_active: Date,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);