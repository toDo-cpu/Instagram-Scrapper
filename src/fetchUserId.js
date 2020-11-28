const axios = require('axios')

module.exports = (options) => new Promise((resolve , reject) => {
    var username = options.target
    if (options.v) {
        console.log(`[LAZARE] Getting the id of ${username}`)
    }
    axios.get('https://www.instagram.com/' + username + '/')
            .then((response) => {
                html = response.data
                data = JSON.parse(html.match(/window\._sharedData\s?=\s?({.+);<\/script>/)[1])
                userRawData = data.entry_data.ProfilePage[0].graphql.user
                if (options.v) {
                    console.log(`\x1b[32m[LAZARE] ${options.target} id is ${userRawData.id}\x1b[0m`)
                }
                resolve(userRawData.id)
            })
            .catch((err) => {
                console.log(err)
            })

})