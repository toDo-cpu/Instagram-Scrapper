const data = require('./save/dev.json')
const transform = require('./src/transform/transform')
const fs =require('fs')
const NavInfo = require('./stuff/NavigationSave.json')
const axios = require('axios')
const config = require('./stuff/config')
const querystring = require('querystring')
/*transform(data).then((d) => {
    console.log(d)
    fs.writeFileSync('./dev.json' , JSON.stringify(d) , { flag : 'w+'})
})*/

sleep = (ms) => new Promise((r) => {
    setTimeout(function(){
        r()
    } , ms)
})
createHeaders = (navigationInfo ) => new Promise((resolve , reject) => {
        const headers = {}
        for ( i in navigationInfo.headers) {
            headers[i] = navigationInfo.headers[i]
        }
        headers['Cookie'] = navigationInfo.cookies.join(';')
        headers['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"
        resolve(headers)
})
fetchAllPost = (id , end_cursor , has_next_page , NavInfo) => new Promise(async(resolve , reject) => {
    var posts = []
    while(has_next_page) {

        await sleep(850)
        headers  = await createHeaders(NavInfo)
        url_variables = { id : id , first : 12 , after : end_cursor}
        const query_params = {
            query_hash : config.ig.graphql_query_hash,
            variables : JSON.stringify(url_variables)
        }
        const url = `${config.ig.host + config.ig.path + querystring.stringify(query_params)}`
        console.log(url)
        var response = await axios.get(url , headers)
        console.log(response.data)
        for ( i in response.data.data.user.edge_owner_to_timeline_media.edges) {
            posts.push(response.data.data.user.edge_owner_to_timeline_media.edges[i])
        }

        has_next_page = response.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page
        end_cursor = response.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor

    }
    resolve(posts)
})

fetchAllPost( 14913359038, "QVFDNmFta0FJVHozTENSek42NmowVGg3cEgzRWJya3k3a2tqaTlrUFJxUjg1YU5TcDgzeGJqTVFJOUFYOVE4c0d3YXhCakIwZE0yMDBIQVpmcFd1dWV1ag==" , true , NavInfo).then(data => {
    console.log(data)
})

