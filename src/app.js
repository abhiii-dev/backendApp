import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({origin: process.env.ORIGIN,credentials:true}))

app.use(express.json({limit:"1kb"}))
app.use(express.urlencoded({limit:"1kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import routes
import userRouter from "./routes/User.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter)


export default app;

