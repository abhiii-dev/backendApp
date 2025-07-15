import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploader } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    const {fullName, email, username, password} = req.body
    console.log("Email: ",email);

    if ([fullName, email, username, password].some((value)=> val?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUesr = await User.findOne({
        $or: [{username},{email}]
    })
    if (existingUesr) {
        throw new ApiError(409,"Existing account")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const couverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploader(avatarLocalPath)
    const coverImage = await uploader(couverImageLocalPath)
    
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username:username.toLowercase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the  user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
    
    
})

export default registerUser
