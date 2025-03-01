import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { User } from "../models/user.model";

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
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    if (!decoded || !decoded.userId) {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
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
    const statusCode = error instanceof jwt.JsonWebTokenError ? 401 : 500;
    const message =
      statusCode === 401
        ? "Unauthorized - invalid token"
        : "Internal server error";

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
