const parser = require('./parse')

module.exports = (data) => new Promise(async(resolve , reject) => { 
    new_data = await parser[data.data.type](data.data.content)
    resolve(new_data)
})

