import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    cookies: {
      type: String,
      default: "",
    },
    att: {
      type: Object,
      required: false,
      default: {},
    },
    timetable: {
      type: Object,
      required: false,
      default: {},
    },
    calendar: {
      type: Object,
      default: {},
    },
    unifiedtt: {
      type: Object,
      default: {},
    },
    do: {
      type: Number,
      default: 0,
    },
    batch: {
      type: String,
      default: 1,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    CalendarlastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("user", userSchema);
