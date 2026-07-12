import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import { userRoute } from "./modules/users/user.route";



const app : Application = express();

app.use(cors({
        origin: process.env.app_url,
        credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended : true}));


app.use("/user",userRoute)


app.get("/",async(req:Request,res:Response)=>{
    res.send({
        SUCCESS: true,
        MESSAGE : " WELCOME TO OUR LIBRARY MANAGEMENT SYSTEM DATABASE.",
        CREATE_BY:  "SIAM AHAMED",
        INSTITUTE : "MYMENSINGH POLYTECHNIC INSTITUTE"
    })
})


export default app ;