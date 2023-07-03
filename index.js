const express = require ('express');
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/User")
const Post = require("./models/Post")

// const bcrypt = require("bcryptjs")

const app = express();
const bcrypt = require('bcrypt');
const jwt= require("jsonwebtoken");
const secret = "fdjn219nfwf2n9c2b0once-0ml"
const cookieParser = require('cookie-parser')
const multer = require("multer");
const uploadMiddleware = multer({dest: "uploads/"})
const fs = require('fs');
const { response } = require('express');
app.use(cors({credentials:true, origin:"http://localhost:3000"}));
app.use(express.json());
app.use(cookieParser())
app.use(express.static("uploads"))
app.use("/uploads", express.static(__dirname + "/uploads"))

 mongoose.connect("mongodb+srv://admin:abc1234@cluster0.9vfr4.mongodb.net/?retryWrites=true&w=majority")

app.post('/register', async (req, res) =>{
    const{username, password} = req.body;
    try{
        // const hashed = bcrypt.hash(password, 10, function(err, hash) {
        //     console.log(hash)
        // });
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const userDoc = await User.create({
             username,
             password: hash
            });
        res.json(userDoc)
        console.log(username,password)
    
    }catch(err){
        res.status(400).json(err)
        console.log(err)
    }
    // res.json({requestedData:{username, password}})
    // res.json('test ok2');
    
})


app.post('/login', async (req, res)=>{
    console.log(req.body)
    const {username, password} = req.body;
    console.log(username)
    const userDoc = await User.findOne({username})
    // console.log(username)
    const passOk =  bcrypt.compareSync(password, userDoc.password) 
    if(passOk){
        jwt.sign({username, id: userDoc._id}, secret, {}, (err, token)=>{
            if (err) throw err;
            res.cookie("token", token).json({
                id: userDoc._id,
                username,

            })
        })
        // res.json()
    } else{
        res.status(400).json("wrong credentials")
    }
    // res.json(passOk)
})



app.get('/profile', (req, res)=> {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err, info)=>{
        if(err) throw err;
        res.json(info)
    })
    // res.json(req.cookies)
})

app.post("/logout", (req, res) => {
    res.cookie("token", "").json('ok logout')
})


app.post("/post",uploadMiddleware.single("file"), async(req, res)=>{
    // console.log(req.file)
    const {originalname, path} = req.file;

    const parts = originalname.split(".")
    const ext = parts[parts.length -1];
    const newPath = path+"."+ext
    // console.log(newPath,"newpath")
    fs.renameSync(path, newPath)
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info)=>{
        if(err) throw err;

        const{title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id
        })
    

        res.json(postDoc)
    })

    
    // const{title, summary, content} = req.body;
    // const postDoc = await Post.create({
    //     title,
    //     summary,
    //     content,
    //     cover: newPath,
    //     // author: 
    // })
})


app.put("/post",uploadMiddleware.single("file"), async(req,res)=>{
    let newPath =null;
    if(req.file){
   const {originalname, path} = req.file;

    const parts = originalname.split(".")
    const ext = parts[parts.length -1];
     newPath = path+"."+ext
    fs.renameSync(path, newPath)
    }
    const{token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info)=>{
        if(err) throw err;
        const{title, summary, content, id} = req.body;
        const postDoc = await Post.findById(id)
       const isAuthor = JSON.stringify(postDoc.author) ===JSON.stringify(info.id); 
       if(!isAuthor){
        return res.status(400).json("Your are not the author")
         
       }
       await postDoc.updateOne({
        title,
         summary,
          content,
          cover: newPath? newPath : postDoc.cover
        })
        res.json(postDoc)
      
    
    })

    // res.json({test:4, files:req.file})
})


app.delete("/post/:id", async(req, res)=> {
    // console.log(req)
    const{id} = req.params;
    console.log(id,"to be deletedID")
    // console.log(postDoc,"before")

    const postDoc = await Post.findById(id).deleteOne()
    console.log(postDoc,"post")

    // const deletedPost = await postDoc.filter((id)=> postDoc.id !== id )
    // console.log(deletedPost,"delete")
    res.json({postDoc})
})

app.get("/post",async (req, res)=>{
    // const posts = await Post.find().populate("author");
    // // console.log(posts)
    // console.log(posts)
//    await  res.json(posts)
// console.log(res.json(await Post.find().populate("author")))
    res.json(await Post.find()
    .populate("author", ["username"])
    .sort({createdAt: -1})
    .limit(20)
    )
})

app.get("/post/:id", async(req, res)=>{
    const{id} = req.params;
    const postDoc = await Post.findById(id).populate("author",['username']);
    res.json(postDoc);
})


app.listen(4000);

