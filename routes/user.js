const express = require("express");
const router = express.Router();
const {allUsers,userById,getUser,updateUser,deleteUser,hasAuthorization, userPhoto, addFollowing, addFollower, removeFollowing, removeFollower,findPeople,deletePosts, deleteComments, deleteFollowings, deleteLikes, handleClients, allowUser, informClient ,removeFromAdminList,removeClient, postsForTimeline} =require("../controllers/user");
const {requireSignIn} = require("../controllers/auth");


router.put("/user/follow", requireSignIn ,addFollowing,addFollower);
router.put("/user/unfollow", requireSignIn, removeFollowing, removeFollower);

router.get("/users",allUsers);
router.get("/users/:userId",requireSignIn,getUser);
router.put("/users/:userId",requireSignIn,hasAuthorization,updateUser);
router.delete("/users/:userId",requireSignIn,hasAuthorization,deleteUser,deletePosts,deleteComments,deleteFollowings,deleteLikes);
// Dedicated route for handeling user's profile photo
router.get("/user/photo/:userId",userPhoto)
// user follow suggestion
router.get("/user/findpeople/:userId",requireSignIn,findPeople)

//admin
router.get("/admin",requireSignIn,handleClients)
router.post("/admin/allowuser", requireSignIn, allowUser,informClient, removeFromAdminList);
router.post("/admin/declineuser",requireSignIn,removeClient)

// Any route containing :userId:, will first execute here, in params;
router.param("userId", userById);
module.exports = router;
