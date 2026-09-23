import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { varifyToken } from "../../utils/token";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "./user.interface";

const createUser = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const user = await userService.createUserIntoDB(payload);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Verification code sent successfully. Please check your email",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: true,
      statusCode: 500,
      message: error.message,
      data: [],
      error: error,
    });
  }
};

const emailVerification = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const result = await userService.emailVerification(payload);

    const { accessToken, refreshToken, user } = result;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const payload = {
      email: req.body.email,
      password: req.body.password,
    };
    const user = await userService.loginUserIntoDB(payload);

    const { accessToken, refreshToken } = user;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day or 24 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User Login Successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: true,
      statusCode: 201,
      message: error.message,
      data: [],
      error: error.message,
    });
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getAllUser();

    res.status(200).json({
      success: true,
      message: "All User retrieved successfully.",
      data: user,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
      const user = req.user;
      if(!user){
        throw new Error("This is not Login");
      }

      const result = await userService.getMe(user);

      sendResponse(res,{
        success : true,
        statusCode : 200,
        message : "user Retrieved successful ",
        data : result
      })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const UpdateProfile = async (req: Request, res: Response) => {
  const payload = req.body;
  const id = req.user?.id;
  try {
    const user = await userService.UpdateProfile(id as string, payload);

    res.status(200).json({
      success: true,
      message: "Profile Update successfully.",
      data: user,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
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

const googleLogin = async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await userService.googleLoin(payload);

  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient registered successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    await userService.forgotPassword(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `OTP send to this ${payload.email}  Email.`,
      data: null,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    await userService.resetPassword(payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password Change successfully",
      data: null,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};

const setPassword = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { newPassword } = req.body;

    const result = await userService.setPassword(user as IRequestUser, newPassword as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "New Password set successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};


export const userController = {
  createUser,
  loginUser,
  getAllUser,
  getMe,
  logoutUser,
  googleLogin,
  emailVerification,
  forgotPassword,
  resetPassword,
  UpdateProfile,
  setPassword
};
