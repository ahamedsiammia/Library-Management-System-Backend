import { NextFunction, Request, Response } from "express";
import z, { ZodObject } from "zod";

export const validateRequest =(zodSchema: z.ZodObject) =>{
    return async(req:Request,res:Response,next:NextFunction)=>{

   try {
     const payload = req.body ?? {};

    const result = zodSchema.safeParse(payload)

        if(!result.success){
        let errorMessage = "";

        result.error.issues.forEach(issues =>{
            errorMessage = errorMessage.concat(issues.message,',')
        })
        throw new Error(errorMessage)
        
    };

    req.body = result.data 

    next();
   } catch (error) {
    next(error)
   }
}
}
