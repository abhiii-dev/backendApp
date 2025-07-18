import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
} from "../controllers/user.controllers.js";

const userRouter = Router()

userRouter.route("/register").post(     // when a post request is sent to this /register url before reaching the 
    upload.fields([//                     registerUser controller we use the multer middleware previously, to upload the images
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
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT , logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/reset-pwd").post(verifyJWT,changeCurrentPassword)

export default userRouter