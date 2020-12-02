const login = require('./src/login')
const api = require('./src/api/api')
const fetchUserId = require('./src/fetchUserId')
const fetchFollowers = require('./src/fetchFollowers')
const postToApi = require('./src/postToApi')
const saveData = require('./src/saveData')
const getArgs = require('./src/getArgs')
const config = require('./stuff/config')
const temp = require('./src/saveLogin');

(async () => {

        options = {}
        var args = await getArgs()
        //Parse args
        if (args.hasOwnProperty('post-api')) {
            options['post-api'] = args['post-api']
        }
        if (args.hasOwnProperty('name')) {
            options.name = args.name
        }
        if (args.hasOwnProperty('noheadless')) {
            options.headless = false
        } else {
            options.headless = true
        }
        if (args.hasOwnProperty('target') == false) {
            console.log('No target send, use --target= to define the target account')
            process.exit(0)
        } else {
            options.target = args.target
        }
        if (args.hasOwnProperty('v') || args.hasOwnProperty('verbose')) {
            options.v= true
        } else {
            options.v = false
        }
        if (args.hasOwnProperty('p')) {
            options.p = true
        } else{ 
            options.p = false
        }
        if (args.hasOwnProperty('name')) {
            options.name = args.name
        }
        if (args.hasOwnProperty('actions')) {
            options.actions = args.actions
        } 
        if (args.hasOwnProperty('wait')) {
            options.slowmode = args.wait
        }
        if (args.hasOwnProperty('break')) {
            options.break = {
                time : parseInt(args.break.split('/')[0]),
                eachXRequest : parseInt(args.break.split('/')[1]),
            }
        }
        /*
        
            Login to instagram and return the session cookies and specifics headers
                You can save the session cookie and navigation headers to don't login again 
                the next time
        
        */
        if (args.hasOwnProperty('login')) {
            var navigationInfo = await login(config.account.user , config.account.password , options)
            temp.save(navigationInfo)
            .then(() => { 
                if (options.v) { 
                console.log(`\x1b[32m[LAZARE] browsing information saved\x1b[0m`)
            }
            }).catch((e) => {
                console.log(`[LAZARE] Cannot save browsing information`)
                console.log(navigationInfo)
            })
        } else {
            try {
                var navigationInfo = await temp.get()
            }catch(e) {
                if (options.v) {
                    console.log(`[LAZARE] Cannot load browsing information , im going to login`)
                }
                navigationInfo = await login(config.account.user , config.account.password , options)
                temp.save(navigationInfo)
                .then(() => { 
                    if (options.v) { 
                    console.log(`\x1b[32m[LAZARE] browsing information saved\x1b[0m`)}
                }).catch((e) => {
                    console.log(`[LAZARE] Cannot save browsing information`)
                    console.log(navigationInfo)
                })
            }
        }
        /* 
            Get the instagram user id to query the private api 

        */
        var userId = await fetchUserId(options)
        /* 
            Here there is a lot of text but 2 functions
            
            getDataFromApi() : take 3 parameters :
                                                - a followers array or an account username
                                                - session cookies
                                                - options
            fetchFollowers() : take 4 parameters : 
                                                - the userId of target
                                                - sessions cookies
                                                - the size of chunk we received , instagram api don't send followers list in 1 request but in multiple request 
                                                   which you pass the end_cursos  
                                                - options

        */
        var data = {}
        switch(options.actions) {
            case 'scrappe' : 
                data = await api.single_query(options.target , navigationInfo , options)
                break
            case 'scrappe-getfollowers' : 
                data = {
                    account : await api.single_query(options.target , navigationInfo , options),
                    followers : await fetchFollowers(userId , navigationInfo , 10 , options)
                }
                break
            case 'scrappe-scrappefollowers' : 
                data['account'] = await api.single_query(options.target , navigationInfo , options)
                followersList = await fetchFollowers(userId , navigationInfo , 10 , options)
                followersUsername = await Promise.all(followersList.map((item) => new Promise((resolve , reject) => { resolve(item.username)})))
                data['followers'] = await api.multi_query(followersUsername , navigationInfo , options)
                break
            case 'getfollowers' :
                data['accounts'] = options.target
                data['followers'] = await fetchFollowers(userId , navigationInfo , 10 , options)
                break
            case 'getfollowers-scrappe' : 
                data['accounts'] = options.target
                FollowersList = await fetchFollowers(userId , navigationInfo , 10 , options)
                followersUsername = await Promise.all(FollowersList.map((item) => new Promise((resolve , reject) => { resolve(item.username)})))
                data['followers'] = await api.multi_query(followersUsername , navigationInfo , options)
                break
            }
        if (options['post-api'] == 'true') {
            try {
                await postToApi(config.api , options , {content : data , type : options.actions})
            }catch(e) {
                await saveData(options , {content : data , type : options.actions})
            }
        } else {
            await saveData(options , {content : data , type : options.actions})
        }
})()

