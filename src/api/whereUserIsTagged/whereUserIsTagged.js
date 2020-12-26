const config = require('../../../stuff/config')
const sleep = require('../primary/sleep')
const querystring  = require('querystring')
const axios = require('axios')
const log = require('../primary/logMessage')
module.exports = (id , NavInfo , options , username) => new Promise(async(resolve , reject) => {
    try {
        log(`Scrappe links of ${username}` , 'info' , 'W.U.I.T')
        var posts = []
        var total_progress = 0
        var { url , headers } = await headersCreate(NavInfo , id)

        var response = await got(headers , url) 
        var res_data = response.data.user.edge_user_to_photos_of_you
        var has_next_page = res_data.page_info.has_next_page,
            end_cursor = res_data.page_info.end_cursor,
            total = res_data.count,
            egdes = res_data.edges

        total_progress += total

        if (options.v) {
            log(`${username}: ${total} new posts where user is tagged` ,'progress','W.U.I.T')
        }
        egdes.forEach(element => {
            posts.push(element)
        })
        if (options.hasOwnProperty('break')) {
            var compteur = 1
        }
        while(has_next_page) {
            if (options.hasOwnProperty('slowmode')) {
                await sleep(options.slowmode)
            }
            var { url , headers } = await headersCreate(NavInfo , id , end_cursor)
            var response = await got(headers , url) 
            var res_data = response.data.user.edge_user_to_photos_of_you
            var has_next_page = res_data.page_info.has_next_page,
                end_cursor = res_data.page_info.end_cursor,
                total = res_data.count,
                egdes = res_data.edges

            total_progress += total
            if (options.v && has_next_page != false) {
                log(`${username}: ${total} new posts where user is tagged` ,'progress','W.U.I.T')
            }

            egdes.forEach(element => {
                posts.push(element)
            })
            if (options.hasOwnProperty('break')) {
                if (compteur == options.break.eachXRequest) {
                    if (options.v) {
                        log(`Taking a break a ${options.break.time}ms`,'pause','W.U.I.T')
                    }
                    await sleep(options.break.time)
                    compteur = 0
                } else {
                    compteur++
                }
            }
        }
    } catch(e) {
        reject(e)
    }

    resolve(posts)
}) 
got = (headers , url) => new Promise((resolve , reject ) => {
    axios({url : url , headers : headers , methode : 'get'})
    .then((results) => {
        resolve(results.data)
    }).catch((e) => {
        reject(e)
    })
})

headersCreate = ( NavInfo , id , end_cursor=null) => new Promise((resolve , reject ) => {
    var cookies = NavInfo.cookies
    url_variables = { id : id , first : 12}
    if (end_cursor != null) {
        url_variables.after = end_cursor
    }
    const query_params = {
        query_hash : config.ig.graphql_hash_where_tagged,
        variables : JSON.stringify(url_variables)
    }
    const url = `${config.ig.host + config.ig.path + querystring.stringify(query_params)}`

    const headers = {}
    for ( i in NavInfo.headers) {
        headers[i] = NavInfo.headers[i]
    }
    headers['Cookie'] = cookies.join(';')
    headers['User-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"

    resolve({url , headers })

})