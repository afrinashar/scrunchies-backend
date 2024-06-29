const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const userRouter = require('./routers/user')
const itemRouter =require('./routers/item')
const cartRouter = require('./routers/cart')
//const orderRouter = require('./routers/order')
const authRouters = require('./routers/auth')
const app = express()
//require('./db/mongoose')
 var cors = require('cors');
// app.use(fileupload());

mongoose.connect(process.env.MONGODB_URL, {
  
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));
// Set up express-session and express-flash
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));


const port = process.env.PORT|| 8000

 app.use(cors());
app.use(express.json())
app.use(userRouter)
app.use(itemRouter)
app.use(cartRouter)
app.use(authRouters)


app.listen(port, () => {
    console.log('server listening on port ' + port)
})