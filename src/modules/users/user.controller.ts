import { Request, Response } from "express";
import { userService } from "./user.service";

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
    getAllUser
}