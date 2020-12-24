const sleep = require('../primary/sleep')
const axios = require('axios')

module.exports = query = {
    multi_query : (username_list , NavInfo , options , scrapping_opt) => new Promise(async(resolve , reject ) => {
        if (options.hasOwnProperty('break')) {
            var compteur = 1
            var results = []
            for (  i in username_list) {
                if (options.hasOwnProperty('slowmode')) {
                    await sleep(options.slowmode)
                }
                try {
                    data = await query.single_query(username_list[i], NavInfo , options , scrapping_opt)
                    results.push({ status : 'ok' , content : data})
                } catch(e) {
                    results.push({status : 'fail' , content : e})
                }
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
            resolve(results)
        } else {
            var results = []
            for ( i in username_list) {
                if (options.hasOwnProperty('slowmode')) {
                    await sleep(options.slowmode)
                }
                try {
                    data = await query.single_query(username_list[i], NavInfo , options)
                    results.push({ status : 'ok' , content : data})
                } catch(e) {
                    results.push({status : 'fail' , content : e})
                }
            }
            resolve(results)
        }
    }),
    single_query : (account , NavInfo , options ) => new Promise(async(resolve,reject) => {
        var { headers , url} = await createHeaders(account, NavInfo)
        try {
            data = await get(headers , url)
            data = data.graphql.user

            if (options.v) {
                console.log(`[${account}] profile scrapped`)
            }
            
            resolve(data)
        } catch(e) {
            if (options.v) {
                console.log(`[${account}] profile wasn't scrapped fully`)
            }
            reject(e)
        } 
    })
}

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
get = (headers , url) => new Promise((resolve , reject ) => {
    axios({url : url , headers : headers , methode : 'get'})
    .then((results) => {
        resolve(results.data)
    }).catch((e) => {
        reject(e)
    })
})