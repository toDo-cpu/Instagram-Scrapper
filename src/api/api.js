const AccountManager = require('./primary/login')
const fetch = {
    Followers : require('./fetchFollowers/fetchFollowers'),
    Post : require('./fetchAllPost/fetchAllPost'),
    Profile : require('./fetchProfile/query')
}
class Collector {
    constructor(targets , options ) {
        if (Array.isArray(targets)) {
            this.targets = {}
            this.targets.type = "array" 
        } else {
            this.targets = {}
            this.targets.type = "unique"
        }
        this.targets.content = targets
        this.options = options
        this.targets.results = {
            profile : null,
            posts : null ,
        }
        this.targets.id = null
        this.navInfo = null
        if (this.targets.type == "array" && options.v) {
            console.log(`Collector initialized with 3 targets`)
        } else {
            console.log(`Collector initialized with 1 target`)
        }
    }
    Login = (login_detail = null) => new Promise(async(resolve, reject) => {
        this.navInfo = await AccountManager(this.options , login_detail)
        resolve()
    })
    Profile = (username=null) => new Promise(async(resolve , reject) => {
        if (username != null) {
                var data = await fetch.Profile.single_query(username , this.navInfo , this.options)
        } else {
            if (this.targets.type == "array") {
                var data = await fetch.Profile.multi_query(this.targets.content, this.navInfo , this.options)
            } else {
                var data = await fetch.Profile.single_query(this.targets.content , this.navInfo , this.options)
            }  
        }
        this.targets.results.profile = data
        resolve(data)
    })
    Posts = (targets = null) => new Promise(async(resolve , reject) => {
        const checkValidity = (item) => {
            return (item.status == "ok" && item.content.edge_owner_to_timeline_media.page_info.has_next_page == true)
        }
        if (targets != null) {
            collector.Profile(targets).then(async(profile) => {
                var media = profile.edge_owner_to_timeline_media
                var new_medias = await fetch.Post(profile.id , media.page_info.end_cursor , true , this.options , profile.username , this.navInfo , media.count)
                profile.edge_owner_to_timeline_media.edges.concat(new_medias.posts)
                
                resolve(profile)
            })

        } else {
            var potential_targets = this.targets.results.profile
            var prs = Promise.all(potential_targets.filter(checkValidity))
            prs.then(async(results) =>{
    
                for ( i in results) {
                    var id = i
                    var media = results[i].content.edge_owner_to_timeline_media
                    var new_medias = await fetch.Post(results[id].content.id , media.page_info.end_cursor , true , this.options , results[i].content.username , this.navInfo , media.count)
                    results[id].content.edge_owner_to_timeline_media.edges.concat(new_medias.posts)
                }
                resolve(results)
            })
        }
    })
}

const targets = ['hugo.lharidon' ,'evaaaa014','nel0064','8978411aasff']

var collector = new Collector(targets, { v : true , login : false , slowmode : 1000 , break : { time : 2000 , eachXRequest : 5}})

collector.Login().then(() => {
    collector.Posts('nel0064').then(profile => {
        console.log(profile)
    })
})
