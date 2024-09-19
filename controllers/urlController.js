require('dotenv').config();
const { insertUrl ,getUrlByShortUrl } = require('../models/url');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('../db/db');
const validator = require('validator')
const port=process.env.PORT;


//***Function to generate a short URL using uuid
const generateShortUrl = () =>{
    return uuidv4().slice(0,7) // Truncate UUID to the first 7 characters
};

function toPostgresDateTime(jsDate){
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2,'0'); // JS months are 0-based
    const day = String(jsDate.getDate()).padStart(2,'0');
    const hours = String(jsDate.getHours()).padStart(2,'0');
    const minutes = String(jsDate.getMinutes()).padStart(2,'0');
    const seconds = String(jsDate.getSeconds()).padStart(2,'0');

   // Format as "YYYY-MM-DD HH:MM:SS" for PostgreSQL
   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//***Create a new short URL with a unique custom path (case-insensitive)
const createShortUrl = async (req,res) =>{
    const { original_url,custom_path,expires_at} = req.body;

    // Validate URL format using validator
    if(!validator.isURL(original_url,{ protocols: ['http', 'https'],require_protocol: true })){
        return res.status(400).json({ error: 'The provided original URL is not a valid http or https link.' })
    }

    // Normalize custom path to lowercase
    const normalizedCustomPath = custom_path ? custom_path.toLowerCase() : null ;

    
    // Validate custom path length and disallow spaces
    if(normalizedCustomPath){

        if (normalizedCustomPath.length > 10){
            return res.status(400).json({ error: 'Custom path must be 10 characters or fewer' })
        }

        if (/\s/.test(normalizedCustomPath)){ // Check for spaces
            return res.status(400).json({ error: 'Custom path should not contain spaces. Please use hyphens or underscores instead.'})
        }

    }
    

    try{

        // Validate that the expires_at is today or a future date and time
        let expirationDate = null;
        const currentDateTime = new Date();

        if (expires_at){
            let providedDateTime;

            // Check if the user provided only a date without a time
            if(expires_at.length === 10){  // Format "YYYY-MM-DD" (10 characters)
                providedDateTime = new Date(`${expires_at}T23:59:59`)
            }else{
                // Parse the provided expires_at if it contains both date and time
                providedDateTime = new Date(expires_at)
            }

            // Check if the provided date and time is in the past
            if( providedDateTime < currentDateTime){
                return res.status(400).json({ error: 'The expiration date or time cannot be in the past.'})
            }
            expirationDate = toPostgresDateTime(providedDateTime);
        }

        

        // Check if the custom path already exists (case-insensitive)
        if(normalizedCustomPath){
            const existingEntry = await getUrlByShortUrl(normalizedCustomPath);
            if(existingEntry){
                return res.status(409).json({ error: 'The custom path is already taken' })
            }
        }

        // Generate a short URL using uuid if no custom path is provided
        const shortUrl  = normalizedCustomPath || generateShortUrl();


        // Insert the new URL into the database
        const newUrl = await insertUrl(original_url,shortUrl,expirationDate);

        // Generate a QR code for the new short URL
        const qrCodeUrl= await QRCode.toDataURL(`http://localhost:${port}/${shortUrl}`)

        // Respond with the new short URL and QR code
        res.json({ short_url:`http://localhost:${port}/${shortUrl}`, qr_code:qrCodeUrl })
    }catch(error){
        res.status(500).json({ error: 'Error creating short URL' })
        console.log(error)
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
