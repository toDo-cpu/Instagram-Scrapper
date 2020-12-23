const sleep = require('../primary/sleep')
const axios = require('axios')
const config = require('../../../stuff/config')
const querystring = require('querystring')

var createHeaders = (end_cursor , NavInfo , id) => new Promise((resolve , reject ) => {
    url_variables = { id : id , first : 12 , after : end_cursor}
    const query_params = {
        query_hash : config.ig.graphql_query_hash,
        variables : JSON.stringify(url_variables)
    }
    const url = `${config.ig.host + config.ig.path + querystring.stringify(query_params)}`

    const headers = {}
    for ( i in NavInfo.headers) {
        headers[i] = NavInfo.headers[i]
    }
    headers['Cookie'] = NavInfo.cookies.join(';')
    headers['User-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"

    resolve({url , headers})

})

module.exports = (id , end_cursor , has_next_page , options , username , NavInfo , total_count) => new Promise(async(resolve , reject) => {
    if (options.hasOwnProperty('break')) {
        var compteur = 1
    }
    if (options.v) {
        console.log(`\x1b[32m[LAZARE][${username}][POST] total post to scrappe ${total_count}\x1b[0m`)
    }
    var number_of_posts = 0
    var posts = []
    var errors = []

    while(has_next_page) {
        if (options.hasOwnProperty('slowmode')) {
            await sleep(options.slowmode)
        }

        let { url , headers} = await createHeaders(end_cursor , NavInfo , id)

        try {
            var response = await axios.get(url , headers)
            if (response.data.status != 'ok' || response.data.data.user.edge_owner_to_timeline_media.edges.length == 0) {
                console.log(`\x1b[31m[LAZARE][${username}][POST] Can't retrieve others posts \x1b[0m`)
                throw new Error(JSON.stringify({ type : 'reponse' , url : url , headers : headers , content : response.data}))
            }
            for ( i in response.data.data.user.edge_owner_to_timeline_media.edges) {
                posts.push(response.data.data.user.edge_owner_to_timeline_media.edges[i])
            }
            new_posts_length = response.data.data.user.edge_owner_to_timeline_media.edges.length
            number_of_posts+=new_posts_length
            if (options.v) {
                console.log(`\x1b[32m[LAZARE][${username}][POST] ${number_of_posts}/${total_count} posts\x1b[0m`)
            }
            has_next_page =  response.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page
            end_cursor = response.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor

        } catch(e) {
            try  {
                e = JSON.parse(e.message)
            } catch (err) {}
            
            if (e.hasOwnProperty('type')) {
                errors.push(e)
            } else {
                console.log(`\x1b[31m[LAZARE][${username}][POST] Can't query api \x1b[0m`)
                errors.push({type : 'request' , url : url , headers : headers , content : e})
            }
            has_next_page = false
        }
        if (options.hasOwnProperty('break')) {
            if (compteur == options.break.eachXRequest) {
                if (options.v) {
                    console.log(`\x1b[33m[LAZARE] Taking a break a ${options.break.time}ms\x1b[0m`)
                }
                await sleep(options.break.time)
                compteur = 1
            } else {
                compteur++
            }
        }
    }
    resolve({posts , errors})
})