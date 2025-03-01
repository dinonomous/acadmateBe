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
): Promise<void> => {
  const token = req.cookies.token;
  try {
    if (!token) {
      res
        .clearCookie("token")
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    if (!decoded) {
      res;
      res
        .clearCookie("token")
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }
    req.userId = decoded.userId as string;
    const userId = req.userId;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      res
        .clearCookie("token")
        .status(404)
        .json({ success: false, message: "User not found" });
      return;
    }
    next();
  } catch (error) {
    res
      .clearCookie("token")
      .status(500)
      .json({ success: false, message: "Unauthorized - invalid token" });
  }
};
