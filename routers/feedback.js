const express = require('express')
const mongoose = require('mongoose')
const Feedback = require('../models/Feedback')
const Item = require('../models/Item')
const requireAdmin = require('../middleware/admin')

const router = express.Router()
const feedbackTypes = ['app', 'product', 'new-product']

router.post('/feedback', async (req, res) => {
  const { type, name, message, productId } = req.body || {}
  if (!feedbackTypes.includes(type)) return res.status(400).send({ message: 'Choose one of the feedback options.' })
  if (typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 1000) {
    return res.status(400).send({ message: 'Feedback must be between 5 and 1000 characters.' })
  }
  if (name !== undefined && (typeof name !== 'string' || name.trim().length > 80)) {
    return res.status(400).send({ message: 'Name must be 80 characters or fewer.' })
  }

  try {
    let productName = ''
    let selectedProductId
    if (type === 'product') {
      if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ message: 'Choose a product for your feedback.' })
      const product = await Item.findById(productId).select('name')
      if (!product) return res.status(404).send({ message: 'That product is no longer available.' })
      productName = product.name
      selectedProductId = product._id
    }

    await Feedback.create({
      type,
      name: name?.trim() || 'Guest',
      message: message.trim(),
      productId: selectedProductId,
      productName
    })
    return res.status(201).send({ message: 'Thank you. Your feedback has been received.' })
  } catch (error) {
    console.error('Feedback submission failed:', error.message)
    return res.status(500).send({ message: 'Could not send feedback. Please try again.' })
  }
})

router.get('/admin/feedback', requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find({}).sort({ createdAt: -1 }).limit(100).lean()
    return res.status(200).send(feedback)
  } catch (error) {
    console.error('Admin feedback query failed:', error.message)
    return res.status(500).send({ message: 'Could not load feedback.' })
  }
})

module.exports = router