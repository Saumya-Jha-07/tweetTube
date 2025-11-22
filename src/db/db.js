import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export default async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!DB_NAME) throw new Error("DB name constant is empty!");
  if (!MONGODB_URI) throw new Error("Mongodb URI in env variables is empty!");

  const DB_URI = `${MONGODB_URI}/${DB_NAME}`;

  try {
    const connectionInstance = await mongoose.connect(DB_URI);
    console.log(connectionInstance);
    console.log(
      `MongoDB connected succesfully || Db host : ${connectionInstance.connection.host}`,
    );
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // exit with error
  }
}
