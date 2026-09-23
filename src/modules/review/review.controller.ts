import { Request, Response } from "express";
import { reviewService } from "./review.service";
import { IRequestUser } from "../users/user.interface";
import { sendResponse } from "../../utils/sendResponse";

const createReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { bookId } = req.body;

    const result = await reviewService.createReview(user as IRequestUser, bookId as string, req.body);

    sendResponse(res,{
       success: true,
       statusCode : 201,
      message: "Review created successfully",
      data: result,       
    })

  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};


const updateReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const {reviewId} = req.params;
    const result = await reviewService.updateReview(user as IRequestUser, req.body,reviewId as string);

    sendResponse(res,{
       success: true,
       statusCode : 200,
      message: "Review Update successfully",
      data: result,       
    })

  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: error.message,
      error: error,
    });
  }
};


const getReviewsByBookId = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const result = await reviewService.getReviewsByBookId(bookId as string, req.query);

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
      error,
    });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { reviewId } = req.params;

    const result = await reviewService.deleteReview(user as IRequestUser, reviewId as string);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
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

export const reviewController = {
  createReview,
  updateReview,
  getReviewsByBookId,
  deleteReview
};