const AccountManager = require('./primary/login')
const parser = require('./primary/parser')
const fetch = {
    Linked : require('./whereUserIsTagged/whereUserIsTagged'),
    Followers : require('./fetchFollowers/fetchFollowers'),
    Post : require('./fetchAllPost/fetchAllPost'),
    Profile : require('./fetchProfile/query')
}
const checkValidity = (item) => {
    return (item.status == "ok")
}
class Collector {
    constructor(targets , options ) {
        if (Array.isArray(targets)) {
            this.targets = {}
            this.targets.type = "array" 
            this.targets.content = targets
        } else {
            this.targets = {}
            this.targets.type = "unique"
            this.targets.content = [targets]
        }
        this.options = options
        this.targets.results = {
            profile : null,
            posts : null ,
        }
        this.targets.id = null
        this.navInfo = null
        if (this.targets.type == "array" && options.v) {
            console.log(`Collector initialized with ${this.targets.content.length} targets`)
        } else {
            console.log(`Collector initialized with 1 target`)
        }
        this.parser = parser
    }
    Login = (login_detail = null) => new Promise(async(resolve, reject) => {
        this.navInfo = await AccountManager(this.options , login_detail)
        resolve()
    })
    Profile = (username=null) => new Promise(async(resolve , reject) => {
        if (username != null) {
                var raw_data = await fetch.Profile.single_query(username , this.navInfo , this.options)
        } else {
            if (this.targets.type == "array") {
                var raw_data = await fetch.Profile.multi_query(this.targets.content, this.navInfo , this.options)                
            } else {
                var raw_data = await fetch.Profile.single_query(this.targets.content[0] , this.navInfo , this.options)
            } 
            
        }
        this.targets.results.profile = raw_data
        resolve(raw_data)
    })
    Posts = (targets = null) => new Promise(async(resolve , reject) => {
        if (targets != null) {
         
        } else {
            if (this.targets.results.profile == null) {
                console.log(`Need to scrappre targets' profile before to scrappe their posts \n`)
                await collector.Profile()
            }
            var potential_targets = this.targets.results.profile
            var prs = Promise.all(potential_targets.filter(checkValidity))
            prs.then(async(results) => {
                var posts = []
                for ( i in results) {
                    var id = i
                    var post_object = { username : results[id].content.username , id : results[id].content.id }
                    try {
                        if (results[id].content.edge_owner_to_timeline_media.page_info.has_next_page) {
                            var medias = results[id].content.edge_owner_to_timeline_media
                            let info = { end_cursor : medias.page_info.end_cursor ,
                                     username : results[id].content.username , 
                                     total_count : medias.count,
                                     has_next_page : true,
                                     yet_collected_number : medias.edges.length
                            }
                            var new_medias = await fetch.Post(results[id].content.id , this.navInfo , this.options , info)
                            medias.edges = medias.edges.concat(new_medias)
                            post_object['medias'] = medias.edges
                        } else {
                            post_object['medias'] = results[id].content.edge_owner_to_timeline_media.edges
                        }
                        posts.push(post_object)
                    }
                    catch(e) {
                        post_object['error'] = e
                        posts.push(post_object)
                        console.log(`[${results[id].content.username}]${e.message}`)
                    }
                }
                resolve(posts)
            })
        }
    })
    Linked = () => new Promise(async(resolve) => {
        if (this.targets.results.profile == null) {
            console.log(`Need to scrappre targets' profile before to find where they are identified \n`)
            await collector.Profile()
        }
        var potential_targets = this.targets.results.profile
        var valid_targets = await Promise.all(potential_targets.filter(checkValidity))
        var results = []
        for ( i in valid_targets) {
            var index = i
            var links = await fetch.Linked(valid_targets[index].content.id,this.navInfo,this.options,valid_targets[index].content.username)
            results.push(links)
        }
        resolve(results)
    })
}

const targets = ['hugo.lharidon','nel0064','grimkujow']

var collector = new Collector(targets, { v : true , login : false , slowmode : 500 , break : { time : 1500 , eachXRequest : 4}})

collector.Login().then(async() => {
    collector.Linked().then(async (results)=> {
        console.log(results)

    })
    //posts = await collector.Posts()
})
