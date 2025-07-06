import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
const url=process.env.MONGODB_URL



const connectDB = async function(){
    try {
        const connectionInstance = await mongoose.connect(`${url}/${DB_NAME}`)  //  mongoose.connect("url/db-name")
        console.log(`DB connected, HOSTING FROM: ${connectionInstance.connection.host}`)


    } catch (error) {
        console.error("ERROR IS: ",error)
        process.exit(1)
    }
}

export default connectDB;