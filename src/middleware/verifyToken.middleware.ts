import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";

interface CustomRequest extends Request {
  userId?: string;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.token;
  try {
    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    if (!decoded) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }
    req.userId = decoded.userId as string;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unauthorized - invalid token" });
  }
};
