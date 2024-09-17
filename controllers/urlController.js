require('dotenv').config();
const { insertUrl ,getUrlByShortUrl } = require('../models/url');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('../db/db');
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

    // Normalize custom path to lowercase
    const normalizedCustomPath = custom_path ? custom_path.toLowerCase() : null ;

    // Enforce custom path length (maximum 10 characters)
    if ( normalizedCustomPath && normalizedCustomPath.length > 10){
        return res.status(400).json({ error: 'Custom path must be 10 characters or fewer' })
    }

    try{

        // Convert the provided expires_at value to the correct format, if present
        let expirationDate = null;
        if(expires_at){
            expirationDate = toPostgresDateTime(new Date(expires_at))
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
