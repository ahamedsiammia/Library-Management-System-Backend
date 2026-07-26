import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import { userRoute } from "./modules/users/user.route";
import { BookRoutes } from "./modules/books/books.route";



const app : Application = express();

const allowedOrigins = [
  process.env.APP_URL,
  process.env.PRODUCTION_URL,
];

app.use(
  cors({
    origin(origin, callback) {
      // Postman বা server-to-server request-এর জন্য
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended : true}));




app.use("/user",userRoute)

app.use("/user",BookRoutes)



console.log(allowedOrigins);
app.get("/",async(req:Request,res:Response)=>{
    res.send({
        SUCCESS: true,
        MESSAGE : " WELCOME TO OUR LIBRARY MANAGEMENT SYSTEM DATABASE.",
        CREATE_BY:  "SIAM AHAMED",
        INSTITUTE : "MYMENSINGH POLYTECHNIC INSTITUTE"
    })
})


export default app ;