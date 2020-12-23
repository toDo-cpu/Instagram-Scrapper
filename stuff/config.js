var config = {
    ig : {},
    api : {},
    account : {},
}

config.ig.host = "https://www.instagram.com"
config.ig.path = "/graphql/query/?"
config.ig.query_hash = "c76146de99bb02f6415203be841dd25a"
config.ig.graphql_query_hash = "003056d32c2554def87228bc3fd9668a"
config.ig.graphql_hash_where_tagged = "31fe64d9463cbbe58319dced405c6206"
config.ig.graphql_hash_stories = "d4d88dc1500312af6f937f7b804c68c3"
config.ig.graphql_follow = "d04b0a864b4b54837c0d870b0e77e076"


config.api.PROTOCOL = 'http'
config.api.HOST = '127.0.0.1'
config.api.PORT = 8002
config.api.PATH = '/new_followers/'

config.account.user = "youwillnotgetmyemail@motherfucker.com"
config.account.password = ":)"

module.exports = config