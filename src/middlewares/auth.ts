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
    try {
      const token = req.cookies?.accessToken
        ? req.cookies.accessToken
        : req.headers.authorization?.startsWith("Bearer")
          ? req.headers.authorization?.split(" ")[1]
          : req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          success: false,
          statusCode: 401,
          message: "You are not logged in!",
          data: [],
        });
      }

      const verifyToken = await varifyToken(
        token,
        process.env.JWT_ACCESS_SECRET as string,
      );

      if (!verifyToken.success || !verifyToken.data) {
        return sendResponse(res, {
          success: false,
          statusCode: 401,
          message: verifyToken.message || "Invalid or expired token!",
          data: [],
        });
      }

      const { name, id, role, roll } = verifyToken.data;

      if (requierdRole.length > 0 && !requierdRole.includes(role as Role)) {
        return sendResponse(res, {
          success: false,
          statusCode: 403,
          message: "You don't have access to this route",
          data: [],
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        return sendResponse(res, {
          success: false,
          statusCode: 404,
          message: "User does not exist",
          data: [],
        });
      }

      if (user.activeStatus === "BLOCKED") {
        return sendResponse(res, {
          success: false,
          statusCode: 403,
          message: "Your account has been blocked. Please contact support.",
          data: [],
        });
      }

      req.user = {
        id: user.id,
        name: user.name,
        role: user.role,
        roll: user.roll ?? 0,
      };

      next();
    } catch (error: any) {
      return sendResponse(res, {
        success: false,
        statusCode: 500,
        message: error.message || "Internal server error during authentication",
        data: [],
      });
    }
  };
};
