import { Request, Response } from "express";
import { BookServices } from "./books.service";

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
    const result = await BookServices.getBookById(id);

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

export const BookControllers = {
  getAllBooks,
  createBook,
  getBookById,
};