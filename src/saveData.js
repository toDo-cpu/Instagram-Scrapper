const fs = require('fs/promises')

module.exports = (options , data) => new Promise(async(resolve , reject) => {
    try {   
        if ( options.hasOwnProperty('name')) {
            await fs.writeFile(`./save/${options.name}.json`, JSON.stringify({ data : data , account : options.target}) , { flag : 'w+'})
        } else {
            await fs.writeFile(`./save/data.json`, JSON.stringify({ data : data , account : options.target}) , { flag : 'w+'})
        }
        resolve()
    }catch(e) {
        console.log(`\x1b[31m[LAZARE] Can't save data\x1b[0m`)
        console.log(e.message)
    }
})