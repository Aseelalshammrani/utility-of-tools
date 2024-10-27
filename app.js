const express = require('express')
const app=express()
const urlRoutes=require('./routers/url')
const imageRoutes = require('./routers/image')

app.use(express.json())
app.use(urlRoutes)
app.use(imageRoutes)
module.exports=app