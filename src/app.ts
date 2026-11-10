import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import { userRoute } from "./modules/users/user.route";
import { BookRoutes } from "./modules/books/books.route";
import { POST } from "./Aichat/aiChat";
import { LibrarianRoutes } from "./modules/librarian/librarian.route";
import { prisma } from "./lib/prisma";
import { sendResponse } from "./utils/sendResponse";
import { bookingRouter } from "./modules/Bookings/booking.route";
import { paymentRouter } from "./modules/payment/payment.route";
import { adminRouter } from "./modules/Admin/admin.route";
import { reviewRouter } from "./modules/review/review.route";
import { noticeRouter } from "./modules/notice/notice.router";



const app : Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // allow all origins reflectively for flexible dev and production
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended : true}));




app.use("/user", userRoute)

app.use("/librarian", LibrarianRoutes)

app.use("/books", BookRoutes)

app.use("/booking",bookingRouter)

app.use("/payment",paymentRouter)

app.use("/review",reviewRouter)

app.use("/admin",adminRouter)

app.use("/notice",noticeRouter)

app.post("/aichat",POST);


app.get("/",async(req:Request,res:Response)=>{
    res.send({
        SUCCESS: true,
        MESSAGE : " WELCOME TO OUR LIBRARY MANAGEMENT SYSTEM DATABASE.",
        CREATE_BY:  "SIAM AHAMED",
        INSTITUTE : "MYMENSINGH POLYTECHNIC INSTITUTE"
    })
})


export default app ;