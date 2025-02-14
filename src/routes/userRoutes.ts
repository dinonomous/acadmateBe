import express from "express";
import { Attendance } from "../controllers/attendance.controller";
import { TimeTable } from "../controllers/timetable.controller";
import { Calendar } from "../controllers/calender.controller";
import { UnifiedTimeTable } from "../controllers/UnifiedTimetable.controller";
import { Order } from "../controllers/dayorder.controller";
import { verifyToken } from "../middleware/verifyToken.middleware";
const router = express.Router();

router.post("/attendance", verifyToken as any, Attendance);
router.post("/timetable", verifyToken as any, TimeTable);
router.post("/calendar", verifyToken as any, Calendar);
router.post("/unifiedtimetable", verifyToken as any, UnifiedTimeTable);
router.post("/order", verifyToken as any, Order);

export default router;
