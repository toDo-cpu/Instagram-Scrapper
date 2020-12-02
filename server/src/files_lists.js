const fs = require('fs')
module.exports = () => {
    return fs.readdirSync('../save')
}