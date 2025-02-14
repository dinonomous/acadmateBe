import cron from "node-cron";
import { User } from "../models/user.model";
import { updateAttendance } from "../utils/updateAttendance";
import { updateTimetable } from "../utils/updateTimetable";
import { updateUnifiedtt } from "../utils/updateUnifiedtt";
import { updateCalender } from "../utils/updateCalendar";
// import { sendUpdate } from "../mail/notification";

const update = async () => {
  try {
    const thresholdTime = new Date(Date.now() - 60 * 60 * 1000);
    const calendarThresholdTime = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const users = await User.find({
      lastUpdated: { $lt: thresholdTime },
    }).select("_id cookies lastUpdated batch calendarLastUpdated");

    for (const user of users) {
      try {
        const updatePromises = [
          updateAttendance(user._id, user.cookies),
          updateTimetable(user._id, user.cookies),
          updateUnifiedtt(user._id, user.cookies, user.batch),
        ];
        if (user.CalendarlastUpdated < calendarThresholdTime) {
          updatePromises.push(updateCalender(user._id, user.cookies));
        }

        await Promise.all(updatePromises);
        const updateFields: any = { lastUpdated: new Date() };
        if (user.CalendarlastUpdated < calendarThresholdTime) {
          updateFields.calendarLastUpdated = new Date();
        }

        await User.findByIdAndUpdate(
          user._id,
          { $set: updateFields },
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

cron.schedule("0 * * * *", () => {
  console.log(`Cron job triggered at ${new Date().toISOString()}`);
  update();
});
