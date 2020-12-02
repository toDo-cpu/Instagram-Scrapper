const config = require('../../../stuff/config')
const sleep = require('../primary/sleep')
const querystring  = require('querystring')
const axios = require('axios')
module.exports = fetchWhereUserIsTagged= (id , NavInfo) => new Promise(async(resolve , reject) => {

    var posts = []
    let { url , headers } = await createHeaders(NavInfo , id)
    var first_query = await get(headers , url) 

    var res_data = first_query.data.data.user.edge_user_to_photos_of_you
    var has_next_page = res_data.page_info.has_next_page,
        end_cursor = res_data.page_info.end_cursor,
        total = res_data.count
        


}) 
get = (headers , url) => new Promise((resolve , reject ) => {
    axios({url : url , headers : headers , methode : 'get'})
    .then((results) => {
        resolve(results)
    }).catch((e) => {
        reject(e)
    })
})

var createHeaders = ( NavInfo , id , end_cursor=null) => new Promise((resolve , reject ) => {
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
    headers['Cookie'] = NavInfo.cookies.join(';')
    headers['User-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"

    resolve({url , headers})

})