const db = require('../db/db');

// Insert a new URL into the database (custom_path as lowercase)
const insertUrl= async (original_url,short_url,expires_at) =>{
    const result= await db.query(
       'INSERT INTO urls (original_url,short_url,expires_at) VALUES ($1, LOWER$2, $3) RETURNING *',
       [original_url,short_url,expires_at]
    );
    return result.rows[0]
};

// Check if a custom path (short_url) exists (case-insensitive)
const getUrlByShortUrl = async (short_url) =>{
    const result = await db.query('SELECT * FROM urls WHERE LOWER(short_url) = LOWER($1)',[short_url]);
    return result.rows[0]; // Return the first match, if any
};

module.exports ={
    insertUrl,
    getUrlByShortUrl,
};