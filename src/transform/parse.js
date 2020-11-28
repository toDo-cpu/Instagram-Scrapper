module.exports = {
    "scrappe" : (data) => new Promise((resolve , reject) => {
        results = {
            id : data.id,
            username : data.username,
            full_name : data.full_name,
            biography : data.biography,
            profil_pic_url : data.profile_pic_url_hd,
            connected_fb : data.connected_fb_page,
            is_bussiness_account : data.is_business_account,
            business_category : data.business_category_name,
            is_verified : data.is_verified,
            is_joinded_recently : data.is_joined_recently
        }
        results['posts'] = data.edge_owner_to_timeline_media.edges.map((item) => {
            item = item.node
            post_info = {
                id : item.id,
                like : item.edge_liked_by.count,
                location : `${item.location.name}&&${item.location.slug}`,
                messsage : item.edge_media_to_caption.edges[0].node.text,
                comments : item.edge_media_to_comment.count ,
                take_at_timestap : item.taken_at_timestamp
            }
            
            return post_info
        })
        resolve(results)
    }),
    "scrappe-fetchfollowers" : (data) => new Promise((resolve , reject) =>{

    }),
    "scrappe-fetchfollowers" : (data) => new Promise((resolve , reject) => {

    }),
    "getfollowers" : (data) => new Promise((resolve , reject) => {

    }),
    "getFollowers-scrappe" : (data) => new Promise((resolve , reject) => {

    })
}