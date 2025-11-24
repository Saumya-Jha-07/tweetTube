import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
    app.on("error", (err) => console.error("Unexpected error : ", err));
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log("Server is listening on port : ", port));
  })
  .catch((err) => {
    console.log(`MongoDB connection failed : ${err}`);
  });
