import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,

  // aur bhi hota hai , read acc to need .
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());

// import routers
import userRouter from "./routes/user.routes.js";
import healthCheckRouter from "./routes/healthchecker.routes.js";
import tweetRouter from "./routes/tweet.routes.js";

// handling routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/tweets", tweetRouter);

export { app };
