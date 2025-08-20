const express = require('express')
const multer = require('multer')
const mime = require('mime-types')
const { resizeImage , compressByQuality ,compressByTargetSize } = require('../controllers/imageController')
const router = new express.Router()



const upload = multer ({
    storage: multer.memoryStorage(),
    limits:{
        fileSize: 50 * 1024 * 1024 // Limit to 50MB
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|webp|heic|heif)$/)){
            return cb(new Error('Please upload an image in JPG, JPEG , WebP, HEIC , HEIF or PNG format'))
        }

        // const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
        // const mimeType = mime.lookup(file.originalname)
        // if(!validMimeTypes.includes(mimeType)){
        //     return cb(new Error('Invalid MIME type. Please upload a valid image.'));
        // }
        cb(undefined,true)
    }
})

router.post('/utility-of-tools/resize',upload.single('image'),async(req,res,next) =>{
    try{
        if (!req.file) throw new Error ('Image file is required.')
        await resizeImage(req,res)
    }catch(error){
        next(error)
    }
})

router.post('/utility-of-tools/compress-quality',upload.single('image'),async(req,res,next) =>{
    try{
        if (!req.file) throw new Error ('Image file is required.')
        await compressByQuality(req,res)
    }catch(error){
        next(error)
    }
})

router.post('/utility-of-tools/compress-target-size',upload.single('image'),async(req,res,next) =>{
    try{
        if (!req.file) throw new Error ('Image file is required.')
        await compressByTargetSize(req,res)
    }catch(error){
        next(error)
    }
})

// Error handling middleware
router.use((error,req,res,next) =>{
    res.status(400).json({ error: error.message })
})




module.exports = router