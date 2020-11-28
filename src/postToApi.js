const axios = require('axios')
module.exports = (config , options , payload) => new Promise((resolve , reject) => {

    const url = `${config.PROTOCOL}://${config.HOST}:${config.PORT}${config.PATH}`

    axios.post(url , payload).then((res) =>{
        if (options.v) {
            console.log(`\x1b[33m[LAZARE] Data posted to ${url}\x1b[0m`)
        }
        resolve()
    }).catch(e => {
        if (options.v) {
            console.log(`\x1b[33m[LAZARE] Wasn't posted to ${url}\x1b[0m`)
            console.log(e)
            reject(e)
        }
    })

})