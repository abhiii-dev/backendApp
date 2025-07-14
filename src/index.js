import app from "./app.js";
import connectDB from "./db/index.js";
const port = process.env.PORT

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`Server listening on port ${port}`)
    })
})
.catch((err)=>{
    console.log("Error from index :" , err)
})










/*
// method 1
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();

( async () => {
    try {
        //connection of dataBase
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)  //  mongoose.connect("url/db-name")
        app.on("errror",(err)=>{
            console.log("ERR: ",err)
        })
        app.listen(port,()=>{
            console.log(`http://localhost:${port}`);
            
        })
    } catch (error) {
        console.error("Error found:", error)
    }
} )()
*/



























