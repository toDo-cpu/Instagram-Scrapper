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
        results['post'] = data.edge_owner_to_timeline_media.edges.map((item) => {
            if (item.node.is_video) {
                console.log('video')
                return processVideo(item)
            } else {
                console.log('image')
                return processImage(item)
            }
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

processImage = (item) => {
    item = item.node
    post_info = {
            type : 'image',
            id : item.id,
            like : item.edge_liked_by.count,
            messsage : item.edge_media_to_caption.edges[0].node.text,
            comments : item.edge_media_to_comment.count ,
            taken_at : item.taken_at_timestamp,
        }
        if (item.location != null) {
            post_info.location = `${item.location.name}&&${item.location.slug}`
        }
        if (item.hasOwnProperty('edge_sidecar_to_children')) {
            post_info['media'] = item.edge_sidecar_to_children.edges.map((children) => {
                children= children.node
                info = {
                    id : children.id,
                    image_url : children.display_url,
                    tagged_user : children.edge_media_to_tagged_user.edges.map((user) => {
                        user = user.node.user
                        return { username : user.username , id : user.id , profil_pic_url : user.profile_pic_url}
                    })
                }
                return info
            })
        } else {
            post_info['media'] = [{
                id : item.id,
                image_url : item.display_url,
                tagged_user : item.edge_media_to_tagged_user.edges.map((user) => {
                    user = user.node.user
                    return { username : user.username , id : user.id , profil_pic_url : user.profile_pic_url}
                })
            }]
        }
        return post_info
}
processVideo = (item) => {
    item = item.node
    post_info = {
        type : 'video',
        id : item.id,
        likes_count : item.edge_liked_by.count,
        messsage : item.edge_media_to_caption.edges[0].node.text,
        comments_counts : item.edge_media_to_comment.count ,
        taken_at : item.taken_at_timestamp,
    }
    if (item.location != null) {
        post_info.location = `${item.location.name}&&${item.location.slug}`
    }
    post_info['media'] = [{
        product_type : item.product_type,
        video_url : item.video_url,
        tagged_user : item.edge_media_to_tagged_user.edges.map((user) => {
            user = user.node.user
            return { username : user.username , id : user.id , profil_pic_url : user.profile_pic_url}
        })
    }]
    return post_info
}