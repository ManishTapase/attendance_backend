import attendanceModel from "./attendancemodel.js";
import userModel from "./userModel.js";
import dotenv from "dotenv";
dotenv.config();
import JWT from "jsonwebtoken";
import { compareHashPass, hashPassword } from "./authHelper.js";
export const registerController = async (req, res) => {
  const { name, email, password, phone, address, answer, role } = req.body;
  if (!name) {
    return res.send({ message: "Name is Required!" });
  }
  if (!email) {
    return res.send({ message: "Email is Required!" });
  }
  if (!password) {
    return res.send({ message: "Password is Required!" });
  }
  if (!answer) {
    return res.send({ message: "Answer is Required!" });
  }
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(200).send({
      success: true,
      message: "A User with this Email already exists",
    });
  }

  const hashedPassword = await hashPassword(password);
  const user = await new userModel({
    name,
    email,
    password: hashedPassword,
    answer,
  }).save();

  res.status(200).send({
    success: true,
    message: "User Register Successfully...!",
    user,
  });
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(405).send({
        success: false,
        message: "No such user found in dectionary",
      });
    }

    const match = compareHashPass(password, user.password);
    if (!match) {
      return res.status(418).send({
        success: false,
        message: "Incorrect Password Provided...",
      });
    }
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SCRETE);
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(406).send({
      success: false,
      message: "Error while login user..",
      error,
    });
  }
};

export const forgotePasswordController = async (req, res) => {
  try {
    const { email, Newpassword, answer } = req.body;
    if (!email || !Newpassword || !answer) {
      return res.status(403).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    let checkEmail = await userModel.findOne({ email });
    if (!checkEmail) {
      return res.status(409).send({
        success: false,
        message: "User with this email not registered yet",
      });
    }
    //check answer
    let user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(410).send({
        success: false,
        message: "Your Answer is incorrect please enter correct one",
      });
    }
    let hashedPass = await hashPassword(Newpassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPass });
    return res.status(200).send({
      success: true,
      message: "your password has been changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(411).send({
      success: false,
      message: "there was an error while changing your password",
      error,
    });
  }
};

export const setUserAttendanceController = async (req, res) => {
  try {
    // Extract data from request body
    const { name, date, status } = req.body;
    // Data validation (consider adding Joi or similar library)
    if (!name) {
      return res.status(400).send({ message: "Name is required" });
    }
    if (!date) {
      return res.status(400).send({ message: "Date is required" });
    }
    if (!status) {
      return res.status(400).send({ message: "Status is required" });
    }
    // Create attendance object
    const attendanceData = { date, status };
    // Find existing attendance record
    const existingAttendance = await attendanceModel.findOne({ name });
    if (!existingAttendance) {
      // Create a new attendance record
      const newAttendance = new attendanceModel({
        name,
        record: [attendanceData],
      });
      const savedAttendance = await newAttendance.save();
      return res.status(201).send({
        success: true,
        message: "User attendance created successfully!",
        attendance: savedAttendance,
      });
    }

    // Update existing attendance record
    existingAttendance.record.push(attendanceData);
    await existingAttendance.save();
    return res.status(200).send({
      success: true,
      message: "User attendance updated successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while setting attendance",
    });
  }
};

export const getUserAttendanceController = async (req, res) => {
  try {
   
    const { name } = req.params; 
 
    if (!name) {
      return res.status(400).send({ message: "Name is required" });
    }

    const attendance = await attendanceModel.findOne({ name });

    if (!attendance) {
      return res.status(404).send({ message: "User attendance not found" });
    }

    // Extract attendance dates
    const attendanceDates = attendance.record.map((record) => record.date);

    return res.status(200).send({
      success: true,
      message: "Attendance dates retrieved successfully",
      attendanceDates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while getting attendance dates",
    });
  }
};

export const deleteAttendanceDate = async (req, res) => {
  try {
   
    const {name} = req.params;
    const {val} = req.body;
    const attendance = await attendanceModel.findOne({name});
    if (!attendance) {
      throw new Error("User attendance record not found");
    }
    const index = attendance.record.findIndex(
      (record) => record.date === val
    );
    if (index !== -1) {
      attendance.record.splice(index, 1);
    
      await attendance.save();
      return res
        .status(200)
        .send({ success: true, message: "Date deleted successfully" });
    } else {
      return res
        .status(401)
        .send({
          success: false,
          message: "Date not found in user's attendance",
        });
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error deleting date" }; 
  }
};
