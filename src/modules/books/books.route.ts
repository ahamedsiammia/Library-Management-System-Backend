import { Router } from "express";
import { BookControllers } from "./books.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { BooksValidation } from "./booksvalidation";

const router = Router();

router.get("/", BookControllers.getAllBooks);

router.get("/:id",auth(Role.ADMIN,Role.USER,Role.LIBRARIAN), BookControllers.getBookById);

router.post("/create-books", auth(Role.LIBRARIAN,Role.ADMIN) , BookControllers.createBook);

router.patch("/:id",auth(Role.LIBRARIAN,Role.ADMIN),validateRequest(BooksValidation.updateBookZodSchema), BookControllers.updateBook);

router.post("/return-book/:bookingId",auth(Role.ADMIN,Role.USER,Role.LIBRARIAN),BookControllers.returnBook)


export const BookRoutes = router;