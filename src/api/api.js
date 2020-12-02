const sleep = require('./sleep')
const get = require('./get')
const fetchAllPost = require('./fetchAllPost')

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
            for ( i in username_list) {
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
                console.log(`\x1b[32m[LAZARE][SCRAPPE][${account}] profile scrapped\x1b[0m`)
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
                console.log(`\x1b[LAZARE][SCRAPPE][${account}] profile wasn't scrapped\x1b[0m`)
            }
            reject(e)
        }
    })
}