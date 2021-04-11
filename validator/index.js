exports.createPostValidator = (req,res,next)=>{
   //title err
 req.check("title", "write a title").notEmpty();
 req.check("title", "Title must be between 4 to 150 characters").isLength({
    min:4,max:150
 })

 // body err
 req.check("body", "write a title").notEmpty();
 req.check("body", "Body must be between 4 to 150 characters").isLength({
    min:4,max:200
 })

  // check for errs
 const errors =req.validationErrors();

 if(errors){
     const firstError = errors.map(err=>err.msg)[0]; // to give first err
     return res.status(400).json({"error": firstError})


 }
 next();
}

exports.signUpValidator = (req,res,next)=>{

   //name
   req.check("name","Name is required").notEmpty();
   //email
   req.check("email","Email must be between 3 to 32 charracters")
   .matches(/.+\@.+\..+/)
   .withMessage("Email must contain @")
   .isLength({
      min:3,
      max:32
   })
   //password
   req.check("password","Password is required").notEmpty();
   req.check("password")
   .isLength({
      min:6
   })
   .withMessage("Password must contain at least 6 charcters")
   .matches(/\d/)
   .withMessage("Password must contain a number");

   //check for errs

   const errors =req.validationErrors();

   if(errors){
       const firstError = errors.map(err=>err.msg)[0]; // to give first err
       return res.status(400).json({"error": firstError})


   }
   next();



}


exports.signInValidator = (req,res,next)=>{

   //name

   //email
   req.check("email","Email must be between 3 to 32 charracters")
   .matches(/.+\@.+\..+/)
   .withMessage("Email must contain @")
   .isLength({
      min:3,
      max:32
   })
   //password
   req.check("password","Password is required").notEmpty();
   req.check("password")
   .isLength({
      min:6
   })
   .withMessage("Password must contain at least 6 charcters")
   .matches(/\d/)
   .withMessage("Password must contain a number");

   //check for errs

   const errors =req.validationErrors();

   if(errors){
       const firstError = errors.map(err=>err.msg)[0]; // to give first err
       return res.status(400).json({"error": firstError})


   }
   next();



}

exports.passwordResetValidator = (req, res, next) => {
   // check for password
   req.check("newPassword", "Password is required").notEmpty();
   req.check("newPassword")
       .isLength({ min: 6 })
       .withMessage("Password must be at least 6 chars long")
       .matches(/\d/)
       .withMessage("must contain a number")
       .withMessage("Password must contain a number");

   // check for errors
   const errors = req.validationErrors();
   // if error show the first one as they happen
   if (errors) {
       const firstError = errors.map(error => error.msg)[0];
       return res.status(400).json({ error: firstError });
   }
   // proceed to next middleware or ...
   next();
};
