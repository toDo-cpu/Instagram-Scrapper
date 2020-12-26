const axios = require('axios')
const querystring = require('querystring')
const config = require('../../../stuff/config')
const crypto = require('crypto')
const child_process = require('child_process')
const log = require('../primary/logMessage')
module.exports = (id , navigationInfo , chunk , options) => new Promise(async(resolve , reject) => {  
    log(`Scrappe followers of ${options.target}`,'info','followers')
    if (options.hasOwnProperty('break')) {
        var compteur = 1
        var accountFollowers = []
        var number_of_followers_obtained = 0
        var {followers , has_next_page , end_cursor , uid , total_followers} = await fetchFollowers(id , navigationInfo , chunk)
        number_of_followers_obtained = number_of_followers_obtained +  followers.length
        accountFollowers.push(followers)
        if (options.v) {
            log(`${options.target}: ${number_of_followers_obtained}/${total_followers}` ,'progress','followers')
        }
        if (options.hasOwnProperty('post_chunk') && options.post_chunk == true) {
            post_chunk(followers , uid , options)
        }
        compteur++
        while(has_next_page) {
            if (options.hasOwnProperty('slowmode')) {
                await sleep(options.slowmode)
            } else {
                await sleep(500)
            }
            var {followers , has_next_page , end_cursor , uid , total_followers} = await fetchFollowers(id , navigationInfo , chunk , end_cursor)
            number_of_followers_obtained = number_of_followers_obtained +  followers.length
            accountFollowers.push(followers)
            if (options.v) {
                log(`${options.target}: ${number_of_followers_obtained}/${total_followers}` ,'progress','followers')
            }
            if (options && options.hasOwnProperty('post_chunk') && options.post_chunk == true) {
                post_chunk(followers , uid , options)
            }
            if (compteur == options.break.eachXRequest) {
                if (options.v) {
                    log(`Taking a break a ${options.break.time}ms`,'pause','followers')
                }
                await sleep(options.break.time)
                compteur = 1
            } else {
                compteur++
            } 
            
        }   
        accountFollowers = await convert2Dto1D(accountFollowers)
        resolve(accountFollowers)
    } else {
        var accountFollowers = []
        var number_of_followers_obtained = 0
        var {followers , has_next_page , end_cursor , uid , total_followers} = await fetchFollowers(id , navigationInfo , chunk)
        number_of_followers_obtained = number_of_followers_obtained +  followers.length
        accountFollowers.push(followers)
        if (options.v) {
            log(`${options.target}: ${number_of_followers_obtained}/${total_followers}` ,'progress','followers')
        }
        if (options && options.hasOwnProperty('post_chunk') && options.post_chunk == true) {
            post_chunk(followers , uid , options)
        }
        while(has_next_page) {
            if (options.hasOwnProperty('slowmode')) {
                await sleep(options.slowmode)
            } else {
                await sleep(500)
            }
            var {followers , has_next_page , end_cursor , uid , total_followers} = await fetchFollowers(id , navigationInfo , chunk , end_cursor)
            number_of_followers_obtained = number_of_followers_obtained +  followers.length
            accountFollowers.push(followers)
            if (options.v) {
                log(`${options.target}: ${number_of_followers_obtained}/${total_followers}` ,'progress','followers')
            }
            if (options && options.hasOwnProperty('post_chunk') && options.post_chunk == true) {
                post_chunk(followers , uid , options)
            }            
        }   
        accountFollowers = await convert2Dto1D(accountFollowers)
        resolve(accountFollowers)
    }
})

var fetchFollowers = (id , navigationInfo , chunk , end_cursor=null) => new Promise((resolve , reject) => {
    var {headers , url} = createHeaders(id , navigationInfo , chunk , config.ig , end_cursor)

    axios({ url : url , method : 'get', headers : headers})
    .then((results) => {
        var {followers , has_next_page , end_cursor , uid, total_followers} = processResult(results.data)
        resolve({followers , has_next_page , end_cursor , uid , total_followers})
    })
    .catch((e) => {
        reject(e)
    })
        
})
function createHeaders (id , navigationInfo , chunk , config , end_cursor=null) {
    var query_params = {
        query_hash : config.query_hash,
        variables : {"id": id,"include_reel":true,"fetch_mutual":true,"first": chunk},
    }
    if (end_cursor != null) {
        query_params.variables['after'] = end_cursor
        query_params.variables['fetch_mutual'] = false
    }
    query_params.variables = JSON.stringify(query_params.variables)
    query_params = querystring.stringify(query_params)
    const url = config.host + config.path + query_params
    
    const headers = {}
    for ( i in navigationInfo.headers) {
        headers[i] = navigationInfo.headers[i]
    }
    headers['Cookie'] = navigationInfo.cookies.join(';')
    headers['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"
    return {headers , url}

}
function processResult(data) {
    var accountFollowers = data.data.user.edge_followed_by.edges,
          end_cursor = data.data.user.edge_followed_by.page_info.end_cursor,
          has_next_page = data.data.user.edge_followed_by.page_info.has_next_page,
          total_followers = data.data.user.edge_followed_by.count
    var followers = []
    for ( i in accountFollowers) {
        followers.push({ 
            id : accountFollowers[i].node.id,
            username : accountFollowers[i].node.username,
            is_private : accountFollowers[i].node.is_private
        })
    }
    var uid = crypto.randomBytes(5).toString('hex')
    return{ followers , has_next_page , end_cursor , uid , total_followers}
}
post_chunk = (chunk , uid , options) => {
    var process = child_process.fork('./workers/post_chunk.js')
    process.send({data : chunk, uid : uid})
    if (options.v) {
        process.on('message' , message => {
            console.log(message)
        })
    }

}    
sleep = (ms) => new Promise((r) => {
    setTimeout(function(){
        r()
    } , ms)
})
convert2Dto1D = (arr) => new Promise((resolve,reject) => {
    var new_Arr= []
    for (chunks in arr) {
        var chunk = arr[chunks]
        for (items in chunk) {
            new_Arr.push(chunk[items])
        }
    }
    resolve(new_Arr.flat())
})