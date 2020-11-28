const axios = require('axios')
const config = require('../stuff/config')
const querystring = require('querystring')

createHeaders = (username , navigationInfo) =>  new Promise((resolve ,reject) => {
        const url = `https://www.instagram.com/${username}/?__a=1`
        const headers = {}
        for ( i in navigationInfo.headers) {
            headers[i] = navigationInfo.headers[i]
        }
        headers['Cookie'] = navigationInfo.cookies.join(';')
        headers['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"
        resolve({headers , url})
    })
sleep = (ms) => new Promise((resolve , reject) => {
    setTimeout(function(){ resolve() } , ms)
})
queryApi = (headers , url) => new Promise((resolve , reject ) => {
    axios({url : url , headers : headers , methode : 'get'})
    .then((results) => {
        resolve(results.data.graphql.user)
    }).catch((e) => {
        reject(e)
    })
})
module.exports =(accounts , NavInfo , options) => new Promise(async(resolve , reject) => {
    target = options.target
    console.log(`[LAZARE] Starting scrapping`)
    if (Array.isArray(accounts)) {
        if (options.hasOwnProperty('break')) {
            compteur = 1
            var results = []
            var errors = []
            for ( i in accounts) {
                var item = accounts[i]
                var { headers , url} = await createHeaders(item.username, NavInfo)
                try {
                    if (options.hasOwnProperty('slowmode')) {
                        await sleep(options.slowmode)
                    }
                    data = await queryApi(headers , url)
                    if ( options.v) {
                        console.log(`\x1b[35m[LAZARE] ${target} | ${item.username} scrapped\x1b[0m`)
                    }
                    results.push(data)
                } catch(e) {
                    console.log(e)
                    if ( options.v) {
                        console.log(`\x1b[31m[LAZARE] ${target} | ${item.username} was not scrapped\x1b[0m`)
                    }
                    errors.push({ account : item.username , e : e})
                }
                if (compteur == options.break.eachXRequest) {
                    if (options.v) {
                        console.log(`\x1b[33m[LAZARE] Taking a break a ${options.break.time}ms \x1b[0m`)
                    }
                    await sleep(options.break.time)
                    compteur = 1
                } else {
                    compteur++
                }
            }
            resolve({ results : results , errors : errors})
        } else {
            var results = []
            var errors = []
            for ( i in accounts) {
                var item = accounts[i]
                var { headers , url} = await createHeaders(item.username, NavInfo)
                try {
                    if (options.hasOwnProperty('slowmode')) {
                        await sleep(options.slowmode)
                    }
                    data = await queryApi(headers , url)
                    if ( options.v) {
                        console.log(`\x1b[35m[LAZARE] ${target} | ${item.username} scrapped\x1b[0m`)
                    }
                    results.push(data)
                } catch(e) {
                    console.log(e)
                    if ( options.v) {
                        console.log(`\x1b[31m[LAZARE] ${target} | ${item.username} was not scrapped\x1b[0m`)
                    }
                    errors.push({ account : item.username , e : e})
                }
            }  
        }
        
    } else if (typeof(accounts) == "string") {
        var { headers , url} = await createHeaders(accounts, NavInfo)
            try {
                data = await queryApi(headers , url)
                if ( options.v) {
                    console.log(`\x1b[35m[LAZARE] ${accounts} scrapped\x1b[0m`)
                }
                resolve(data)
            } catch(e) {
                console.log(e)
                if (options.v) {
                    console.log(`\x1b[31m[LAZARE] ${target} was not scrapped\x1b[0m`)
                }
               reject(e)
            }
    }

})

fetchAllPost = (id , end_cursor , has_next_page) => new Promise(async(resolve , reject) => {
    var posts = []
    while(has_next_page) {
        url_variables = { id : id , first : 12 , after : end_cursor}
        const query_params = {
            query_hash : config.ig.graphql_query_hash,
            variables : JSON.stringify(url_variables)
        }
        const url = `${config.ig.host + config.ig.path + querystring.stringify(query_params)}`

        var response = await axios.get(url)

        for ( i in data.data.user.edge_owner_to_timeline_media.edges) {
            posts.push(data.data.user.edge_owner_to_timeline_media.edges[i])
        }

        has_next_page = response.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page
        end_cursor = response.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page

    }
    resolve(results)
})
