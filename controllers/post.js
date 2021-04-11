const Post = require("../models/post");
const formidable = require('formidable'); // to handle photos or files
const fs = require("fs");
const _ = require("lodash");


exports.postById = (req,res,next,id) =>{
    Post.findById(id)
    .populate("postedBy", "_id name")
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id name role")
    .exec((err,post)=>{
        if(err){
            console.log(err);
            res.status(400).json({error:err})
        }
        req.post = post;
        next();
    })
}

exports.isPoster= (req,res,next)=>{
    let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
    let adminUser = req.post && req.auth && req.auth.role === "admin";
    let isPoster = sameUser || adminUser;
    if(!isPoster){
        console.log("not authuriesd!");
        return res.status(403).json({error:"User is not authorized to perform this action"});

    }
    next();
}

// exports.updatePost = (req,res)=>{
//     let post = req.post;
//     post = _.extend(post,req.body); // to change the user profile with new data
//     post.save(err=>{
//         if(err){
//             res.status(403).json({error:"You are not the authorized person to perform this action"})
//         }else{
//             post.hashed_password= undefined;
//             post.salt = undefined;
//             res.json(post);
//         }
//     })

// }

exports.updatePost = (req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save user
        let post = req.post;

        post = _.extend(post, fields);

        post.updated = Date.now();
        // console.log("USER FORM DATA UPDATE: ", user);

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        post.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            res.json(post);
        });
    });

}


exports.deletePost = (req,res)=>{
    let post = req.post;
    post.remove((err, removedPost)=>{
        if(err){
            res.status(400).json({error:err})
            console.log(err);
        }
        res.json({message:"The post has been deleted successfully"})
    })
}

exports.postPhoto =(req,res,next)=>{
    if(req.post.photo.data){
        res.set(("Content-Type", req.post.photo.contentType));
        return res.send(req.post.photo.data)
    }
    next();
}


// to get all posts
exports.getPosts = (req,res)=>{
    const currentPage = req.query.page || 1;
    const perPage = 9;
    let totalItems;

  const posts =  Post.find()
    .countDocuments()
        .then(count => {
            totalItems = count;

    return Post.find()
    .skip((currentPage - 1) * perPage)
    .populate("postedBy","_id name") // to get the selected data from the relational collection - here User collection
    //.populate("comments", "text created")
    .populate("comments.postedBy", "_id name")
    .select("_id title body created likes")
    .sort({created:-1})
    .limit(perPage)
        })
    .then((posts)=> {
        res.json(posts)}
        )
    .catch(err=>res.json({err}));

};

// to make a new post
exports.makePost = (req,res)=>{

    let form = new formidable.IncomingForm();
    form.keepExtension = true;
    form.parse(req, (err,fields,files)=>{
        if(err){
            console.log(err);
            return res.status(400).json({
                Error:"Image could not be uploaded"
            });

        }
        let post = new Post(fields);
        req.profile.hashed_password= undefined;
        req.profile.salt = undefined;
        post.postedBy = req.profile;

        if(files.photo){
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }
        post.save((err,result)=>{
            if(err){
                return res.ststus(400).json({Error:err});
            }
            res.json(result);

        })
    })


};

exports.postsByUser=(req,res)=>{
    Post.find({postedBy:req.profile._id})
    .populate("postedBy","_id name")
    .select("_id title body created likes")
    .sort("created")
    .exec((err,posts)=>{
        if(err){
            res.status(400).json({error:err})
        }
        res.json(posts);
    })
}

exports.singlePost=(req,res)=>{
    return res.json(req.post);
}

//Like

exports.setLike=(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.body.userId}
    },{new:true},(err,result)=>{
        if(err){
            res.status(400).json({error:err})
        }else{
            res.json(result);
        }
    })
}

//Dislike
exports.setDislike=(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.body.userId}
    },{new:true},(err,result)=>{
        if(err){
            res.status(400).json({error:err})
        }else{
            res.json(result);
        }
    })
}

//post comment
exports.postComment=(req,res)=>{
    let comment = req.body.comment;
    comment.postedBy = req.body.userId
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{new:true})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            res.status(400).json({error:err})
        }else{
            res.json(result);
        }
    })
}

//remove comment
exports.removeComment=(req,res)=>{
    let comment = req.body.comment;
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{comments:{_id:comment._id}}
    },{new:true})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            res.status(400).json({error:err})
        }else{
            res.json(result);
        }
    })
}
