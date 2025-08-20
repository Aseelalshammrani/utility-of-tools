const sharp = require('sharp')
const path = require('path')

const resizeImage = async (req,res) =>{
    try{
        const fileBuffer = req.file.buffer
        const width = req.body.width ? parseInt(req.body.width) :null
        const height = req.body.height ? parseInt(req.body.height) :null
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        if(!width && !height){
            return res.status(400).send('Width or height must be provided.')
        }

        if((width && width <= 0) || (height && height <= 0)){
            return res.status(400).send('Width and height must be positive integers')
        }

        const resizedBuffer = await sharp(fileBuffer)
            .resize({ width:width ,height: height })
            .toBuffer()
        
        res.set({
            'Content-Disposition': `attachment; filename="resized-image${fileExtension === '.heic' || fileExtension === '.heif' ? '.jpeg' : fileExtension}"`,
            'Content-Type': getContentType(fileExtension)
        })

        return res.send(resizedBuffer)
    }catch(error){
        console.error('Resizing failed:', error)
        res.status(500).send('Failed to resize the image')
    }
}

const compressByQuality = async(req,res) =>{
    try{
        const fileBuffer = req.file.buffer
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const quality = req.body.quality ? parseInt(req.body.quality,10) : 3

        if(isNaN(quality) || quality < 1 || quality > 5){
            return res.status(400).send('Quality must be between 1 and 5')
        }

        const sharpQuality = quality * 15

        const compressedBuffer = await processImageByFormat(
            sharp(fileBuffer),
            fileExtension,
            { quality: sharpQuality }
        )

        res.set({
            'Content-Disposition': `attachment; filename="compressed-image${fileExtension === '.heic' || fileExtension === '.heif' ? '.jpeg' : fileExtension}"`,
            'Content-Type': getContentType(fileExtension),
        })

        return res.send(compressedBuffer)
    }catch(error){
        console.error('Compression failed:', error)
        res.status(500).send('Failed to compress the image')
    }
}

const compressByTargetSize = async(req,res) =>{
    try{
        const fileBuffer = req.file.buffer
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const targetSizeKB= req.body.targetSize ? parseInt(req.body.targetSize ,10) : null

        if(!targetSizeKB || targetSizeKB <= 0){
            return res.status(400).send('Target size must be a positive number in KB.')
        }

        const result = await compressToTargetSize(sharp(fileBuffer),fileExtension,targetSizeKB,80)

        if(!result){
            return res.status(500).send('Unable to compress image to the desired size.')
        }

        const { compressedBuffer,compressedSizeKB } = result

        const message = 
            compressedSizeKB > targetSizeKB
                ?`The last compressed size (${compressedSizeKB.toFixed(2)} KB) is greater than the max size (${targetSizeKB} KB).`
                :'Image compressed successfully.'
        
        res.set({
            'Content-Disposition': `attachment; filename="compressed-image${fileExtension === '.heic' || fileExtension === '.heif' ? '.jpeg' : fileExtension}"`,
            'Content-Type': getContentType(fileExtension),
            'X-Message': message,
        })

        return res.send(compressedBuffer)
    } catch(error){
        console.error('Compression to target size failed:', error)
        res.status(500).send('Failed to compress image to target size.')
    }
}


const processImageByFormat = async (sharpInstance, fileExtension, options = {}) =>{
    switch(fileExtension){
        case '.jpg':
        case '.jpeg':
        case '.heic':
        case '.heif':
            return await sharpInstance.jpeg(options).toBuffer()
        case '.png':
            return await sharpInstance.png(options).toBuffer()
        case '.webp':
            return await sharpInstance.webp(options).toBuffer()
        default:
            throw new Error('Unsupported image format.')
    }
}

const getContentType = (fileExtension) =>{
    switch(fileExtension){
        case '.jpg':
        case '.jpeg':
        case '.heic':
        case '.heif':
            return 'image/jpeg';
        case '.png':
            return 'image/png'
        case '.webp':
            return 'image/webp'
        default:
            throw new Error('Unsupported image format.')
    }
}

const compressToTargetSize = async(sharpInstance,fileExtension,targetSizeKB ,initialQuality) =>{
    let quality = initialQuality
    let compressedBuffer = null
    let compressedSizeKB = null

    while (quality >= 10) {
        try{
            compressedBuffer = await processImageByFormat(sharpInstance,fileExtension,{ quality })
            compressedSizeKB = compressedBuffer.length / 1024 // Convert bytes to KB
            if(compressedSizeKB <= targetSizeKB){
				
                return { compressedBuffer , compressedSizeKB };
            }

        }catch(error){
            console.error('Error during compression:', error)
            break;
        }

        quality -= 10
    }

    if(compressedBuffer && compressedSizeKB){
        return {compressedBuffer , compressedSizeKB}
    }

    return null
}

module.exports = { resizeImage , compressByQuality ,compressByTargetSize }