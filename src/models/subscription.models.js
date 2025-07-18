import mongoose from "mongoose"
import { User } from "./user.models"

subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.type.ObjectId,
        ref:User
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    }

},{timestamps:true})

export const Subs = mongoose.model("Subs",subscriptionSchema)
