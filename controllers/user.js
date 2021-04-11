const User = require("../models/user");
const Post = require("../models/post");
const _ = require("lodash");
const formidable = require('formidable'); // to handle photos or files
const fs = require("fs");
const { profile } = require("console");
const { result } = require("lodash");

exports.userById = (req,res,next,id) =>{
    User.findById(id)
    .populate("following","_id name")
    .populate("followers","_id name")
    .exec((err,user)=>{
        if(err || !user){
            res.status(401).json({error:"User not found"})
        }else{
            req.profile = user;// Adds profile object in req with user info
            next();
        }

    })

}

exports.hasAuthorization = (req,res,next)=>{
    let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
    let adminUser = req.profile && req.auth && req.auth.role === "admin";
    let authorised = sameUser || adminUser
    if(!authorised){
        return res.status(403).json({Error:"User is not authorized to perform this action"});
    }
    next();
}

exports.allUsers=(req,res)=>{
    User.find((err,users)=>{
        if(err){
            res.status(401).json({err});

        }
        else{
            res.json(users)
        }
    }).select("name email created updated _id role")
}

exports.getUser = (req,res)=>{
    req.profile.hashed_password= undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

exports.updateUser = (req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save user
        let user = req.profile;

        user = _.extend(user, fields);

        user.updated = Date.now();
        // console.log("USER FORM DATA UPDATE: ", user);

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;

            res.json(user);
        });
    });

}

exports.deleteUser = (req,res,next)=>{
    let user = req.profile;
    user.remove((err,removedUser)=>{
        if(!err){
            next();
            console.log("user removed");
        }

    })
}

exports.deletePosts = (req,res,next) =>{
    const userId = req.profile._id;
    Post.deleteMany({postedBy:userId},(err,deleted)=>{
        if(!err){
            next();
            console.log("post removed");

        }else{
            console.log(err);
        }
    })

}

exports.deleteComments = (req,res,next) =>{
    const userId = req.profile._id;
    Post.updateMany({"comments.postedBy":userId},{
        $pull:{comments:{postedBy:userId}}
    },{new:true})
    .exec((err,result)=>{
        if(!err){
            next();
            console.log("commnets removed");
        }else{
          console.log(err);

        }
    })
}

exports.deleteFollowings = (req,res,next)=>{
    const userId = req.profile._id;

    User.updateMany({following:userId},{
        $pull:{following:userId}
    },(err,result)=>{
        if(!err){
            next();
            console.log("following removed");
        }else{
            console.log(err);
        }
    })
}

exports.deleteLikes =(req,res) =>{
    const userId = req.profile._id;
    Post.updateMany({likes:userId},{
        $pull:{likes:userId}
    },{new:true},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            console.log("likes removed");
            res.json(result);
        }
    })
}



exports.userPhoto =(req,res,next)=>{
    if(req.profile.photo.data){
        res.set(("Content-Type", req.profile.photo.contentType));
        return res.send(req.profile.photo.data)
    }
    next();
}

// follow

exports.addFollowing = (req,res,next)=>{

    User.findByIdAndUpdate(req.body.userId,{
        $push:{following:req.body.followId}
    },(err,users)=>{
        if(err){
            return res.status(401).json({error:err})
        }
        next();
    })
}

exports.addFollower = (req,res)=>{

    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.body.userId},
    },{new:true})
    .populate("following","_id name")
    .populate("followers","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(401).json({error:err})
        }else{
            result.hashed_password=undefined;
            result.salt = undefined;
             res.json(result)
        }
    })
}

// unfollow

exports.removeFollowing = (req,res,next)=>{
    User.findByIdAndUpdate(req.body.userId,{
        $pull:{following:req.body.unfollowId}
    },(err,users)=>{
        if(err){
            return res.status(401).json({error:err})
        }
        next();
    })
}

exports.removeFollower = (req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.body.userId},
    },{new:true})
    .populate("following","_id name")
    .populate("followers","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(401).json({error:err})
        }else{
            result.hashed_password=undefined;
            result.salt = undefined;
             res.json(result)
        }
    })
}

//who to follow
exports.findPeople = (req,res) =>{
let following = req.profile.following; //check the following array
following.push(req.profile._id);// push the current user to the array
User.find({_id:{$nin:following}},(err,foundUsers)=>{ // check for other users, apart from following ary
    if(err){
        return res.status(400).json({error:err})
    }else{
        res.json(foundUsers)
    }
}).select("name")
}