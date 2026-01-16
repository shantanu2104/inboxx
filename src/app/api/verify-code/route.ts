import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import { success } from "zod";


export async function POST(request:Request) {
    await dbConnect()

    try{
    const {username,code}= await request.json()
    const decodedusername=decodeURIComponent(username)
    const user=await UserModel.findOne({username:decodedusername})
    if(!user){
    return Response.json({
        success:false,
        message:"User not found"
    },{status:500})
    }
    const isCodeValid=user.verifyCode=== code
    const isCodeNotExpired = new Date(user.verifyCodeExpiry)>new Date()
    if(isCodeValid && isCodeNotExpired){
        user.isVerified=true
        await user.save()
        return Response.json({
            success:true,
            message:"Account verified succesfully"
        },{status:200})
    }else if (!isCodeNotExpired){
        return Response.json({
            success:false,
            message:"Verification code has expired please sign-up again"
        },{status:400})
    }else{
         return Response.json({
            success:false,
            message:"Incorrect verifcation code"
        },{status:400})
    }

    }catch(error){
       console.log("Error verifying user" , error);
       return Response.json({
        success:false,
        message :"Error verifying user"
       },{status:500})
    }
}