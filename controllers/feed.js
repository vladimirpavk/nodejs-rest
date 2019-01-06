exports.getPosts = (req, res, next)=>{
    res.status(200).json({
        posts: [
            {
                _id:1,
                title: 'My new assigment',
                content: 'Story about my new assigment',
                imageUrl: 'images/pavle.jpg',
                creator:{
                    name: 'Pavle'
                },
                date:new Date().now
            }
        ]
    });
}

exports.createPost = (req, res, next) =>{
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        'message': 'Post created successfully!',
        post: {
            id: new Date().now,
            title: title,
            content: content
        }
    });
}