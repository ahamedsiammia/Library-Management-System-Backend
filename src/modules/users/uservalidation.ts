import z, { email } from "zod"
import { Shift } from "../../../generated/prisma/enums";


const userLoginZodSchema =z.object({
    email : z.email("Not Email!"),
    password : z.string() 
				.min(8,"Password must be at least 8 characters long" )
  				.max(20,"Password cannot exceed 20 characters")
  				.refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  				.refine((val) => /[a-z]/.test(val),"Password must contain at least one lowercase letter")
  				.refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
  				.refine((val) => /[!@#$%^&*]/.test(val),"Password must contain at least one special character (!@#$%^&*)")
});
const userRegistrationSchema = z.object({
    name : z.string("Not a string!").min(3,"Name Must be 3 character long!"),
    email : z.email("Not a Email"),
    password : z.string() 
				.min(8,"Password must be at least 8 characters long" )
  				.max(20,"Password cannot exceed 20 characters")
  				.refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  				.refine((val) => /[a-z]/.test(val),"Password must contain at least one lowercase letter")
  				.refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
  				.refine((val) => /[!@#$%^&*]/.test(val),"Password must contain at least one special character (!@#$%^&*)"),
    instituteName : z.string(),
    roll : z.int(),
    semester : z.string(),
    shift : z.string()
})

const ForgotPasswordZodSchema = z.object({
    email : z.email("Not Email")
});

const ResetPasswordZodSchema = z.object({
		email : z.email("Not Email !"),
		otp : z.string("Not OTP").length(6),
	newPassword : z.string() 
				.min(8,"Password must be at least 8 characters long" )
  				.max(20,"Password cannot exceed 20 characters")
  				.refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  				.refine((val) => /[a-z]/.test(val),"Password must contain at least one lowercase letter")
  				.refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
  				.refine((val) => /[!@#$%^&*]/.test(val),"Password must contain at least one special character (!@#$%^&*)"),
})

const UpdateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters")
    .optional(),
    
  roll: z.int()
    .positive()
    .optional(),

  instituteName: z
    .string()
    .optional(),

  semester: z
    .string()
    .optional(),

  shift: z.enum(Shift)
    .optional(),
});


export const userValidation = {
    userLoginZodSchema,
    userRegistrationSchema,
    ForgotPasswordZodSchema,
    ResetPasswordZodSchema,
    UpdateUserProfileSchema
}


