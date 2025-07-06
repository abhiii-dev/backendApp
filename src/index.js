import connectDB from "./db/index.js";
connectDB()










/*
// method 1
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();
const port = process.env.PORT

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



























