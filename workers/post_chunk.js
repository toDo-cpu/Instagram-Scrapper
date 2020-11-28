const axios = require('axios')
const config = require('../stuff/config').api
function post_chunk( chunk , config , callback) {

    axios.post(config.HOST+ ':' + config.PORT + config.PATH , chunk)
        .then((results) => {
            if (results.status == 200)
            callback(`[LAZARE] Chunk posted uid : ${chunk.uid}`)
        })
        .catch((e) => {
            return callback(`[LAZARE] Can't post chunk ${chunk.uid} | err : ${e.message}`)
        })
} 
process.on('message' , (message) => {
    post_chunk(message , config , function(err , res) {
        if (err) {
            console.log(err)
        } else if (res) {
            console.log(res)
        }
        process.exit(0)
    }) 
})