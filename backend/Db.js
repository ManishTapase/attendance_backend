import mongoose from "mongoose"

const dbConnect =async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error while connecting to Database ", error);
    }
}
export default dbConnect;
