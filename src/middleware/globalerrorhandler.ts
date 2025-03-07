import { Prisma, User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import HttpStatusCodes from "../common/httpstatuscode.js";
import { RouteError } from "../common/routeerror.js";
import ENV from "../common/env.js";
import { NodeEnvs } from "../common/constants.js";
import { exceptionCodes } from "../common/prismafilter.js";
import { decode } from "next-auth/jwt";
import { prisma } from "../utils/prismaclient.js";

const cleanMessage = (message: string) => message.replace(/(\r\n|\r|\n)/g, " ");
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Log the error unless in test environment
  if (ENV.NODE_ENV !== NodeEnvs.Test.valueOf()) {
    console.error(err);
  }

  // Handle Prisma Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = exceptionCodes[err.code] || HttpStatusCodes.BAD_REQUEST;
    const message =
      ENV.NODE_ENV === "production" ? err.meta : cleanMessage(err.message);
    return res.status(statusCode).json({
      success: false,
      statusCode,
      path: req.url,
      message,
    });
  }

  // Handle Prisma Unknown Request Error
  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      path: req.url,
      message: "Something went wrong",
    });
  }

  // Handle Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    const indexOfArgument = err.message.indexOf("Argument");
    const message = cleanMessage(err.message.substring(indexOfArgument));
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      path: req.url,
      message,
    });
  }

  // Handle custom RouteError
  if (err instanceof RouteError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  // Fallback for all other errors
  return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    path: req.url,
    message: err.message || "Internal Server Error",
  });
};

declare global {
  namespace Express {
    interface Request {
      user: any; // Add a `session` property to the Request interface
    }
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    console.log("Cookies:", req.cookies); // Log all cookies
    const sessionToken = req.cookies["authjs.session-token"];
    console.log("Received session token:", sessionToken);
    if (!sessionToken) {
      throw new RouteError(403, "Unauthorized: No token found");
    }
    console.log("AUTH_SECRET:", process.env.AUTH_SECRET);
    const decodedToken = await decode({
      token: sessionToken,
      secret: process.env.AUTH_SECRET!,
      salt: "authjs.session-token",
    });

    console.log("Decoded token:", decodedToken);

    if (!decodedToken) {
      throw new RouteError(403, "Unauthorized: Invalid token");
    }
    if (!decodedToken?.id) {
      throw new Error("Invalid or missing user ID in token");
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id as string },
    });

    if (!user) {
      throw new RouteError(403, "Unauthorized: User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Failed to authenticate", error);
    throw new RouteError(403, "Unauthorized: Invalid token");
  }
};
