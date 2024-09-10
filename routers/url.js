const express = require('express');
const router = new express.Router();
const { createShortUrl,redirectToOriginalUrl } = require('../controllers/urlController');

// Route to shorten a URL
router.post('/shorten',createShortUrl);

// Route to redirect to the original URL
router.get('/:short_url',redirectToOriginalUrl)

module.exports = router;
