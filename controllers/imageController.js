const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// Set the size threshold to 2MB (for laptop-sized images)
const sizeThreshold = 2097; // 2MB = 2,097,152 bytes

const compressImage = async (req,res) =>{
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLocaleLowerCase(); // Get original file extension
    const outputPath = `compressed/${Date.now()}-compressed${fileExtension}`

    const quality = parseInt(req.query.quality) || 20

    // Ensure quality is within acceptable bounds (1-100)
    if (quality < 1 || quality >100){
        return res.status(400).send('Quality must be between 1 and 100')
    }

    try{

        const fileSize = fs.statSync(filePath).size;

        // Compress only if the image size exceeds the threshold (e.g., larger than 2MB)
        if(fileSize > sizeThreshold){
            const image = sharp(filePath)

            // Apply compression based on the original format
            switch(fileExtension){
                case '.jpg':
                case '.jpeg':
                    await image.jpeg({ quality:quality }).toFile(outputPath)
                    break;
                case '.png':
                    await image.png({ quality:quality }).toFile(outputPath)
                    break;
                case '.webp':
                    await image.webp({ quality:quality }).toFile(outputPath)
                    break; 
            }

            // Respond with the compressed image
            res.download(outputPath,(err) =>{
                // Delete the files after sending the response
                fs.unlinkSync(filePath);
                fs.unlinkSync(outputPath)
            })
        }else{
            res.status(200).json({
                message: 'Image is smaller than the size threshold and was not compressed.',
                fileSize: `${(fileSize / 1024).toFixed(2)} KB`
            })
        }

    }catch(error){
        console.log(error)
        res.status(500).send('Failed to process the image')
    }

}

module.exports = { compressImage }
