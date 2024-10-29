const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// Set the size threshold to 2MB (for laptop-sized images)
const sizeThreshold = 2097; // 2MB = 2,097,152 bytes

const compressImage = async (req,res) =>{
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLocaleLowerCase(); // Get original file extension
    const outputPath = `compressed/${Date.now()}-compressed${fileExtension}`

    const quality = parseInt(req.body.quality) || 3

    // Ensure quality is within acceptable bounds (1-100)
    if (quality < 1 || quality > 5){
        fs.unlinkSync(filePath)
        return res.status(400).send('Quality must be between 1 and 5')
    }

    try{

        const fileSize = fs.statSync(filePath).size;

        // Compress only if the image size exceeds the threshold (e.g., larger than 2MB)
        if(fileSize > sizeThreshold){
            const image = sharp(filePath)

            const sharpQuality = quality * 20
            // Apply compression based on the original format
            switch(fileExtension){
                case '.jpg':
                case '.jpeg':
                    await image.jpeg({ quality:sharpQuality}).toFile(outputPath)
                    break;
                case '.png':
                    await image.png({ quality:sharpQuality}).toFile(outputPath)
                    break;
                case '.webp':
                    await image.webp({ quality:sharpQuality}).toFile(outputPath)
                    break; 
            }

            // Respond with the compressed image
            res.download(outputPath,(err) =>{
               cleanupFiles(filePath, outputPath);
            })
        }else{
            cleanupFiles(filePath)
            res.status(200).json({
                message: 'Image is smaller than the size threshold and was not compressed.',
                fileSize: `${(fileSize / 1024).toFixed(2)} KB`
            })
        }

    }catch(error){
        cleanupFiles(filePath, outputPath);
        res.status(500).send('Failed to process the image')
    }


}

const cleanupFiles = (...files) => {
    files.forEach((file) => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
};

module.exports = { compressImage }
