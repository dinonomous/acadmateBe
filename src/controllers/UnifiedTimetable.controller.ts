import { Request, Response } from "express";
import { User } from "../models/user.model";

interface CustomRequest extends Request {
  userId?: string;
}

export const UnifiedTimeTable = async (req: CustomRequest, res: Response) => {
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

    const timetable = user.unifiedtt;
    if (timetable) {
      return res.status(200).json(timetable);
    } else {
      return res.status(404).json({ error: "Timetable not found" });
    }
  } catch (error) {
    console.error("Error in UnifiedTimeTable:", error);
    return res.status(500).json({ message: "Error fetching timetable data" });
  }
};
