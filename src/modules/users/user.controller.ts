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
            message : "User Created Not Successfully",
            data : [],
            error : error.message
        }) 
    }
};

export const userController ={
    createUser
}