import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { User } from "../models/user.model";

interface DecodedToken {
  userId: string;
}

interface CustomRequest extends Request {
  userId?: string;
}

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    if (!decoded?.userId) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.clearCookie("token");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (res.headersSent) return;

    res.clearCookie("token");

    let message = "Internal server error";
    let statusCode = 500;

    if (error instanceof TokenExpiredError) {
      message = "Token expired";
      statusCode = 401;
    } else if (error instanceof JsonWebTokenError) {
      message = "Invalid token";
      statusCode = 401;
    }

    if (req.accepts("html")) {
      res.redirect("/login");
    } else {
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }
};
