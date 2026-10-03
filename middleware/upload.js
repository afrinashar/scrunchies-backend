const crypto = require('crypto')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const imageDirectory = path.join(__dirname, 'image')
fs.mkdirSync(imageDirectory, { recursive: true })

const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

const storage = multer.diskStorage({
  destination: imageDirectory,
  filename(req, file, callback) {
    callback(null, `${crypto.randomUUID()}${extensions[file.mimetype]}`)
  }
})

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!extensions[file.mimetype]) return callback(new Error('Only JPEG, PNG, and WebP images are allowed.'))
    return callback(null, true)
  }
}).single('photo')