const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 10 }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 18 },
  address: { type: String, required: true, trim: true, maxlength: 400 },
  items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['new', 'confirmed', 'shipped', 'complete', 'cancelled'], default: 'new' }
}, { timestamps: true })

orderSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Order', orderSchema)