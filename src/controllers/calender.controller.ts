import { Request, Response } from "express";
import { User } from "../models/user.model";

interface CustomRequest extends Request {
  userId?: string;
}

export async function Calendar(
  req: CustomRequest,
  res: Response
): Promise<Response> {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user ID not provided" });
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const calendarData = user.calendar;
    if (calendarData && calendarData.length !== 0) {
      return res.status(200).json(calendarData);
    } else {
      return res.status(404).json({ error: "Calendar data not found" });
    }
  } catch (error: any) {
    console.error("Error fetching calendar data:", error.message);
    return res.status(500).json({ error: "Error fetching calendar data" });
  }
}
