type TresPonces = {
    success : boolean,
    statusCode : number,
    message : string,
    data ?: any,
    error ?: any
}
import { Response } from "express"

export const sendResponse =(res:Response,payload : TresPonces)=>{
    const {success,statusCode,message,data,error} = payload;
            res.status(statusCode).json({
            success : success,
            statusCode : statusCode,
            message : message,
            data : data,
            error : error
        })  
}
  


