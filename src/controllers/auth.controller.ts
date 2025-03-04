import axios from "axios";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import { updateAttendance } from "../utils/updateAttendance";
import { updateTimetable } from "../utils/updateTimetable";
import { updateUnifiedtt } from "../utils/updateUnifiedtt";
import { updateCalender } from "../utils/updateCalendar";
import generateTimetable from "../utils/generateTimetable";

interface AuthProps {
  username: string;
  password: string;
}

interface extendedRequest extends Request {
  userId: string;
}

export const auth = async (req: Request, res: Response) => {
  try {
    const payload = req.body as AuthProps | null;
    console.log(payload);
    if (!payload || !payload.username || !payload.password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const { username, password } = payload;
    const lower_usr = username.toLowerCase();
    const new_usr = lower_usr.includes("@srmist.edu.in")
      ? lower_usr
      : lower_usr + "@srmist.edu.in";

    const cli_time = Date.now();
    const serviceurl =
      "https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin";
    const requestBody = `mode=primary&cli_time=${cli_time}&servicename=ZohoCreator&service_language=en&serviceurl=${serviceurl}`;

    const cookieGetResponseOne = await axios.get(
      "https://academia.srmist.edu.in/",
      {
        headers: {
          connection: "keep-alive",
          Referer: "https://academia.srmist.edu.in/",
        },
      }
    );

    const cookieGetResponseTwo = await axios.get(
      "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin",
      {
        headers: {
          connection: "keep-alive",
          Referer: "https://academia.srmist.edu.in/",
        },
      }
    );

    let allCookies: string[] = [];
    allCookies = allCookies.concat(
      cookieGetResponseOne.headers["set-cookie"] || []
    );
    allCookies = allCookies.concat(
      cookieGetResponseTwo.headers["set-cookie"] || []
    );

    const csrfCookie = allCookies.find((cookie) =>
      cookie.startsWith("iamcsr=")
    );
    const csrfToken = csrfCookie
      ? `iamcsrcoo=${csrfCookie.split("=")[1].split(";")[0]}`
      : "";

    const lookupResponse = await axios.post(
      `https://academia.srmist.edu.in/accounts/p/10002227248/signin/v2/lookup/${new_usr}`,
      requestBody,
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Cookie: allCookies.join("; "),
          "X-Zcsrf-Token": csrfToken,
        },
      }
    );

    const data = lookupResponse.data;

    if (data.message === "User exists") {
      const { identifier, digest } = data.lookup;
      const passwordUrl = `https://academia.srmist.edu.in/accounts/p/10002227248/signin/v2/primary/${identifier}/password?digest=${digest}&cli_time=${cli_time}&servicename=ZohoCreator&service_language=en&serviceurl=${serviceurl}`;
      const passwordBody = { passwordauth: { password } };

      const passwordResponse = await axios.post(passwordUrl, passwordBody, {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json;charset=UTF-8",
          Cookie: allCookies.join("; "),
          "X-Zcsrf-Token": csrfToken,
        },
      });

      allCookies = allCookies.concat(
        passwordResponse.headers["set-cookie"] || []
      );
      const passwordData = passwordResponse.data;

      if (
        passwordData.message === "Sign in success" ||
        passwordData.message ===
          "SignIn success with post announcement redirection"
      ) {
        let user = await User.findOne({ email: new_usr });

        if (user) {
          user.cookies = allCookies.join("; ");
          user.lastUpdated = new Date();
          await user.save();
        } else {
          user = await User.create({
            email: new_usr,
            cookies: allCookies.join("; "),
            lastUpdated: Date.now(),
          });
        }

        generateTokenAndSetCookie(res, user._id.toString());

        console.log(
          "Success: User authenticated and updated/created in the database"
        );

        await Promise.all([
          updateAttendance(user._id, user.cookies, user.att),
          updateCalender(user._id, user.cookies),
        ]);

        const Batch = await User.findById(user._id).select("batch");
        if (Batch) {
          await updateUnifiedtt(user._id, user.cookies, Batch.batch);
        }
        const timetableData = await updateTimetable(user._id, user.cookies);
        const unifiedttData = Batch
          ? await updateUnifiedtt(user._id, user.cookies, Batch.batch)
          : null;
        if (timetableData && unifiedttData) {
          await generateTimetable(user._id, timetableData, unifiedttData || []);
        } else {
          console.error(`Timetable data is undefined for user ${user._id}`);
        }

        await User.findByIdAndUpdate(
          user._id,
          { $set: { lastUpdated: new Date() } },
          { new: true }
        );
        res.status(200).json({ message: "Sign in success" });
      } else {
        console.log("User lookup failed:", data.message);
        res.status(404).json({ message: data.message });
      }
    } else {
      res.status(404).json({ error: "User doesn't exist" });
    }
  } catch (err: any) {
    console.error("Error in auth function:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const checkAuth = async (req: extendedRequest, res: Response) => {
  try {
    const userId = req.userId;
    console.log(userId);
    if (!userId) {
      res.clearCookie("token");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ _id: userId });
    console.log(user);
    if (!user) {
      res.clearCookie("token");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ success: false, message: errorMessage });
  }
};
