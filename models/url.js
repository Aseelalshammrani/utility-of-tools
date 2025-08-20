const sql = require('../db/db');

// Insert a new URL into the database (custom_path as lowercase)
const insertUrl= async (original_url,short_url,expires_at) =>{
    try{
        const result = await sql.query`
            INSERT INTO url (original_url, short_url, expires_at)
            VALUES (${original_url},LOWER(${short_url}), ${expires_at})
            SELECT SCOPE_IDENTITY() AS id;
        `;
         return result.recordset[0]
    } catch (error){
        console.error('Error inserting URL into database: ',error);
        throw error;
    }
    
};

// Check if a custom path (short_url) exists (case-insensitive)
const getUrlByShortUrl = async (short_url) =>{
    try{
        const result = await sql.query`
            SELECT * FROM url WHERE LOWER(short_url) = LOWER(${short_url})
        `;
        return result.recordset[0]; // Return the first match, if any
    } catch(error){
        console.error('Error fetching URL from database: ',error);
        throw error;
    }
    
};

module.exports ={
    insertUrl,
    getUrlByShortUrl,
};