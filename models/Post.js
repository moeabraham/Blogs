const mongoose = require("mongoose");
const {Schema, model} = mongoose;


const PostSchema = new Schema({
    title: String,
    summary:String,
    content: String,
    cover: String,
    author: {type:Schema.Types.ObjectId, ref:"User1"}
}, {
    timestamps: true,

})

const PostModel = model("posts1", PostSchema);

module.exports = PostModel;