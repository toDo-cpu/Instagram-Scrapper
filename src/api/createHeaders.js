module.exports = createHeaders = (username , navigationInfo ) =>  new Promise((resolve ,reject) => {
    const url = `https://www.instagram.com/${username}/?__a=1`
    const headers = {}
    for ( i in navigationInfo.headers) {
        headers[i] = navigationInfo.headers[i]
    }
    headers['Cookie'] = navigationInfo.cookies.join(';')
    headers['User-Agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0"
    resolve({headers , url})
})