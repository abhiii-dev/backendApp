import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploader } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccesstoken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        console.log(user);

        return {accessToken,refreshToken}
    } 
    catch (err) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    const {fullName, email, username, password} = req.body
    // console.log("Email: ",email);

    if ([fullName, email, username, password].some((value)=> value?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUesr = await User.findOne({
        $or: [{username},{email}]
    })
    if (existingUesr) {
        throw new ApiError(409,"Existing account")
    }
    const avatarLocalPath = req.files?.avatar?.[0].path
    const couverImageLocalPath = req.files?.coverImage?.[0].path

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
        username:username.toLowerCase(),
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

const loginUser = asyncHandler(async(req,res)=>{
    const {username, email, password} = req.body;
    
    if (!(username || email)) {
        throw new ApiError(400,"Email or Username is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if (!user) {
        throw new ApiError(404,"User not found")
    }

    const isPassValid = await user.isPasswordCorrect(password)

    if (!isPassValid) {
        throw new ApiError(401,"Incorrect password")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User loggedIn Successfully")
    )

})

const logoutUser = asyncHandler(async(req,res)=>{  
    await User.findByIdAndUpdate(
        req.user._id , 
        {
            $set:{ refreshToken: undefined }
        },
        { new:true }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))


})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN)

    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"Invalid Refresh Token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh Token Expired")
    }

    const {newAccessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .cookie("accessToken",newAccessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(new ApiResponse(200,{
        accessToken:newAccessToken,
        refreshToken: newRefreshToken
    },"User Relogined Successfully"))

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

    const {oldPass,newPass,confirmPass} = req.body

    const user = await User.findById(req.user?._id)
    const isPass = await user.isPasswordCorrect(oldPass)

    if(!isPass){
        throw new ApiError(400,"Invalid Password")
    }
    if(newPass!==confirmPass){
        throw new ApiError(400,"Both the Password must be same")
    }
    user.password = newPass
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changed Successful"))
})

const currentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,
        {
            username:req.user
        },
        "Successfully found the current User"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {newEmail,newFullName} = req.body

    if(!(newFullName || newEmail)){
        throw new ApiError(401,"Mandatory Fields cannot be empty")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            fullName:newFullName,
            email:newEmail
        },
        {new:true}
    ).select("-password -refreshToken")


    return res.status(200)
    .json(new ApiResponse(200,{user},"Fields updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Image is required for Updating")
    }

    const avatar = await uploader(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            avatar:avatar.url
        },
        {new:true}
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(200,user,"Avatar updated Successfully"))
    
})
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Image is required for Updating")
    }

    const coverImage = await uploader(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            coverImage:coverImage.url
        },
        {new:true}
    ).select("-password")
    
    return res.status(200)
    .json(new ApiResponse(200,user,"coverImage updated Successfully"))
    
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    currentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}



