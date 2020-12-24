const sleep = require('../primary/sleep')
const axios = require('axios')
const config = require('../../../stuff/config')
const querystring = require('querystring')
const fetchProfile = require('../fetchProfile/query')

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
fetchAllPosts = (id , end_cursor , has_next_page , options , username , NavInfo , total_count , yet_collected_number) => new Promise(async(resolve , reject) => {

    if (options.hasOwnProperty('break')) {
        var compteur = 1
    }
    var number_of_posts = yet_collected_number
    var posts = []

    while(has_next_page) {
        if (options.hasOwnProperty('slowmode')) {
            await sleep(options.slowmode)
        }

        let { url , headers} = await createHeaders(end_cursor , NavInfo , id)

        try {
            var response = await axios.get(url , headers)
            if (response.data.status != 'ok' || response.data.data.user.edge_owner_to_timeline_media.edges.length == 0) {
                console.log(`[${username}][POST] Can't retrieve others posts`)
                throw new Error(JSON.stringify({ type : 'reponse' , url : url , headers : headers , content : response.data}))
            }
            for ( i in response.data.data.user.edge_owner_to_timeline_media.edges) {
                posts.push(response.data.data.user.edge_owner_to_timeline_media.edges[i])
            }
            new_posts_length = response.data.data.user.edge_owner_to_timeline_media.edges.length
            number_of_posts+=new_posts_length
            if (options.v) {
                console.log(`[${username}][POST] ${number_of_posts}/${total_count} posts`)
            }
            has_next_page =  response.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page
            end_cursor = response.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor

        } catch(e) {
            console.log(`[${username}][POST] Can't query api`)
            reject(e)
            break;
        }
        if (options.hasOwnProperty('break')) {
            if (compteur == options.break.eachXRequest) {
                if (options.v) {
                    console.log(`Taking a break a ${options.break.time}ms`)
                }
                await sleep(options.break.time)
                compteur = 1
            } else {
                compteur++
            }
        }
    }
    resolve(posts)
})
module.exports = (id , NavInfo , options, info=null) => new Promise(async(resolve , reject )=> {
    try {
        if (info!=null) {
            const end_cursor = info.end_cursor,
                    has_next_page = info.has_next_page ,
                    username = info.username,
                    total_count = info.total_count
                    yet_collected_number = info.yet_collected_number
            if (options.v) { console.log(`[${username}][POST] ${yet_collected_number}/${total_count} posts`) }
            var posts = await fetchAllPosts(id , end_cursor , has_next_page , options , username , NavInfo , total_count , yet_collected_number)
                
        } else {
            let profile = await fetchProfile.single_query(id , NavInfo , options)
            let media = profile.edge_owner_to_timeline_media
            const end_cursor = media.page_info.end_cursor,
                has_next_page = media.page_info.has_next_page,
                username = profile.username,
                total_count = media.count,
                yet_collected_number = media.edges.length
            if (options.v) { console.log(`[${username}][POST] ${yet_collected_number}/${total_count} posts`) }
            var posts = await fetchAllPosts(id , end_cursor , has_next_page , options , username , NavInfo , total_count , yet_collected_number)
        }
        resolve(posts)
    } catch(e) {
        reject(e)
    }
    
})