import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IBookQuery, ICreateBook } from "./books.interface";

const getAllBooks = async (query: IBookQuery) => {
  const page = Number(query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.BooksWhereInput = {};

  // Search
  if (query.search) {
    whereConditions.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        author: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        isbn: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Category Filter
if (query.category) {
  whereConditions.category = {
    equals: query.category,
    mode: "insensitive",
  };
}

  // Get Books
  const books = await prisma.books.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Total Books
  const total = await prisma.books.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: books,
  };
};

const createBook = async (payload: ICreateBook) => {
  const result = await prisma.books.create({
    data: payload,
  });

  return result;
};

const getBookById = async (id: string) => {
  const result = await prisma.books.findUnique({
    where: { id },
  });
  return result;
};

export const BookServices = {
  getAllBooks,
  createBook,
  getBookById,
};