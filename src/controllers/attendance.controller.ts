import { Request, Response } from "express";
import { User } from "../models/user.model";

interface CustomRequest extends Request {
  userId?: string;
}

export async function Attendance(
  req: CustomRequest,
  res: Response
): Promise<Response> {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user id not provided" });
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const attendance = user.att;
    if (attendance) {
      return res.status(200).json(attendance);
    } else {
      return res.status(404).json({ error: "Attendance not found" });
    }
  } catch (error: any) {
    console.error("Error fetching attendance data:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
