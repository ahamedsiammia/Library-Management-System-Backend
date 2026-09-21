import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";
import { varifyToken } from "../utils/token";
import { email } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: {
        name: string;
        id: string;
        role: Role;
        roll : number;
      };
    }
  }
}

export const auth = (...requierdRole: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      sendResponse(res,{
        success : false,
        statusCode : 500,
        message : "Your Not Login!",
        data : []
      })
    }
    const verifyToken = await varifyToken(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    );

    // console.log(verifyToken);

    if (!verifyToken.success && verifyToken.data !== undefined) {
      throw new Error(verifyToken.message);
    }

    const { name, id, instituteName, shift, role, roll } = verifyToken.data!;

    if (!requierdRole.includes(role as Role)) {
      return sendResponse(res, {
        success: false,
        statusCode: 403,
        message: "You Have don't access For Route",
        data: [],
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        roll,
        role: role as Role,
      },
    });

    if (!user) {
      sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "User Not Exist",
        data: [],
      });
    }

    if (user?.activeStatus === "BLOCKED") {
      sendResponse(res, {
        success: false,
        statusCode: 404,
        message: "Your account has been blocked. please contact support.",
        data: [],
      });
    }

    req.user = {
      id: id as string,
      name: name,
      role: role as Role,
      roll : roll as number,
    };

    next();
  };
};
