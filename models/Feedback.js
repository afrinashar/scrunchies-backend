const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['app', 'product', 'new-product'] },
  name: { type: String, default: 'Guest', trim: true, maxlength: 80 },
  message: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  productName: { type: String, default: '', trim: true, maxlength: 100 }
}, { timestamps: true })

feedbackSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Feedback', feedbackSchema)