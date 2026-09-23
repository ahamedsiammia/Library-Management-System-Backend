import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { LibrarianServices } from "./librarian.service";

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const data = await LibrarianServices.getDashboardStats();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Dashboard stats retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;
    const data = await LibrarianServices.getAllUsers(
      role as string,
      search as string
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { activeStatus } = req.body;
    const data = await LibrarianServices.updateUserStatus(id as string, activeStatus);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User status updated successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLibrarian = async (req: Request, res: Response) => {
  try {
    const data = await LibrarianServices.createLibrarian(req.body);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Librarian account created successfully",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const data = await LibrarianServices.getSystemSettings();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "System settings retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const data = await LibrarianServices.updateSystemSettings(req.body);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "System settings updated successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const data = await LibrarianServices.getActivityLogs();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Activity logs retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const LibrarianControllers = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  createLibrarian,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs,
};
