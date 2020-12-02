module.exports = get = (headers , url) => new Promise((resolve , reject ) => {
    axios({url : url , headers : headers , methode : 'get'})
    .then((results) => {
        resolve(results.data.graphql.user)
    }).catch((e) => {
        reject(e)
    })
})