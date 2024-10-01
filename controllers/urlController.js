require('dotenv').config();
const { insertUrl ,getUrlByShortUrl } = require('../models/url');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const sql = require('../db/db');
const validator = require('validator')
const port=process.env.PORT;


//***Function to generate a short URL using uuid
const generateShortUrl = () =>{
    return uuidv4().slice(0,7) // Truncate UUID to the first 7 characters
};

// Function to remove the time portion and keep only the date
function stripTime(date){
    return new Date(date.getFullYear(),date.getMonth(),date.getDate())
}

// Function to validate date format (YYYY-MM-DD)
function isValidDate(dateString){
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  // Regex for "YYYY-MM-DD"
    return dateRegex.test(dateString)
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

        if (normalizedCustomPath.length > 15){
            return res.status(400).json({ error: 'Custom path must be 15 characters or fewer' })
        }

        if (/\s/.test(normalizedCustomPath)){ // Check for spaces
            return res.status(400).json({ error: 'Custom path should not contain spaces. Please use hyphens or underscores instead.'})
        }

    }

    try{

        // Validate that the expires_at is a valid date (YYYY-MM-DD) and in the future
        let expirationDate = null;
        const currentDateTime =new Date(); 

        if (expires_at) {
            if(!isValidDate(expires_at)){
                return res.status(400).json({ error: 'Please provide a valid date in the format YYYY-MM-DD without spaces' })
            }

            const providedDateTime = new Date(expires_at) // Parse the date

            // Check if the provided date is in the past
            if(providedDateTime < currentDateTime.setHours(0,0,0,0)){
                return res.status(400).json({ error: 'The expiration date cannot be in the past.' })
            }

            expirationDate = expires_at
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

const getClickCount = async (req,res) =>{
    const { short_url } = req.params

    try{
        const url = await getUrlByShortUrl(short_url);
        if(!url){
            return res.status(404).json({ error: 'URL not found'})
        }

        // Return click count to the user
        res.json({
            short_url: short_url,
            click_count: url.click_count
        })

    }catch(error){
        res.status(500).json({ error: 'Server error' })
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
        // Check if the URL has expired (compare only the date part)
        if (url.expires_at) {
            const currentDate = stripTime(new Date()); // Get current date without time
            const expirationDate = new Date(url.expires_at);  // Stored as DATE (no time)

            if (expirationDate < currentDate) {
                return res.status(410).json({ error: 'URL has expired' });
            }
        }



        // Increment click count
        await sql.query`
            UPDATE urls SET click_count = click_count + 1 WHERE short_url = ${short_url}
        `;

        // Redirect to the original URL
        res.redirect(url.original_url);

    }catch(error){
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = {
    createShortUrl,
    redirectToOriginalUrl,
    getClickCount
}
