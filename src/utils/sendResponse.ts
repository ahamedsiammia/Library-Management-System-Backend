type TresPonces = {
    success : boolean,
    statusCode : number,
    message : string,
    data ?: any,
    error ?: any
    meta ?: any
}
import { Response } from "express"

export const sendResponse =(res:Response,payload : TresPonces)=>{
    const {success,statusCode,message,data,error,meta} = payload;
            res.status(statusCode).json({
            success : success,
            statusCode : statusCode,
            message : message,
            meta : meta,
            data : data,
            error : error,
        })  
}
  


