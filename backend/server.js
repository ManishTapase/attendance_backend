import express from "express";
import dbConnect from "./Db.js";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from './router.js'
import mongoose from "mongoose";
const App = express();
dotenv.config(); // env
dbConnect(); // database connect
App.use(cors());
App.use(express.json());
// Routes
App.use("/api/user",userRoute );
const PORT =  5000 || 5000;
App.listen(PORT, () => {
  console.log("server is runnig on Port", PORT);
});
