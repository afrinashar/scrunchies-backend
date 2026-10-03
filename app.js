const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();
const userRouter = require('./routers/user')
const itemRouter =require('./routers/item')
const cartRouter = require('./routers/cart')
const orderRouter = require('./routers/order')
const feedbackRouter = require('./routers/feedback')
const authRouters = require('./routers/auth')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const path = require('path')
const app = express()
//require('./db/mongoose')
 var cors = require('cors');
// app.use(fileupload());

mongoose.connect(process.env.MONGODB_URL, {
  
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));
const port = process.env.PORT|| 8000

const allowedOrigins = new Set([
  ...(process.env.CLIENT_ORIGIN || '').split(','),
  ...(process.env.CLIENT_ORIGINS || '').split(','),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://tuktails.vercel.app'
].map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean))

app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ''))) return callback(null, true)
    return callback(new Error('Origin not allowed'))
  }
}))
app.use(express.json({ limit: '32kb' }))
app.use('/images', express.static(path.join(__dirname, 'middleware', 'image'), { maxAge: '1d', immutable: true }))
app.use('/orders', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many order attempts. Please try again in 15 minutes.' }
}))
app.use('/feedback', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many feedback submissions. Please try again in 15 minutes.' }
}))
app.use('/admin', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many admin requests. Please try again later.' }
}))
app.use(['/login', '/register'], rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please try again in 15 minutes.' }
}))
app.use(userRouter)
app.use(itemRouter)
app.use(cartRouter)
app.use(authRouters)
app.use(orderRouter)
app.use(feedbackRouter)

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error.type === 'entity.too.large') return res.status(413).send({ message: 'Request body is too large.' })
  if (error.message === 'Origin not allowed') return res.status(403).send({ message: 'Origin not allowed.' })
  console.error('Unhandled request error:', error.message)
  return res.status(500).send({ message: 'Something went wrong. Please try again.' })
})


app.listen(port, () => {
    console.log('server listening on port ' + port)
})