const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  author: {
    type: String,
    default: 'Admin'
  },
  created: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
});

module.exports = mongoose.model('Post', postSchema);
