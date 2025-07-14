import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    })
    
const uploader = async(localPath) => {
    try {
        //checking for existance of the file
        if(!localPath) return null
        //uploading file to cloudinary
        const response = await cloudinary.uploader.upload(localPath,{
            resource_type:'auto',
        })

        console.log("File Uploaded..!!", response.url);

        return response;
    }
    
    catch (error) {
        fs.unlinkSync(localPath) // removes the file if upload fails
        return null
    }
}

export {uploader}