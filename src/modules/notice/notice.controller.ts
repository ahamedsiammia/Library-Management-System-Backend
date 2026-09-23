import { Request, Response } from "express";
import { noticeService } from "./notice.service";
import { IRequestUser } from "../users/user.interface";

const createNotice = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const result = await noticeService.createNotice(user as IRequestUser, req.body);

    res.status(200).json({
      success: true,
      message: "Notice created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error,
    });
  }
};

const getAllNotices = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const result = await noticeService.getAllNotices(user as IRequestUser);

    res.status(200).json({
      success: true,
      message: "Notices retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error,
    });
  }
};

const updateNotice = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { noticeId } = req.params;

    const result = await noticeService.updateNotice(user as IRequestUser, noticeId as string, req.body);

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error,
    });
  }
};


const deleteNotice = async (req: Request, res: Response) => {
    
  try {
    const user = req.user;
    const { id } = req.params;

    const result = await noticeService.deleteNotice(user as IRequestUser, id as string);

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error,
    });
  }
};

export const noticeController = {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
};