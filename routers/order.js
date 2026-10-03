const express = require('express')
const mongoose = require('mongoose')
const Item = require('../models/Item')
const Order = require('../models/Order')
const requireAdmin = require('../middleware/admin')

const router = express.Router()
const allowedStatuses = ['new', 'confirmed', 'shipped', 'complete', 'cancelled']

router.post('/orders', async (req, res) => {
    try {
        const { customerName, phone, address, items } = req.body || {}
        if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.length > 80) {
            return res.status(400).send({ message: 'Enter a name between 2 and 80 characters.' })
        }
        if (typeof phone !== 'string' || !/^\+?[0-9\s()-]{8,18}$/.test(phone.trim())) {
            return res.status(400).send({ message: 'Enter a valid phone number.' })
        }
        if (typeof address !== 'string' || address.trim().length < 8 || address.length > 400) {
            return res.status(400).send({ message: 'Enter a delivery address between 8 and 400 characters.' })
        }
        if (!Array.isArray(items) || items.length < 1 || items.length > 12) {
            return res.status(400).send({ message: 'An order must contain between 1 and 12 products.' })
        }

        const requestedItems = []
        for (const item of items) {
            if (!item || typeof item !== 'object' || !mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
                return res.status(400).send({ message: 'One or more products or quantities are invalid.' })
            }
            requestedItems.push({ productId: item.productId, quantity: item.quantity })
        }

        const products = await Item.find({ _id: { $in: requestedItems.map(({ productId }) => productId) } })
        if (products.length !== new Set(requestedItems.map(({ productId }) => String(productId))).size) {
            return res.status(400).send({ message: 'One or more products are no longer available.' })
        }

        const productById = new Map(products.map((product) => [String(product._id), product]))
        const orderItems = requestedItems.map(({ productId, quantity }) => {
            const product = productById.get(String(productId))
            return {
                productId: product._id,
                name: product.name,
                category: product.category,
                subcategory: product.subcategory,
                price: product.price,
                quantity
            }
        })
        if (orderItems.some((item) => !Number.isFinite(item.price) || item.price < 0)) {
            return res.status(400).send({ message: 'A product price is not configured correctly.' })
        }

        const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        if (!Number.isFinite(total)) return res.status(400).send({ message: 'The order total is not valid.' })
        const order = await Order.create({
            customerName: customerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            items: orderItems,
            total
        })
        return res.status(201).send({ _id: order._id, status: order.status, total: order.total })
    } catch (error) {
        console.error('Order creation failed:', error.message)
        return res.status(500).send({ message: 'We could not place your order. Please try again.' })
    }
})

router.get('/admin/access', requireAdmin, (req, res) => res.status(204).end())

router.get('/admin/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean()
        return res.status(200).send(orders)
    } catch (error) {
        console.error('Admin orders query failed:', error.message)
        return res.status(500).send({ message: 'Could not load orders.' })
    }
})

router.patch('/admin/orders/:id', requireAdmin, async (req, res) => {
    const { status } = req.body || {}
    if (!mongoose.isValidObjectId(req.params.id) || !allowedStatuses.includes(status)) {
        return res.status(400).send({ message: 'Order or status is invalid.' })
    }

    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
        if (!order) return res.status(404).send({ message: 'Order not found.' })
        return res.status(200).send(order)
    } catch (error) {
        console.error('Order status update failed:', error.message)
        return res.status(500).send({ message: 'Could not update order status.' })
    }
})

module.exports = router