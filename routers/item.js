const express = require('express')
const Item = require('../models/Item')
const requireAdmin = require('../middleware/admin')
const upload =require('../middleware/upload')
const router = new express.Router()

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
            res.status(404).send({error: "Item not found"})
        }
        res.status(200).send(item) 
    } catch (error) {
        res.status(400).send(error)
    }
})

//create an item
router.post('/items', requireAdmin, upload, async(req, res) => {
    try {
        const newItem = new Item({
            ...req.body,photo: req.file.filename
           
        })
        await newItem.save()
        res.status(201).send(newItem)
    } catch (error) {
        console.log({error})
        res.status(400).send({message: "error"})
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

router.patch('/items/:id', requireAdmin, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description', 'category', 'price']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates'})
    }

    try {
        const item = await Item.findOne({ _id: req.params.id})
    
        if(!item){
            return res.status(404).send()
        }

        updates.forEach((update) => item[update] = req.body[update])
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
            res.status(404).send({error: "Item not found"})
        }
        res.send(deletedItem)
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router