import { Request, Response } from "express";
import { BookServices } from "./books.service";
import { sendResponse } from "../../utils/sendResponse";
import { IRequestUser } from "../users/user.interface";

const getAllBooks = async (req: Request, res: Response) => {
  try {
    const result = await BookServices.getAllBooks(req.query);

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};


const createBook = async (req: Request, res: Response) => {
  try {
    const result = await BookServices.createBook(req.body);

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await BookServices.getBookById(id as string);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await BookServices.updateBook(id as string, req.body);

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
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

const returnBook = async(req:Request,res:Response)=>{
  try {
    const {bookingId} = req.body;
    const user = req.user
    const returnBook = await BookServices.returnBook(user as IRequestUser,bookingId as string)

    sendResponse(res,{
      success : true,
      statusCode : 200,
      message : "Your Book Return Successful",
      data : returnBook
    })
    
  } catch (error: any) {
      sendResponse(res, {
        success: false,
        statusCode: 500,
        message: error.message,
        error: error,
      });
    }

}

export const BookControllers = {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  returnBook
};