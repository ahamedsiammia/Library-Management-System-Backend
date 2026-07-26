import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { ILoin, Iuser, jwtPayload } from "./user.interface";
import bcrypt from "bcrypt";
import { createToken } from "../../utils/token";

const createUserIntoDB = async (payload: Iuser) => {
  const { name, email, password, instituteName, roll, semester, shift } =
    payload;

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error("An account with this email already exists.");
  }

  const existingRoll = await prisma.user.findUnique({
    where: { roll },
  });

  if (existingRoll) {
    throw new Error("This roll number is already registered.");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createuser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      instituteName,
      roll,
      semester,
      shift,
    },
    omit: {
      password: true,
    },
  });

  return createuser;
};


const loginUserIntoDB = async(payload:ILoin)=>{
  const {email,password} = payload;

  const isExistUser = await prisma.user.findUnique({
    where : {
      email
    }
  });

  if(!isExistUser){
    throw new Error("An account with this email not exists.")
  }

  const hashPassword = isExistUser.password

  const isCheckPassword = await bcrypt.compare(password,hashPassword);

  if(!isCheckPassword){
    throw new Error("Incorrect password.")
  }

  const {id,instituteName,role,shift,name,activeStatus,createdAt,roll,semester,updatedAt} = isExistUser

  const user ={
    id,
    instituteName,
    role,
    shift,
    name,
    activeStatus,
    createdAt,
    roll,
    semester,
    updatedAt 
  }

  const jwtPayload = {
      name ,
      id,
      instituteName,
      shift,
      role,
      roll
  };

  const accessToken = await createToken(jwtPayload as  jwtPayload,config.jwt_access_secret as string,config.jwt_access_expires_in as SignOptions)

  const refreshToken = await createToken(jwtPayload as  jwtPayload,config.jwt_refresh_secret as string,config.jwt_refresh_expires_in as SignOptions)

  return {...user,accessToken,refreshToken}
}





const getAllUser = async () => {
  const user = await prisma.user.findMany();
  return { user };
};

export const userService = {
  createUserIntoDB,
  loginUserIntoDB,
  getAllUser,
};
