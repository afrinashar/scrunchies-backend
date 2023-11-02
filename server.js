const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://afrin:961215106001@cluster0.hbkqtqv.mongodb.net/product', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a Product schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    productName: String,
    quantity: Number,
});

const Product = mongoose.model('products', productSchema);

// Create a route to add a product
app.post('/post', async (req, res) => {
    const { name, price } = req.body;
    const product = new Product({ name, price });
    await product.save();
    res.json(product);
});

// Create a route to get all products
app.get('/get', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'name';
    const sortOrder = req.query.sortOrder || 'asc';

    const query = {
        name: { $regex: search, $options: 'i' },
    };
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const offset = limit * (page - 1);

    const products = await Product.find(query)
        .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
        .skip(offset)
        .limit(limit);
    res.json({
        page,
        totalPages,
        total,
        products,
    });
   
});

// Route to process the form submission
app.post('/form', async (req, res) => {
    const { name, email } = req.body;
    const form = new Form({ name, email });
    await form.save();
    res.send('Form submitted successfully!');
});
// Route to render the form
app.get('/form', (req, res) => {
    res.render('form');
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
