import z from "zod"


const paymentDetailsZodSchema =z.object({
    paymentId : z.string()
});


export const paymentValidation = {
    paymentDetailsZodSchema
}