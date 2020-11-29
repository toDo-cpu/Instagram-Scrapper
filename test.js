const data = require('./save/evaaa.json')
const transform = require('./src/transform/transform')
const fs =require('fs')
const NavInfo = require('./stuff/NavigationSave.json')
const axios = require('axios')
const config = require('./stuff/config')
const querystring = require('querystring')

transform(data).then((d) => {
    console.log(d)
    fs.writeFileSync('./dev.json' , JSON.stringify(d) , { flag : 'w+'})
})

