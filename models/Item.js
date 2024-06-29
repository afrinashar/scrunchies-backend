const mongoose = require("mongoose")
const ObjectID = mongoose.Schema.Types.ObjectId

const itemSchema = new mongoose.Schema({
    owner : {
       type: ObjectID,
       required: false,
       ref: 'Auth'
    },
    name: {
       type: String,
       required: false,
       trim: false
    },
    description: {
      type: String,
      required: false
    },
    category: {
       type: String,
       required: false
    },
    price: {
       type: Number,
       required: false
    }, 
    photo: {
      type: String,
      required: false
   }
    }, {
    timestamps: false
    })
    const Item = mongoose.model('Item', itemSchema)
module.exports = Item