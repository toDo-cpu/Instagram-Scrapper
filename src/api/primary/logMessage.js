const fs = require('fs')
module.exports = (msg , type , call , error=null) => {
    message = {}
    const date = new Date()
    var day = date.getDate(),
        month = date.getMonth()+1,
        year = date.getFullYear(),
        minutes = date.getMinutes(),
        hours = date.getHours(),
        seconds = date.getSeconds()
    if (seconds <= 9) {
        seconds = `0${seconds}`
    }
    message['date'] = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    message['type'] = type
    message['msg'] = msg
    message['call'] = call
    if (error != null) {
        message['error'] = ' - ' +error
    } else {
        message['error'] = ''
    }
    var log = `${message.date} - ${message.call} - ${type.toUpperCase()} - ${msg}${message.error}`
    console.log(log)
    fs.writeFileSync('./log',log + `\n`,{ flag : 'a+' ,encoding : 'utf-8'})
}