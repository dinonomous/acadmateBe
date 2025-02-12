import cron from "node-cron";
import { User } from "../models/user.model";
import { updateAttendance } from "../utils/updateAttendance";
import { updateTimetable } from "../utils/updateTimetable";
import { updateUnifiedtt } from "../utils/updateUnifiedtt";
import { sendUpdate } from "../mail/notification";
const update = async () => {
  try {
    const thresholdTime = new Date(Date.now() - 2 * 60 * 1000);
    const users = await User.find({
      lastUpdated: { $lt: thresholdTime },
    }).select("_id cookies lastUpdated batch");

    for (const user of users) {
      try {
        await Promise.all([
          updateAttendance(user._id, user.cookies),
          updateTimetable(user._id, user.cookies),
        ]);
        await updateUnifiedtt(user._id, user.cookies, user.batch);

        await User.findByIdAndUpdate(
          user._id,
          { $set: { lastUpdated: new Date() } },
          { new: true }
        );

        console.log(`Updated data for user ${user._id}`);
      } catch (userErr) {
        console.error(`Error updating user ${user._id}:`, userErr);

        await User.findByIdAndUpdate(
          user._id,
          { $set: { lastUpdated: new Date() } },
          { new: true }
        );
      }
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
  }
};

// Schedule the cron job to run every minute.
cron.schedule("*/1 * * * *", update);
