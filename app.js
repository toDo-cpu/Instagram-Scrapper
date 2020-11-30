const express = require('express')
const app = express()
const fs = require('fs')

app.get('/' , (req , res) => {

    


})
app.get('/:data/' , (req , res) => {
    data = loadData(req.params.data)
    res.writeHead(200 , { 'Content-type' : 'application/json'})
    res.end(data)

})
app.listen(8080 , '127.0.0.1' , () => {
    console.log('Server listenning at http://127.0.0.1:8080/')
})
loadData = (file_name) => {
    data = fs.readFileSync(`./save/${file_name}.json`)
    return data
}