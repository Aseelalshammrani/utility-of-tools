const express = require('express')
const app=express()
const urlRoutes=require('./routers/url')


app.use(express.json())
app.use(urlRoutes)

module.exports=app