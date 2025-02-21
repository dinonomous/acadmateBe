import { Request, Response } from "express";
import { User } from "../models/user.model";

interface CustomRequest extends Request {
  userId?: string;
}

export async function TimeTable(req: CustomRequest, res: Response) {
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
    const tt = user.timetable;
    if (tt) {
      return res.status(200).json(tt);
    } else {
      return res.status(404).json({ error: "Courses not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error fetching Courses data" });
  }
}
