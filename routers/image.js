const express = require('express')
const multer = require('multer')
const router = new express.Router()
const { compressImage } = require('../controllers/imageController')


const upload = multer ({
    dest:'uploads/',
    limits:{
        fileSize:5242880
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)){
            return cb(new Error('Please upload an image in JPG, JPEG , WebP, or PNG format'))
        }
        cb(undefined,true)
    }
})

router.post('/upload',upload.single('image'),async(req,res,next) =>{
    try{
        await compressImage(req,res)
    }catch(error){
        next(error)
    }
},(error,req,res,next) =>{
    res.status(400).json({
        error:error.message
    })
});


module.exports = router