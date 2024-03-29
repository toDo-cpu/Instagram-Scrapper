const pup = require('puppeteer-core')
const temp = require('./saveLogin')
const log = require('../primary/logMessage')
module.exports = (options ,login_detail=null ) => new Promise(async(resolve , reject)=>{

    if (options.hasOwnProperty('login') && options.login == true) {
        var navigationInfo = await login(login_detail.username , login_detail.password , options)
        temp.save(navigationInfo)
        .then(() => { 
            if (options.v) { 
            log(`browsing information saved` , 'info' , 'log manager')
        }
        resolve(navigationInfo)
        }).catch((e) => {
            log(`Cannot save browsing informations` , 'error' , 'log manager', e)
            reject(e)
        })
    } else {
        try {
            var navigationInfo = await temp.get()
            resolve(navigationInfo)
        }catch(e) {
            log(`Cannot get browsing informations` , `error` , 'log manager', e)
            reject(e)
        }
    }


})

login = (name , password , options) => new Promise(async(resolve , reject ) => {
        
    const browser = await pup.launch({
            headless: options.headless,
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            args : ['--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0']
        })
        
        const page = await browser.newPage()
          page.setViewport({
                width: 1920,
                height: 1080,
        })
        
        data = {
            cookies : [],
            headers : {}
        }
        
        await page.goto('https://www.instagram.com/' , { waitUntil : 'networkidle2'})
        await page.setRequestInterception(true)

        page.on('request' , async (request) => {
            if ( request.url() == 'https://www.instagram.com/ajax/bz') {
                for (header in request['_headers']) {
                    if (header == 'x-ig-www-claim' || header == 'x-instagram-ajax' || header == 'x-csrftoken' || header == 'x-ig-app-id' ) {
                        data.headers[header] = request['_headers'][header]
                    }
                }
            }
            request.continue()
        })
        
        try {
            await page.click('button[class="aOOlW  bIiDR  "]')
        } catch(e) {}
        
        await page.type('input[name="username"]' , name ,{delay : 25})
        await page.type('input[name="password"]' , password ,{delay : 25})
        await page.click('button[class="sqdOP  L3NKy   y3zKF     "]')
        await page.waitForSelector(".q9xVd")
        
        if (options.v) {
            console.log(`\x1b[32m[LAZARE] Logged with ${name}\x1b[0m`)
        }
        
        var cookies = await page._client.send('Network.getAllCookies')
        
        cookies.cookies.forEach(item => {
            data.cookies.push(`${item.name}=${item.value}`)
        })
        await browser.close()
        resolve(data)
})