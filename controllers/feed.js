exports.getPosts = (req, res, next)=>{
    res.status(200).json({
        posts: [
            {
                id:1,
                title: 'My new assigment',
                message: 'Story about my new assigment'
            }
        ]
    });
}