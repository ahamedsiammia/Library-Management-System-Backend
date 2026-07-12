import config from "../../config";
import { prisma } from "../../lib/prisma";
import { Iuser } from "./user.interface";
import bcrypt from "bcrypt";

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

const getAllUser = async () => {
  const user = await prisma.user.findMany();
  return { user };
};

export const userService = {
  createUserIntoDB,
  getAllUser,
};
