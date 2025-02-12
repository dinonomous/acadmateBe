import axios from "axios";
import { Request, Response } from "express";
import { User } from "../models/user.model";

function decodeEncodedString(encodedString: string): string {
  return encodedString.replace(
    /\\x([0-9A-Fa-f]{2})/g,
    (match: string, p1: string) => String.fromCharCode(parseInt(p1, 16))
  );
}

interface CustomRequest extends Request {
  userId?: string;
}

function extractDayOrder(text: string): number | null {
  const dayOrderMatch = text.match(/Day Order:([1-5])/);
  if (dayOrderMatch && dayOrderMatch[1]) {
    return parseInt(dayOrderMatch[1]);
  }
  return null;
}

export async function Order(req: CustomRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user id not provided" });
    }
    const user = await User.findById(userId).exec();
    const OrderResponse = await axios.get(
      "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/WELCOME",
      {
        headers: {
          Accept: "*/*",
          Cookie: user?.cookies,
          Host: "academia.srmist.edu.in",
          Referer: "https://academia.srmist.edu.in/",
        },
      }
    );

    if (OrderResponse.status === 200 && OrderResponse.data) {
      const decodedHTML = decodeEncodedString(OrderResponse.data);
      const dayOrder = extractDayOrder(decodedHTML);
      if (dayOrder !== null) {
        res.status(200).json({ dayOrder });
      } else {
        console.log("Day Order not found");
        res.status(404).json({ error: "Day Order not found in the content" });
      }
    } else {
      res
        .status(OrderResponse.status)
        .json({ error: "HTML content not found or request failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching Day Order" });
  }
}
