const mongoose = require("mongoose");
const uuidv1 = require("uuidv1");
const crypto = require("crypto");
const {ObjectId} = mongoose.Schema

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    hashed_password:{
        type:String,
        required:true
    },
    salt:String,
    created:{
        type:Date,
        default:Date.now
    },
    updated:Date,
    photo:{
        data:Buffer,
        contentType:String
    },
    about:{
        type:String,
        trim:true
    },
    following:[{type:ObjectId,ref:"User"}],
    followers:[{type:ObjectId,ref:"User"}],
    resetPasswordLink: {
        data: String,
        default: ""
    },
    role:{
        type:String,
        default:"subscriber"
    }
});

// virtual schema field
userSchema.virtual("password")
.set(function(password){
 // create temp variable _password
 this._password = password;
 //generate timestamp
 this.salt = uuidv1();
 //encryptPassword
    this.hashed_password =this.encryptPassword(password);

}).get(function(){
    return this._password;
})

//methods
userSchema.methods ={
    authanticate: function(plainPassword){
        return this.encryptPassword(plainPassword)===this.hashed_password
    },
    encryptPassword: function(password){
        if(!password) return "";
        try{
           return crypto.createHmac('sha1', this.salt)
                    .update(password)
                     .digest('hex');
        }catch(err){
            return ""
        }

    }
}

module.exports = mongoose.model("User", userSchema);