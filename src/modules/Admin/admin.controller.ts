import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const AllLibrarian = async (req: Request, res: Response) => {
  try {
    const librarian = await adminService.AllLibrarian();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "LIBRARIAN Retrieved successful",
      data: librarian,
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

export const adminController = {
  AllLibrarian,
};
