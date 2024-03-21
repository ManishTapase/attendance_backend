import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.ObjectId,
      ref: "users",
      require: true,
    },
    record:{
      type:Array
    }
  },
  { timestamps: true }
);
export default mongoose.model("attendance", attendanceSchema);
