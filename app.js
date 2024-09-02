require('dotenv').config()
const express = require('express')
const urlRouter=require('./routers/url')
const app=express()

app.use(express.json())
app.use(urlRouter)

module.exports=app