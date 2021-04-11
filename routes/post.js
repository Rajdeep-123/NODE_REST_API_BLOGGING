// Working as a middleware

const express = require("express");
const router = express.Router();
const {postById,updatePost,isPoster,deletePost,getPosts,makePost,postsByUser,postPhoto, singlePost,setLike, setDislike, postComment, removeComment} = require("../controllers/post");
//const {createPostValidator} = require("../validator/index");
const {requireSignIn} = require("../controllers/auth");
const {userById} = require("../controllers/user");


router.get("/posts",getPosts);

router.put("/post/like",requireSignIn,setLike);
router.put("/post/unlike",requireSignIn,setDislike);

router.put("/post/comment",requireSignIn,postComment);
router.put("/post/uncomment",requireSignIn,removeComment);



router.post("/post/new/:userId",requireSignIn,makePost);
router.get("/post/:postId", singlePost);
router.get("/post/by/:userId",requireSignIn,postsByUser);
router.put("/post/:postId",requireSignIn,isPoster,updatePost);
router.delete("/post/:postId",requireSignIn,isPoster,deletePost);

router.get("/post/photo/:postId",postPhoto)



// Any route containing :userId:, will first execute here, in params;
router.param("userId", userById)
// Any route containing :postId:, will first execute here, in params;
router.param("postId",postById)
module.exports = router;