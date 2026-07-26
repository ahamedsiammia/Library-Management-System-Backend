import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { varifyToken } from "../../utils/token";
import { prisma } from "../../lib/prisma";

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
            sameSite: "lax",
            maxAge : 1000 * 60 * 60 * 24  // 1 day or 24 hours
        })

        res.cookie("refreshToken",refreshToken,{
            httpOnly: true,
            secure : false,
            sameSite: "lax",
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

const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
        data: null,
      });
    }

    const verified = await varifyToken(
      token,
      process.env.JWT_ACCESS_SECRET as string
    );

    if (!verified.success || !verified.data) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        data: null,
      });
    }

    const { id } = verified.data;

    const user = await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const userController = {
    createUser,
    loginUser,
    getAllUser,
    getMe,
    logoutUser,
};