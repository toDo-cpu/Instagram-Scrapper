var config = {
    ig : {},
    api : {},
    account : {},
}

config.ig.host = "https://www.instagram.com"
config.ig.path = "/graphql/query/?"
config.ig.query_hash = "c76146de99bb02f6415203be841dd25a"
config.ig.graphql_query_hash = "003056d32c2554def87228bc3fd9668a"

config.api.PROTOCOL = 'http'
config.api.HOST = '127.0.0.1'
config.api.PORT = 8002
config.api.PATH = '/save_chunk/'

config.account.user = "youwillnotgetmyemail@motherfucker.com"
config.account.password = ":)"

module.exports = config