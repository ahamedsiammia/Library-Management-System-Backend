import { number } from "zod";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { InitiatePayment } from "../payment/InitiatePayment";
import { IRequestUser } from "../users/user.interface";
import { IBookQuery, ICreateBook, IUpdateBook } from "./books.interface";

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


const updateBook = async (id: string, payload: IUpdateBook) => {
  const result = await prisma.books.update({
    where: { id },
    data: payload,
  });

  return result;
};

const returnBook = async (user:IRequestUser,bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking Not Found");
  }

  if (booking.userId !== user.id) {
  throw new Error("This booking is not yours");
}

if (booking.status !== "ISSUED") {
  throw new Error("This book is not currently issued");
}

  if (!booking.dueDate) {
    throw new Error("Due date not set for this booking");
  }

  const returnDate = new Date();
  const dueDate = new Date(booking.dueDate);

  let fineAmount = 0;

  if (returnDate > dueDate) {
    const diffTime = returnDate.getTime() - dueDate.getTime();
    const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    fineAmount = overdueDays * 20;
  }

  if(fineAmount){
    await prisma.booking.update({
    where: { id: bookingId },
    data: { fineAmount }
  });
  const payment = await InitiatePayment(user , bookingId)

  return {payment,message:"You pay Fine amount then return book"}

  } else {
      const result = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "RETURNED",
      returnDate: returnDate,
      fineAmount: fineAmount, 
    },
    include :{
      book : true
    }
  });

  await prisma.books.update({
    where:{
      id : result.book.id
    },
    data : {
      copiesAvailable : Number(result.book.copiesAvailable) + 1
    }
  })
  return result;

  }

};

export const BookServices = {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  returnBook
};