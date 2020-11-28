const fs = require('fs')


module.exports = {
    get : () => new Promise((resolve , reject) => {
        info = fs.readFileSync('./stuff/NavigationSave.json')
        if (info == undefined || info == '') {
            reject()
        }
        resolve(JSON.parse(info))
    }),
    save : (info) => new Promise((resolve , reject) => {
        try {
            fs.writeFileSync('./stuff/NavigationSave.json' , JSON.stringify(info) , { flag : 'w+'})
            resolve()
        } catch(e) {
            reject(e)
        }
    })
}