import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import cookieParser from "cookie-parser";

const app = express();
app.set("trust proxy", 1);

const frontend = process.env.FE_URL;
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [
  "https://acadbud.vercel.app",
  "http://localhost:3000",
  "https://acadmate.in",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        return callback(new Error(`CORS policy: ${origin} not allowed`), false);
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Up nd Running!!");
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
