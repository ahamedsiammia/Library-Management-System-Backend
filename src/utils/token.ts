import jwt, { SignOptions } from "jsonwebtoken"
import { jwtPayload } from "../modules/users/user.interface"

export const createToken =async(payload :jwtPayload,secret : string,expiresIn : SignOptions)=>{
    try {
        if(!payload && !secret && !expiresIn){
            throw new Error("Can't Find userPayload,secret and expiresIn")
        };

        const Token = await jwt.sign(payload,secret,{
            expiresIn : expiresIn as SignOptions["expiresIn"]
        });

        if(!Token){
            throw new Error("Token Is Not created")
        };

        return Token

    } catch (error : any) {
          return {
        success:false,
        error : error.message
}
}

}

export const varifyToken = async(token:string,secret:string)=>{
    try {
        const varifyedToken = await jwt.verify(token,secret)

        
        
        return {
            success:true,
            data : varifyedToken as jwtPayload
        }
    } catch (error : any) {
        return {
            success : false,
            message : error.message
        }
    }
}