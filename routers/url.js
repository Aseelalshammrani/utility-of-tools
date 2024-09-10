const express = require('express');
const router = new express.Router();
const { createShortUrl,redirectToOriginalUrl } = require('../controllers/urlController');
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,// 15 minutes
  max: 100,// limit each IP to 100 requests per windowMs
})


// Route to shorten a URL
router.post('/shorten',limiter,createShortUrl);

// Route to redirect to the original URL
router.get('/:short_url',redirectToOriginalUrl)

module.exports = router;
