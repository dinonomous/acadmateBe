import express from "express";
import { auth } from "../controllers/auth.controller";
import { SignOut } from "../controllers/Signout.controller";
import { verifyToken } from "../middleware/verifyToken.middleware";
import { checkAuth } from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", auth);
router.post("/signout", verifyToken as any, SignOut);
router.get("/checkAuth", verifyToken as any, checkAuth as any);

export default router;
