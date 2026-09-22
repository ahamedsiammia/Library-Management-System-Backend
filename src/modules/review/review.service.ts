import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../users/user.interface";
import { ICreateReview, IUpdateReview } from "./review.interface";

const createReview = async (
  user: IRequestUser,bookId: string,payload: ICreateReview,) => {
  const book = await prisma.books.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error("Book Not Found");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: bookId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You already reviewed this book");
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      bookId: bookId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  const aggregate = await prisma.review.aggregate({
    where: { bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.books.update({
    where: { id: bookId },
    data: {
      rating: aggregate._avg.rating || 0,
      reviewsCount: aggregate._count.rating,
    },
  });

  return review;
};

const updateReview = async (user: IRequestUser, payload: IUpdateReview) => {
  const { reviewId, ...updateData } = payload;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review Not Found");
  }

  if (review.userId !== user.id) {
    throw new Error("You are not the owner of this review");
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
  });

  const aggregate = await prisma.review.aggregate({
    where: { bookId: review.bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.books.update({
    where: { id: review.bookId },
    data: {
      rating: aggregate._avg.rating || 0,
      reviewsCount: aggregate._count.rating,
    },
  });

  return result;
};

const getReviewsByBookId = async (bookId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { bookId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { bookId } }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review Not Found");
  }

  const isOwner = review.userId === user.id;
  const isAdminOrLibrarian = user.role === "ADMIN" || user.role === "LIBRARIAN";

  if (!isOwner && !isAdminOrLibrarian) {
    throw new Error("You are not allowed to delete this review");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  const aggregate = await prisma.review.aggregate({
    where: { bookId: review.bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.books.update({
    where: { id: review.bookId },
    data: {
      rating: aggregate._avg.rating || 0,
      reviewsCount: aggregate._count.rating,
    },
  });

  return { message: "Review deleted successfully" };
};


export const reviewService = {
  createReview,
  updateReview,
  getReviewsByBookId,
  deleteReview
};
