const fetchWhereUserIsTagged = require('./src/api/fetchAllPostWhereUserIsTagged/fetchWhereUserIsTagged')
const NavInfo = require('./stuff/NavigationSave.json')

fetchWhereUserIsTagged(8252049468 , NavInfo).then(() => {}).catch(e => {console.log(e)})