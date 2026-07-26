import { Router } from "express";
import { BookControllers } from "./books.controller";

const router = Router();

router.get("/books", BookControllers.getAllBooks);

router.get("/books/:id", BookControllers.getBookById);

router.post("/create-books", BookControllers.createBook);

export const BookRoutes = router;