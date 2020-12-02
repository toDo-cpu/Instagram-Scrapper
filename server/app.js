const express = require('express')
const app = express()
const router = require('./router/router')
const path = require('path')

app.use(express.static(path.join('./public')))

app.use('/' , router)

app.listen(8080 , '127.0.0.1' , () => {
    console.log('Server listenning at http://127.0.0.1:8080/')
})
