const db = require('../db/db');

const insertUrl= async(original_url,short_code,expires_at,password) =>{
    const result= await db.query(
       'INSERT INTO urls (original_url,short_code,expires_at,password) VALUES ($1, $2, $3, $4) RETURNING *',
       [original_url,short_code,expires_at,password]
    );
    return result.rows[0]
};

// Check if a URL already exists in the database
const getUrlByOriginalUrl = async(original_url) =>{
    const result= await db.query('SELECT * FROM urls WHERE original_url= $1',[original_url]);
    return result.rows[0]; // Return the first match, if any
};

// Get the URL details by short code
const getUrlByShortCode = async (short_code) =>{
    const result = await db.query('SELECT * FROM urls WHERE short_code = $1',[short_code]);
    return result.rows[0];
};

module.exports ={
    insertUrl,
    getUrlByOriginalUrl,
    getUrlByShortCode,
};