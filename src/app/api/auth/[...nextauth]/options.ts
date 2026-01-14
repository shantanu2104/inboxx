import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import dbConnect from "@/src/lib/dbConnect";

import UserModel from "@/src/model/User";
import { email } from "zod";

export const authOptions:NextAuthOptions={
    providers :[
        CredentialsProvider({
               name: "Credentials",
               id:"credentials",
                 credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
             },
             async authorize(credentials:any):Promise<any>{
                  await dbConnect();
                  try{
                const user =   await UserModel.findOne({
                    $or: [
                        {email: credentials.email},
                        {username:credentials.email}
                    ],
                   });
                   if(!user){
                    throw new Error('No user found with this email')
                   }
                   if(!user.isVerified){
                throw new Error('Verify your account')
                   }
                   const isPasswordCorrect= await bcrypt.compare(credentials.password,user.password)
                   if(isPasswordCorrect){
                    return user
                   }else{
                    throw new Error("Incorrect password");
                   }
                  }catch(err:any){
                   throw new Error(err.message || "Something went wrong")
                  }
             }
        })
    ],
    callbacks:{
async session({session,token}){
    if(token){
        session.user._id= token._id
        session.user.isVerified=token.isVerified
        session.user.isAcceptingMessages=token.isAcceptingMessages
        session.user.username=token.username
    }
    return session
},
async jwt({token , user}){
    if(user){
        token._id=user._id?.toString()
        token.isVerified=user.isVerified
        token.isAcceptingMessages=user.isAcceptingMessages
        token.username= user.username
    }
    return token 
}
    },
    pages:{
        signIn:'/sign-in'
    },
    session:{
        strategy: "jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,

}