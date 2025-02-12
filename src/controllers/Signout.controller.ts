import { Request, Response } from "express";
import { User } from "../models/user.model";

interface CustomRequest extends Request {
  userId?: string;
}

export async function SignOut(req: CustomRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user id not provided" });
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.clearCookie("token");

    return res.status(200).json({ message: "signed out successfully" });
  } catch (error) {
    console.error("Error signing out:", error);
    return res.status(500).json({ error: "Error signing out" });
  }
}
