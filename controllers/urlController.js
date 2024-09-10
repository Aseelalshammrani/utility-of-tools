require('dotenv').config()
const { insertUrl , getUrlByOriginalUrl ,getUrlByShortUrl} = require('../models/url');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('../db/db')
const port=process.env.PORT;


//***Function to generate a short URL using uuid
const generateShortUrl = () =>{
    return uuidv4().slice(0,7) // Truncate UUID to the first 7 characters
};

//***Create a new short URL
const createShortUrl = async (req,res) =>{
    const { original_url,short_url,expires_at} = req.body;

    try{
        const existingUrl = await getUrlByOriginalUrl(original_url);
        if (existingUrl) {
            // If the URL exists, return the existing short URL and QR code
            const qrCodeUrl = await QRCode.toDataURL(`http://localhost:${port}/${existingUrl.short_url}`);
            return res.json({ short_url: `http://localhost:${port}/${existingUrl.short_url}` , qr_code:qrCodeUrl});
        }

        // Generate a short URL using uuid if none is provided
        const generatedShortUrl = short_url || generateShortUrl();

        // If expires_at is not provided, store null
        const expirationDate = expires_at || null ;

        // Insert the new URL into the database
        const newUrl = await insertUrl(original_url,generatedShortUrl,expirationDate);

        // Generate a QR code for the new short URL
        const qrCodeUrl= await QRCode.toDataURL(`http://localhost:3000/${generatedShortUrl}`)

        // Respond with the new short URL and QR code
        res.json({ short_url:`http://localhost:3000/${generatedShortUrl}`, qr_code:qrCodeUrl })
    }catch(error){
        res.status(500).json({ error: 'Error creating short URL' })
    }
}

//***Redirect to the original URL and check for expiration
const redirectToOriginalUrl = async (req,res) =>{
    const { short_url } = req.params;

    try{
        const url = await getUrlByShortUrl(short_url);
        if (!url){
            return res.status(404).json({ error: 'URL not found' })
        }

        // Check if the URL has expired
        if (url.expires_at && new Date() > new Date(url.expires_at)){
            return res.status(410).json({ error: 'URL has expired' });
        }

        // Increment click count
        await db.query('UPDATE urls SET click_count = click_count + 1 WHERE short_url = $1',[short_url]);

        // Redirect to the original URL
        res.redirect(url.original_url);

    }catch(error){
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createShortUrl,
    redirectToOriginalUrl,
}
