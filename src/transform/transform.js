const parse = require('./parse')

module.exports = (data) => new Promise(async(resolve , reject) => {
    new_data = await parse[data.data.type](data.data.content)
    resolve(new_data)
})

