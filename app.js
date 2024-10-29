const express = require('express')
const app=express()
const imageRoutes = require('./routers/image')

app.use(express.json())
app.use(imageRoutes)
module.exports=app