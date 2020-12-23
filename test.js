const fetchStories = require('./src/api/fetchTimeline/fetchTimeline')
const NavInfo = require('./stuff/NavigationSave.json')

fetchStories(25025320).then((d) => {
console.log(d) 
}).catch(e => console.log(e))

