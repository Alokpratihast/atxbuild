import mongoose, { Schema, Document, models } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  dob: string;
  title: string;
  doj: string;
  email?: string;
  department: { type: String },
  phone: { type: String },
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    dob: { type: String, required: true },
    title: { type: String, required: true },
    doj: { type: String, required: true },
    department:{type: String, required: true},
    phone:{type:String},
    email: { type: String },
  },
  { timestamps: true }
);

const Employee = models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
export default Employee;
