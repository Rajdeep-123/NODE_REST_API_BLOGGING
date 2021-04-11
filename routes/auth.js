const express = require("express");
const router = express.Router();
//const validator = require("../validator/index");
const {signUp,signIn,signOut,forgotPassword,resetPassword} = require("../controllers/auth");
const {userById} = require("../controllers/user");
const {signUpValidator,passwordResetValidator} = require("../validator/index")


// password forgot and reset routes
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

router.post("/signup",signUpValidator,signUp);
router.post("/signin",signIn);
router.get("/signout",signOut);

// search by id
router.param("userId", userById);
module.exports = router;