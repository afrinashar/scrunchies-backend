const User = require('../models/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userController = {

  register: async (req, res) => {
    try {
      const { name, email, password, userType } = req.body || {}
      if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || password.length < 7) {
        return res.status(400).send({ message: 'Name, email, and a password of at least 7 characters are required.' })
      }
      const normalizedEmail = email.trim().toLowerCase()
      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser) return res.status(409).send({ message: 'An account with this email already exists.' })

      const encryptedPassword = await bcrypt.hash(password, 12)
      await User.create({ name: name.trim(), email: normalizedEmail, password: encryptedPassword, userType })
      return res.status(201).send({ status: 'User Register' })
    } catch (error) {
      if (error.name === 'ValidationError') return res.status(400).send({ message: 'Please check the registration details.' })
      console.error('Registration failed:', error.message)
      return res.status(500).send({ message: 'Could not create this account.' })
    }
  },

  login: async (req, res) => {
    if (!process.env.JWT_SECRET) return res.status(503).send({ message: 'Authentication is not configured on the server.' })
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).send({ message: 'Email and password are required.' })
    }
    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() })
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ message: 'Email or password is incorrect.' })
      }
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' })
      return res.status(200).send({ status: 'Login Success', data: token })
    } catch (error) {
      console.error('Login failed:', error.message)
      return res.status(500).send({ message: 'Could not sign in.' })
    }
  },

  userData: async (req, res) => {
    if (!process.env.JWT_SECRET) return res.status(503).send({ message: 'Authentication is not configured on the server.' })
    const { token } = req.body || {}
    if (typeof token !== 'string') return res.status(400).send({ message: 'A valid token is required.' })
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findOne({ email: decoded.email }).select('-password')
      if (!user) return res.status(404).send({ message: 'Account not found.' })
      return res.send({ status: 'ok', data: user })
    } catch {
      return res.status(401).send({ message: 'The session has expired. Please sign in again.' })
    }
  }
}

module.exports = userController