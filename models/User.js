const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const UserSchema1 = new Schema({
    username: {type:String, required:true, min:4, unique:true},
    password:{type:String, required:true},
});


const UserModel = model("User1", UserSchema1);

module.exports = UserModel;