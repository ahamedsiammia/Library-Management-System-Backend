import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";

const createUser =async(req:Request,res:Response)=>{
    const payload = req.body;
    try {
        const user = await userService.createUserIntoDB(payload)
        res.status(201).json({
            success : true,
            statusCode : 201,
            message : "User Created Successfully",
            data : user
        })
    } catch (error: any) {
               res.status(500).json({
            success : true,
            statusCode : 201,
            message : error.message,
            data : [],
            error : error.message
        }) 
    }
};


const loginUser = async(req:Request,res:Response)=>{
    try {
        const payload = {
            email : req.body.email,
            password : req.body.password
        }
        const user = await userService.loginUserIntoDB(payload);

        const {accessToken,refreshToken} =user;

            res.cookie("accessToken",accessToken,{
            httpOnly: true,
            secure : false,
            sameSite: "none",
            maxAge : 1000 * 60 * 60 * 24  // 1 day or 24 hours
        })

        res.cookie("refreshToken",refreshToken,{
            httpOnly: true,
            secure : false,
            sameSite: "none",
            maxAge : 1000 * 60 * 60 * 24 * 7  // 7 day
        })

        sendResponse(res,{
            success : true,
            statusCode : 200,
            message : "User Login Successfully",
            data : user
        })
    } catch (error: any) {
               res.status(500).json({
            success : true,
            statusCode : 201,
            message : error.message,
            data : [],
            error : error.message
        }) 
    }
}

const getAllUser=async(req:Request,res:Response)=>{
    try {
        const user = await userService.getAllUser();

        res.status(200).json({
            success : true,
            message : "All User retrieved successfully. Its just texting purpose",
            data : user
        })
    } catch (error) {
        console.log(error);
    }
}

export const userController ={
    createUser,
    loginUser,
    getAllUser
}