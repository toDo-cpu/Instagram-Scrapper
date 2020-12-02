module.exports = sleep = (ms) => new Promise((resolve , reject) => {
    setTimeout(function(){ resolve() } , ms)
})