import mongoose, { Schema, model, models } from "mongoose";

const HolidaySchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Diwali"
    date: { type: Date, required: true },   // Holiday date
    description: { type: String },          // Optional details
    isOptional: { type: Boolean, default: false }, // Optional holiday (Y/N)
  },
  { timestamps: true }
);

const Holiday = models.Holiday || model("Holiday", HolidaySchema);
export default Holiday;
