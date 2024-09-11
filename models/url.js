const db = require('../db/db');

const insertUrl= async(original_url,short_url,expires_at) =>{
    const result= await db.query(
       'INSERT INTO urls (original_url,short_url,expires_at) VALUES ($1, $2, $3) RETURNING *',
       [original_url,short_url,expires_at]
    );
    return result.rows[0]
};

// Check if a combination of original URL and custom domain exists
const getUrlByOriginalAndCustomDomain = async (original_url,short_url) =>{
    const result = await db.query(
    'SELECT * FROM urls WHERE original_url = $1 AND short_url = $2',
    [original_url,short_url]
    );
    return result.rows[0]; // Return the first match, if any
}


// Get the URL details by short url
const getUrlByShortUrl = async (short_url) =>{
    const result = await db.query('SELECT * FROM urls WHERE short_url = $1',[short_url]);
    return result.rows[0];
};

module.exports ={
    insertUrl,
    getUrlByOriginalAndCustomDomain,
    getUrlByShortUrl,
};