module.exports = parser = {
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
            is_joinded_recently : data.is_joined_recently,
            catergory_enum : data.catergory_enum,
            has_clips : data.has_clips,
            has_guides : data.has_guides,
            has_channel : data.has_channel
        }
        results['post'] = data.edge_owner_to_timeline_media.edges.map((item) => {
            if (item !=null ) {
                if (item.node.is_video) {
                    return processVideo(item)
                } else {
                    return processImage(item)
                }
            }
        })
        resolve(results)
    }),
    "scrappe-getfollowers" : (data) => new Promise((resolve , reject) =>{
        parser.scrappe(data.account).then(first_account => {
            resolve({ account: first_account , followers : data.followers})
        })
    }),
    "scrappe-scrappefollowers" : (data) => new Promise((resolve , reject) => {
        parser.scrappe(data.account).then(async(first_account) => {
            var accounts = [first_account]
        
            followers = await filter_errors(data.followers)
    
            for ( i in followers) {
                accounts.push(await parser.scrappe(followers[i].content))
            }
            resolve(accounts)
        })
    }),
    "getfollowers" : (data) => new Promise((resolve , reject) => {
        resolve(data)
    }),
    "getfollowers-scrappe" : (data) => new Promise((resolve , reject) => {
        
    })
}
filter_errors = (lists) => new Promise((resolve, reject) => {
    new_arr = lists.filter(item => item.status == 'ok')
    resolve(new_arr)
})
processImage = (item) => {
    item = item.node
    post_info = {
            type : 'image',
            id : item.id,
            like : item.edge_media_preview_like.count,
            comments : item.edge_media_to_comment.count ,
            taken_at : item.taken_at_timestamp,
        }
        try { post_info.body = item.edge_media_to_caption.edges[0].node.text } 
        catch(e) { post_info.body = null}
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
        likes_count : item.edge_media_preview_like.count,
        comments_counts : item.edge_media_to_comment.count ,
        taken_at : item.taken_at_timestamp,
    }

    try { post_info.body = item.edge_media_to_caption.edges[0].node.text } 
    catch(e) { post_info.body = null}


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