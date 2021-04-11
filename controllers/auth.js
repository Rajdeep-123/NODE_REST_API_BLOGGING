const jwt = require("jsonwebtoken");
const { sendEmail } = require("../helpers/index");
const _ = require("lodash");
require("dotenv").config();
const User = require("../models/user");
const expressJwt = require("express-jwt");

exports.signUp = async (req, res) => {
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) return res.status(403).json({ error: "User already exist!" });

  const user = await new User(req.body);
  await user.save();
  res.json({ message: "User has been succesfully registerd! Please login" });
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;
  // finding user based on email
  User.findOne({ email }, (err, foundUser) => {
    //cheking for password
    if (err || !foundUser) {
      res.status(401).json({ error: "user does not exist" });
    }
    else if(!foundUser.authanticate(password)){
      res.status(401).json({ error: "Invalid credentials!" });
    }
    else {
      // generating jwt toket
      const token = jwt.sign({ _id: foundUser._id, role:foundUser.role}, process.env.JWT_SECRET);
      //sending cookie to browser
      res.cookie("t", token, { expire: new Date() + 9000 });
      //return response with user details and token
      const { _id, name, email, role } = foundUser;
      return res.json({ token, user: { _id, name, email, role } });
    }
  });
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Sign Out Successful!" });
};

exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth", //if the token is valid, jwt will appends the veryfied user id in an auth key to the request object
});

exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ message: "No request body" });
  if (!req.body.email)
      return res.status(400).json({ message: "No Email in request body" });

  console.log("forgot password finding user with that email");
  const { email } = req.body;
  console.log("signin req.body", email);
  // find the user based on email
  User.findOne({ email }, (err, user) => {
      // if err or no user
      if (err || !user)
          return res.status("401").json({
              error: "User with that email does not exist!"
          });

      // generate a token with user id and secret
      const token = jwt.sign(
          { _id: user._id, iss: "NODEAPI" },
          process.env.JWT_SECRET
      );

      // email data
      const emailData = {
          from: "no.reply19965@gmail.com",
          to: email,
          subject: "Password Reset Instructions",
          text: `Please use the following link to reset your password: ${
              process.env.CLIENT_URL
          }/reset-password/${token}`,
          html: `<p>Please use the following link to reset your password:</p> <p>${
              process.env.CLIENT_URL
          }/reset-password/${token}</p>`
      };

      return user.updateOne({ resetPasswordLink: token }, (err, success) => {
          if (err) {
              return res.json({ message: err });
          } else {
              sendEmail(emailData);
              return res.status(200).json({
                  message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
              });
          }
      });
  });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
      // if err or no user
      if (err || !user)
          return res.status("401").json({
              error: "Invalid Link!"
          });

      const updatedFields = {
          password: newPassword,
          resetPasswordLink: ""
      };

      user = _.extend(user, updatedFields);
      user.updated = Date.now();

      user.save((err, result) => {
          if (err) {
              return res.status(400).json({
                  error: err
              });
          }
          res.json({
              message: `Great! Now you can login with your new password.`
          });
      });
  });
};