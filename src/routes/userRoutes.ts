import express from "express";
import { Attendance } from "../controllers/attendance.controller";
import { TimeTable } from "../controllers/timetable.controller";
import { Calendar } from "../controllers/calender.controller";
import { Order } from "../controllers/dayorder.controller";
import { Logs } from "../controllers/logs.controller";
import { verifyToken } from "../middleware/verifyToken.middleware";
const router = express.Router();

router.post("/attendance", verifyToken as any, Attendance);
router.post("/timetable", verifyToken as any, TimeTable);
router.post("/calendar", verifyToken as any, Calendar);
router.post("/order", verifyToken as any, Order);
router.get("/logs", verifyToken as any, Logs);

export default router;
