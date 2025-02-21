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
      type: Array,
      required: false,
      default: [],
    },
    calendar: {
      type: Object,
      default: {},
    },

    do: {
      type: Number,
      default: 0,
    },
    batch: {
      type: String,
      default: 0,
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
