const axios = require('axios')
const config = require('../stuff/config')
const querystring = require('querystring')

createHeaders = (username , navigationInfo ) =>  new Promise((resolve ,reject) => {
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
get = (headers , url) => new Promise((resolve , reject ) => {
    axios({url : url , headers : headers , methode : 'get'})
    .then((results) => {
        resolve(results.data.graphql.user)
    }).catch((e) => {
        reject(e)
    })
})
fetchAllPost = (id , end_cursor , has_next_page , options , username , NavInfo , total_count) => new Promise(async(resolve , reject) => {
    if (options.hasOwnProperty('break')) {
        var compteur = 1
    }
    if (options.v && has_next_page == true) {
        console.log(`\x1b[32m[LAZARE] ${username} | posts_count ${total_count}\x1b[0m`)
    }
    var number_of_posts = 0
    var posts = []
    var errors = []
    while(has_next_page) {
        if (options.hasOwnProperty('slowmode')) {
            await sleep(options.slowmode)
        }
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

        try {
            var response = await axios.get(url , headers)
            if (response.data.status != 'ok' || response.data.data.user.edge_owner_to_timeline_media.edges.length == 0) {
                console.log(`\x1b[31m[LAZARE][${username}] Can't retrieve others posts \x1b[0m`)
                throw new Error(JSON.stringify({ type : 'reponse' , url : url , headers : headers , content : response.data}))
            }
            for ( i in response.data.data.user.edge_owner_to_timeline_media.edges) {
                posts.push(response.data.data.user.edge_owner_to_timeline_media.edges[i])
            }
            new_posts_length = response.data.data.user.edge_owner_to_timeline_media.edges.length
            number_of_posts+=new_posts_length
            if (options.v) {
                console.log(`\x1b[32m[LAZARE][${username}] ${number_of_posts}/${total_count} posts\x1b[0m`)
            }
            has_next_page =  response.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page
            end_cursor = response.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor
        } catch(e) {
            try  {
                e = JSON.parse(e.message)
            } catch (e) {}
            
            if (e.hasOwnProperty('type')) {
                errors.push(e)
            } else {
                console.log(`\x1b[31m[LAZARE][${username}] Can't query api \x1b[0m`)
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
module.exports = api = {
    multi_query : (username_list , NavInfo , options) => new Promise(async(resolve , reject ) => {
        if (options.hasOwnProperty('break')) {
            var compteur = 1
            var results = []
            for (  i in username_list) {
                if (options.hasOwnProperty('slowmode')) {
                    await sleep(options.slowmode)
                }
                try {
                    data = await api.single_query(username_list[i], NavInfo , options)
                    results.push({ status : 'ok' , content : data})
                } catch(e) {
                    results.push({status : 'fail' , content : e})
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
            resolve(results)
        } else {
            var results = []
            for (  i in username_list) {
                if (options.hasOwnProperty('slowmode')) {
                    await sleep(options.slowmode)
                }
                try {
                    data = await api.single_query(username_list[i], NavInfo , options)
                    results.push({ status : 'ok' , content : data})
                } catch(e) {
                    results.push({status : 'fail' , content : e})
                }
            }
            resolve(results)
        }
    }),
    single_query : (account , NavInfo , options) => new Promise(async(resolve,reject) => {
        var { headers , url} = await createHeaders(account, NavInfo)
        try {
            data = await get(headers , url)
            if (options.v) {
                console.log(`\x1b[32m[LAZARE] ${account} scrapped\x1b[0m`)
            }
            if (data.edge_owner_to_timeline_media.page_info.has_next_page) {

                var firsts_posts = data.edge_owner_to_timeline_media.edges
                var page_info = data.edge_owner_to_timeline_media.page_info
                var total_post_counts = data.edge_owner_to_timeline_media.count
                var {new_posts , errors} = await fetchAllPost(data.id , page_info.end_cursor , page_info.has_next_page , options , account , NavInfo , total_post_counts)

                data.edge_owner_to_timeline_media.edges = firsts_posts.concat(new_posts)
                data.edge_owner_to_timeline_media.errors = errors

            }
            resolve(data)
        } catch(e) {
            if (options.v) {
                console.log(`\x1b[31m[LAZARE][${account}] was not scrapped\x1b[0m`)
            }
            reject(e)
        }
    })
}