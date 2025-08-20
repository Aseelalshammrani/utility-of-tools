const express = require('express');
const router = new express.Router();
const { createShortUrl,redirectToOriginalUrl,getClickCount } = require('../controllers/urlController');
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,// 15 minutes
    max: 100,// limit each IP to 100 requests per windowMs
  })


// Route to shorten a URL
router.post('/utility-of-tools/shorten',limiter,createShortUrl);

// Route to redirect to the original URL
router.get('/utility-of-tools/:short_url',redirectToOriginalUrl)

// Route to get the click count for a short URL
router.get('/utility-of-tools/:short_url/click-count',getClickCount)

module.exports = router;
