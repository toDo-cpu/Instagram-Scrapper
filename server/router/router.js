const express = require('express')
const router = express.Router()
const files_lists = require('../src/files_lists')
const fs = require('fs')

router.get('/' , function (req , res){
    var page = fs.readFileSync('./page/index.html')
    res.writeHead(200 , {'Conten-type' : 'text/html'})
    res.end(page)
})

router.get('/save/:file' , function(req , res){
    data = fs.readFileSync(`../save/${req.params.file}.json`)
    res.writeHead(200 , {'Content-type' : 'application/json'})
    res.end(data)
})

router.get('/files_lists' , function(req , res){
    var lists = files_lists()

    lists = lists.map(item => {
        file_without_extension = item.split('.')[0]
        return file_without_extension
    })
    i = 0
    while ( i < 100) {
        lists.push('' + i)
        i++
    }
    lists = JSON.stringify({
        count : lists.length,
        files : lists
    })

    res.writeHead(200 , {'Content-type' : 'application/json'})
    console.log(lists)
    res.end(lists)
})


module.exports = router