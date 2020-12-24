const config = require('../stuff/parser')
const checkValidity = (item) => {
    return (item.status == "ok")
}
module.exports = {
    profile : (data) => new Promise((resolve) => {
       if (Array.isArray(data)) {
            valid_items = data.filter(checkValidity)
            new_data = []
            valid_items.forEach(item => {
                new_content = {}
                 config.profile.forEach(attr => {
                    new_content[attr] = item.content[attr]
                })
                item.content = new_content
                new_data.push(item)
            })
            resolve(new_data)
        } else {
            new_data = {}
            data = data.content
            config.profile.forEach(attr => {
                new_data[attr] = data[attr]
            })
            resolve(new_data)
        }
    })
}