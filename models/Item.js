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
       trim: true
    },
    description: {
      type: String,
      required: false
    },
    category: {
       type: String,
       required: false
    },
    subcategory: {
       type: String,
       required: false,
       trim: true
    },
    isFeatured: {
       type: Boolean,
       default: false
    },
    isUpcoming: {
       type: Boolean,
       default: false
    },
    price: {
       type: Number,
       required: false
    }, 
    photo: {
      type: String,
      required: false
    },
      videoUrl: {
         type: String,
         trim: true,
         maxlength: 500,
         required: false
   }
    }, {
    timestamps: false
    })
    const Item = mongoose.model('Item', itemSchema)
module.exports = Item