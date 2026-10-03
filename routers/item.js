const express = require('express')
const Item = require('../models/Item')
const requireAdmin = require('../middleware/admin')
const upload =require('../middleware/upload')
const router = new express.Router()
const categories = ['Scrunchies', 'Dress']
const dressTypes = ['Blouse', 'Chudithar', 'Gown']
const parseBoolean = (value) => value === true || value === 'true'

function validateProduct({ name, description, category, subcategory, price, isFeatured, isUpcoming, videoUrl }) {
    const parsedPrice = Number(price)
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return 'Product name must be between 2 and 100 characters.'
    if (typeof description !== 'string' || description.trim().length > 1000) return 'Description must be 1000 characters or fewer.'
    if (!categories.includes(category)) return 'Choose Scrunchies or Dress as the collection.'
    if (category === 'Dress' && !dressTypes.includes(subcategory)) return 'Choose Blouse, Chudithar, or Gown as the dress type.'
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 10000000) return 'Enter a valid product price.'
    if (isFeatured && isUpcoming) return 'A product cannot be both Most wanted and Upcoming.'
    if (videoUrl) {
        if (typeof videoUrl !== 'string' || videoUrl.length > 500) return 'Video URL must be 500 characters or fewer.'
        try {
            const url = new URL(videoUrl.trim())
            if (url.protocol !== 'https:' || !/\.(mp4|webm|ogv)$/i.test(url.pathname)) return 'Use a direct HTTPS MP4, WebM, or Ogg video URL.'
        } catch {
            return 'Enter a valid HTTPS video URL.'
        }
    }
    return null
}

//fetch all items
router.get('/items', async(req, res) => {
    try {
        const items = await Item.find({})
        res.status(200).send(items)
    } catch (error) {
        res.status(400).send(error)
    }
})

//fetch an item
router.get('/items/:id', async(req, res) => {
    try{
        const item = await Item.findOne({_id: req.params.id})
        if(!item) {
            return res.status(404).send({error: "Item not found"})
        }
        res.status(200).send(item) 
    } catch (error) {
        res.status(400).send(error)
    }
})

//create an item
router.post('/items', requireAdmin, upload, async(req, res) => {
    try {
        const product = {
            ...req.body,
            category: req.body.category?.trim(),
            subcategory: req.body.subcategory?.trim(),
            isFeatured: parseBoolean(req.body.isFeatured),
            isUpcoming: parseBoolean(req.body.isUpcoming),
            videoUrl: req.body.videoUrl?.trim() || ''
        }
        const validationError = validateProduct(product)
        if (validationError) return res.status(400).send({ message: validationError })
        const newItem = new Item({
            name: product.name.trim(),
            description: product.description.trim(),
            category: product.category,
            subcategory: product.category === 'Dress' ? product.subcategory : undefined,
            isFeatured: product.isFeatured,
            isUpcoming: product.isUpcoming,
            price: Number(product.price),
            photo: req.file?.filename || '',
            videoUrl: product.videoUrl
        })
        await newItem.save()
        res.status(201).send(newItem)
    } catch (error) {
        console.error('Product creation failed:', error.message)
        res.status(500).send({message: 'Could not save product.'})
    }
})
//create an item
router.post('/upload', requireAdmin, upload, async(req, res) => {
    try {
        const newItem = new Item( 
       { photo: req.file.filename}
           
         )
        await newItem.save()
        res.status(201).send(newItem)
    } catch (error) {
        console.log({error})
        res.status(400).send({message: "error"})
    }
})

//update an item

router.patch('/items/:id', requireAdmin, upload, async(req, res) => {
    const updates = Object.keys(req.body || {})
    const allowedUpdates = ['name', 'description', 'category', 'subcategory', 'price', 'isFeatured', 'isUpcoming', 'videoUrl']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates'})
    }

    try {
        const item = await Item.findOne({ _id: req.params.id})
    
        if(!item){
            return res.status(404).send()
        }

        const product = {
            ...item.toObject(),
            ...req.body,
            isFeatured: parseBoolean(req.body.isFeatured ?? item.isFeatured),
            isUpcoming: parseBoolean(req.body.isUpcoming ?? item.isUpcoming),
            videoUrl: req.body.videoUrl ?? item.videoUrl
        }
        const validationError = validateProduct(product)
        if (validationError) return res.status(400).send({ message: validationError })
        item.name = product.name.trim()
        item.description = product.description.trim()
        item.category = product.category
        item.subcategory = product.category === 'Dress' ? product.subcategory : undefined
        item.isFeatured = product.isFeatured
        item.isUpcoming = product.isUpcoming
        item.price = Number(product.price)
        item.videoUrl = product.videoUrl?.trim() || ''
        if (req.file) item.photo = req.file.filename
        await item.save()
        res.send(item)
    } catch (error) {
        res.status(400).send(error)
    }
})

//delete item
router.delete('/items/:id', requireAdmin, async(req, res) => {
    try {
        const deletedItem = await Item.findOneAndDelete( {_id: req.params.id} )
        if(!deletedItem) {
            return res.status(404).send({error: "Item not found"})
        }
        res.send(deletedItem)
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router