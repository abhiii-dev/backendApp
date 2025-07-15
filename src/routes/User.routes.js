import { Router } from "express";
import registerUser from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const userRouter = Router()

userRouter.route("/register").post(     // when a post request is sent to this /register url before reaching the 
    upload.fields([//                     registerUser controller we use the multer middleware previous to it to upload the images
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

export default userRouter